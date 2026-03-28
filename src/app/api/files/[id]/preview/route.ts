import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const fileId = params.id

    // Get auth
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get file from database
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        isArchived: false,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        storageKey: true,
        ownerId: true,
        size: true,
      },
    })

    if (!file) {
      return new NextResponse('File not found', { status: 404 })
    }

    if (file.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Blob storage (storageKey is a full URL) — redirect directly
    if (file.storageKey.startsWith('http')) {
      return NextResponse.redirect(file.storageKey)
    }

    // Fallback: local filesystem (development)
    const filePath = join(process.cwd(), 'public', file.storageKey)
    if (!existsSync(filePath)) {
      return new NextResponse('File not found on disk', { status: 404 })
    }
    const fileBuffer = await readFile(filePath)
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': file.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Preview error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
