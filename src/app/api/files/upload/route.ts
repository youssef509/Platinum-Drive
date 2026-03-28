import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import { put } from '@vercel/blob'
import {
  isValidFileType,
  isValidFileSize,
  generateUniqueFilename,
  sanitizeFilename,
  FILE_SIZE_LIMITS,
} from '@/lib/utils/file'
import { checkStorageWarning, notifyStorageWarning, notifyStorageFull } from '@/lib/services/notification'
import { compressImage, isProcessableImage } from '@/lib/utils/image'

// Configure route segment for large file uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    // Get user with storage info and settings
    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        id: true,
        usedStorageBytes: true,
        storageQuotaBytes: true,
        settings: {
          select: {
            defaultUploadFolder: true,
            autoGenerateThumbnails: true,
            compressImages: true,
            deduplicateFiles: true,
          },
        },
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

    // Validate file type against policy
    const fileTypePolicy = await prisma.fileTypePolicy.findUnique({
      where: { mimeType: file.type }
    })

    // Check if file type has a policy
    if (fileTypePolicy) {
      if (!fileTypePolicy.isAllowed) {
        return NextResponse.json(
          { error: `نوع الملف ${file.type} غير مسموح به` },
          { status: 400 }
        )
      }

      // Check file size against type-specific limit if exists
      if (fileTypePolicy.maxFileSize && file.size > Number(fileTypePolicy.maxFileSize)) {
        return NextResponse.json(
          { error: `حجم الملف يجب أن يكون أقل من ${Number(fileTypePolicy.maxFileSize) / 1024 / 1024}MB لهذا النوع` },
          { status: 400 }
        )
      }
    } else {
      // Fallback to legacy validation if no policy exists
      if (!isValidFileType(file.type)) {
        return NextResponse.json(
          { error: `نوع الملف غير مدعوم: ${file.type}` },
          { status: 400 }
        )
      }
    }

    // Get max file size from system settings (global limit)
    const maxFileSizeSetting = await prisma.systemSettings.findUnique({
      where: { key: 'upload.maxFileSize' }
    })
    const maxFileSize = maxFileSizeSetting?.value 
      ? (typeof maxFileSizeSetting.value === 'number' ? maxFileSizeSetting.value : parseInt(String(maxFileSizeSetting.value))) * 1024 * 1024
      : FILE_SIZE_LIMITS.MAX_FILE_SIZE

    // Validate file size against global system settings
    if (!isValidFileSize(file.size, maxFileSize)) {
      return NextResponse.json(
        { error: `حجم الملف يجب أن يكون أقل من ${maxFileSize / 1024 / 1024}MB` },
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

    // Check for duplicate files if deduplication is enabled
    if (user.settings?.deduplicateFiles) {
      const existingFile = await prisma.file.findFirst({
        where: {
          ownerId: user.id,
          name: file.name,
          size: file.size,
          deletedAt: null,
        },
        select: { id: true, name: true },
      })

      if (existingFile) {
        return NextResponse.json(
          { error: `الملف "${file.name}" موجود بالفعل` },
          { status: 409 }
        )
      }
    }

    // Use default folder from settings if no folder is specified
    let targetFolderId = folderId
    if (!targetFolderId && user.settings?.defaultUploadFolder && user.settings.defaultUploadFolder !== '/') {
      // Try to find or create the default folder
      const defaultFolder = await prisma.folder.findFirst({
        where: {
          ownerId: user.id,
          path: user.settings.defaultUploadFolder,
        },
        select: { id: true },
      })
      if (defaultFolder) {
        targetFolderId = defaultFolder.id
      }
    }

    // Verify folder ownership if folderId is provided
    if (targetFolderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: targetFolderId },
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
    let buffer: Buffer = Buffer.from(bytes)
    let finalFileSize = file.size

    // Image compression if enabled
    if (user.settings?.compressImages && isProcessableImage(file.type)) {
      try {
        const compressedBuffer = await compressImage(buffer, file.type)
        // Only use compressed version if it's actually smaller
        if (compressedBuffer.length < buffer.length) {
          buffer = Buffer.from(compressedBuffer)
          finalFileSize = compressedBuffer.length
          console.log(`Image compressed: ${file.size} -> ${finalFileSize} bytes`)
        }
      } catch (error) {
        console.error('Image compression failed, using original:', error)
      }
    }

    // Generate unique filename
    const sanitizedName = sanitizeFilename(file.name)
    const uniqueFilename = generateUniqueFilename(sanitizedName)

    // Upload to Vercel Blob
    const blob = await put(`files/${user.id}/${uniqueFilename}`, buffer, {
      access: 'public',
      contentType: file.type,
    })

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        ownerId: user.id,
        folderId: targetFolderId || null,
        size: finalFileSize,
        mimeType: file.type,
        storageKey: blob.url,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          compressed: user.settings?.compressImages && isProcessableImage(file.type),
          originalSize: file.size,
          thumbnail: null,
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

    // Update user's used storage (use finalFileSize after compression)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        usedStorageBytes: {
          increment: BigInt(finalFileSize),
        },
      },
    })

    // Check storage usage and send notification if needed
    const warningLevel = await checkStorageWarning(user.id)
    if (warningLevel) {
      if (warningLevel >= 100) {
        await notifyStorageFull(user.id)
      } else {
        await notifyStorageWarning(user.id, warningLevel)
      }
    }

    // Send file uploaded notification
    const { notifyFileUploaded } = await import('@/lib/services/notification')
    await notifyFileUploaded(user.id, file.name, file.size).catch(err =>
      console.error('Failed to send upload notification:', err)
    )

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
        url: blob.url,
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
