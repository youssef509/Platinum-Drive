import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const fileId = id

    // Get file record
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        size: true,
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'الملف غير موجود' },
        { status: 404 }
      )
    }

    // Check ownership
    if (file.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: 'غير مصرح بحذف هذا الملف' },
        { status: 403 }
      )
    }

    // Soft delete - mark as deleted (move to trash)
    await prisma.file.update({
      where: { id: fileId },
      data: {
        deletedAt: new Date(),
      },
    })

    // Update user's storage usage
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        usedStorageBytes: {
          decrement: BigInt(file.size),
        },
      },
    })

    // Send file deleted notification
    const { notifyFileDeleted } = await import('@/lib/services/notification')
    await notifyFileDeleted(dbUser.id, file.name).catch(err =>
      console.error('Failed to send delete notification:', err)
    )

    return NextResponse.json({
      success: true,
      message: 'تم نقل الملف إلى سلة المحذوفات',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'فشل حذف الملف' },
      { status: 500 }
    )
  }
}
