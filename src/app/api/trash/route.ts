import { NextRequest, NextResponse } from 'next/server'
import { auth, getDbUser } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

// GET - List all trashed files
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'deletedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause - only get deleted files
    const where = {
      ownerId: dbUser.id,
      deletedAt: { not: null },
    }

    // Get total count
    const totalCount = await prisma.file.count({ where })

    // Get trashed files with pagination
    const files = await prisma.file.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate days until permanent deletion (30 days from deletion)
    const filesWithDaysRemaining = files.map((file: { deletedAt: Date | null }) => {
      const deletedDate = file.deletedAt ? new Date(file.deletedAt) : new Date()
      const permanentDeleteDate = new Date(deletedDate)
      permanentDeleteDate.setDate(permanentDeleteDate.getDate() + 30)

      const now = new Date()
      const daysRemaining = Math.ceil(
        (permanentDeleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        ...file,
        daysRemaining: Math.max(0, daysRemaining),
        permanentDeleteDate: permanentDeleteDate.toISOString(),
      }
    })

    return NextResponse.json({
      files: filesWithDaysRemaining,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching trash:', error)
    return NextResponse.json(
      { error: 'فشل تحميل سلة المحذوفات' },
      { status: 500 }
    )
  }
}
