import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { calculateLinkExpiry, getDefaultSharePermission, getDefaultLinkExpiry } from '@/lib/security/security-utils'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { fileId, expiresIn, password, permission, notes } = body
    
    // Get user's default settings
    const defaultPermission = await getDefaultSharePermission(session.user.id)
    const defaultExpiry = await getDefaultLinkExpiry(session.user.id)

    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
    }

    if (file.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح بمشاركة هذا الملف' }, { status: 403 })
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Calculate expiration date using user's default or provided value
    let expiresAt: Date | null = null
    if (expiresIn) {
      // Use provided expiry
      if (expiresIn !== 'never') {
        const now = new Date()
        switch (expiresIn) {
          case '1h':
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000)
            break
          case '1d':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          case '7d':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            break
        }
      }
    } else {
      // Use user's default setting
      expiresAt = calculateLinkExpiry(defaultExpiry)
    }

    // Hash password if provided
    let passwordHash: string | null = null
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Create shared link with user's default permission if not provided
    const sharedLink = await prisma.sharedLink.create({
      data: {
        fileId,
        token,
        createdById: session.user.id,
        expiresAt,
        passwordHash,
        permission: permission || defaultPermission || 'read',
        notes: notes || null,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
          },
        },
      },
    })

    // Generate shareable URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${token}`

    return NextResponse.json({
      sharedLink: {
        ...sharedLink,
        shareUrl,
      },
      message: 'تم إنشاء رابط المشاركة بنجاح',
    })
  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { error: 'فشل إنشاء رابط المشاركة' },
      { status: 500 }
    )
  }
}

// Get all share links for a file
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'معرف الملف مطلوب' }, { status: 400 })
    }

    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file || file.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Get all active share links for this file
    const sharedLinks = await prisma.sharedLink.findMany({
      where: {
        fileId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add share URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const linksWithUrls = sharedLinks.map((link: { token: string; passwordHash: string | null }) => ({
      ...link,
      shareUrl: `${baseUrl}/share/${link.token}`,
      hasPassword: !!link.passwordHash,
      passwordHash: undefined, // Don't send hash to client
    }))

    return NextResponse.json({ sharedLinks: linksWithUrls })
  } catch (error) {
    console.error('Get shared links error:', error)
    return NextResponse.json(
      { error: 'فشل تحميل روابط المشاركة' },
      { status: 500 }
    )
  }
}
