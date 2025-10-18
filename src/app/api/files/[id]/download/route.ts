import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const fileId = params.id

    // Get file record from database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        storageKey: true,
        mimeType: true,
        size: true,
      },
    })

    if (!file) {
      return NextResponse.json(
        { error: 'الملف غير موجود' },
        { status: 404 }
      )
    }

    // Check if user owns the file
    if (file.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بتحميل هذا الملف' },
        { status: 403 }
      )
    }

    // Get file path
    const filePath = join(process.cwd(), 'public', file.storageKey)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'الملف غير موجود على الخادم' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Return file with proper headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': file.size.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'فشل تحميل الملف' },
      { status: 500 }
    )
  }
}
