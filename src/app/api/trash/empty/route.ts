import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE - Empty entire trash (permanently delete all trashed files)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Find all trashed files for this user
    const trashedFiles = await prisma.file.findMany({
      where: {
        ownerId: dbUser.id,
        deletedAt: { not: null },
      },
    })

    if (trashedFiles.length === 0) {
      return NextResponse.json({
        message: 'سلة المحذوفات فارغة بالفعل',
        deletedCount: 0,
      })
    }

    // Calculate total size to free up
    const totalSize = trashedFiles.reduce((sum: bigint, file: { size: number }) => sum + BigInt(file.size), BigInt(0))

    // Delete files from disk
    let deletedFromDisk = 0
    for (const file of trashedFiles) {
      const filePath = join(process.cwd(), 'public', file.storageKey)
      try {
        await unlink(filePath)
        deletedFromDisk++
      } catch (error) {
        console.warn(`Could not delete file from disk: ${file.storageKey}`, error)
      }
    }

    // Delete all from database
    const deleteResult = await prisma.file.deleteMany({
      where: {
        ownerId: dbUser.id,
        deletedAt: { not: null },
      },
    })

    // Update user's used storage
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        usedStorageBytes: {
          decrement: BigInt(totalSize),
        },
      },
    })

    return NextResponse.json({
      message: 'تم إفراغ سلة المحذوفات بنجاح',
      deletedCount: deleteResult.count,
      freedSpace: totalSize,
    })
  } catch (error) {
    console.error('Error emptying trash:', error)
    return NextResponse.json(
      { error: 'فشل إفراغ سلة المحذوفات' },
      { status: 500 }
    )
  }
}
