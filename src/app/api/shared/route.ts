import { NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get all shared links created by the user
    const [sharedLinks, totalCount] = await Promise.all([
      prisma.sharedLink.findMany({
        where: {
          file: {
            ownerId: dbUser.id,
          },
          isActive: true,
        },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              size: true,
              mimeType: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.sharedLink.count({
        where: {
          file: {
            ownerId: dbUser.id,
          },
          isActive: true,
        },
      }),
    ])

    // Format the response
    const formattedLinks = sharedLinks.map((link: {
      id: string;
      token: string;
       file: { id: string;
         name: string;
         size: number;
         mimeType: string;
         createdAt: Date }; createdAt: Date; expiresAt: Date | null; permission: string; maxDownloads: number | null; downloads: number; views: number; passwordHash: string | null; notes: string | null }) => ({
      id: link.id,
      token: link.token,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${link.token}`,
      file: link.file,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
      permission: link.permission,
      maxDownloads: link.maxDownloads,
      downloads: link.downloads,
      views: link.views,
      isProtected: !!link.passwordHash,
      notes: link.notes,
    }))

    return NextResponse.json({
      sharedLinks: formattedLinks,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error('Get shared links error:', error)
    return NextResponse.json(
      { error: 'فشل تحميل الروابط المشتركة' },
      { status: 500 }
    )
  }
}
