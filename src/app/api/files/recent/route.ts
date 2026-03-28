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
    const days = parseInt(searchParams.get('days') || '7') // Default: last 7 days
    const limit = parseInt(searchParams.get('limit') || '10') // Default: 10 files

    // Calculate date threshold
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Fetch recent files
    const files = await prisma.file.findMany({
      where: {
        ownerId: dbUser.id,
        deletedAt: null,
        createdAt: {
          gte: dateThreshold,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({
      files,
      days,
      count: files.length,
    })
  } catch (error) {
    console.error('Recent files error:', error)
    return NextResponse.json(
      { error: 'فشل تحميل الملفات الأخيرة' },
      { status: 500 }
    )
  }
}
