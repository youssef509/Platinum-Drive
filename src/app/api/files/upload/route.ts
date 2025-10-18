import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import {
  isValidFileType,
  isValidFileSize,
  generateUniqueFilename,
  sanitizeFilename,
  FILE_SIZE_LIMITS,
} from '@/lib/file-utils'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Get user with storage info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        usedStorageBytes: true,
        storageQuotaBytes: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        { error: `نوع الملف غير مدعوم: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: `حجم الملف يجب أن يكون أقل من ${FILE_SIZE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Check storage quota
    const newUsedStorage = Number(user.usedStorageBytes) + file.size
    if (newUsedStorage > Number(user.storageQuotaBytes)) {
      return NextResponse.json(
        { error: 'تجاوزت المساحة التخزينية المتاحة' },
        { status: 400 }
      )
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { ownerId: true },
      })

      if (!folder || folder.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'المجلد غير موجود أو غير مصرح به' },
          { status: 403 }
        )
      }
    }

    // Prepare file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const sanitizedName = sanitizeFilename(file.name)
    const uniqueFilename = generateUniqueFilename(sanitizedName)

    // Create user directory if not exists
    const userDir = join(process.cwd(), 'public', 'uploads', 'files', user.id)
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true })
    }

    // Save file to disk
    const filePath = join(userDir, uniqueFilename)
    const relativePath = `/uploads/files/${user.id}/${uniqueFilename}`
    
    await writeFile(filePath, buffer)

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        ownerId: user.id,
        folderId: folderId || null,
        size: file.size,
        mimeType: file.type,
        storageKey: relativePath,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update user's used storage
    await prisma.user.update({
      where: { id: user.id },
      data: {
        usedStorageBytes: {
          increment: BigInt(file.size),
        },
      },
    })

    // Return success response
    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        createdAt: fileRecord.createdAt,
        folder: fileRecord.folder,
        url: relativePath,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'فشل رفع الملف' },
      { status: 500 }
    )
  }
}
