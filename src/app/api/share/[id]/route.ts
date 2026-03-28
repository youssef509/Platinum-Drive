import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id: linkId } = await params

    // Get shared link with file ownership check
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { id: linkId },
      include: {
        file: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!sharedLink) {
      return NextResponse.json({ error: 'الرابط غير موجود' }, { status: 404 })
    }

    // Verify ownership
    if (sharedLink.file.ownerId !== dbUser.id) {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا الرابط' }, { status: 403 })
    }

    // Soft delete by marking as inactive
    await prisma.sharedLink.update({
      where: { id: linkId },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      message: 'تم إلغاء رابط المشاركة بنجاح',
    })
  } catch (error) {
    console.error('Delete shared link error:', error)
    return NextResponse.json(
      { error: 'فشل إلغاء رابط المشاركة' },
      { status: 500 }
    )
  }
}

// Get shared link details (for owner)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const linkId = id

    const sharedLink = await prisma.sharedLink.findUnique({
      where: { id: linkId },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
            ownerId: true,
          },
        },
      },
    })

    if (!sharedLink) {
      return NextResponse.json({ error: 'الرابط غير موجود' }, { status: 404 })
    }

    // Verify ownership
    if (sharedLink.file.ownerId !== dbUser.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    return NextResponse.json({
      sharedLink: {
        ...sharedLink,
        shareUrl: `${baseUrl}/share/${sharedLink.token}`,
        hasPassword: !!sharedLink.passwordHash,
        passwordHash: undefined,
      },
    })
  } catch (error) {
    console.error('Get shared link error:', error)
    return NextResponse.json(
      { error: 'فشل تحميل تفاصيل الرابط' },
      { status: 500 }
    )
  }
}
