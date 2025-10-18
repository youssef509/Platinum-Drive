import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List user's folders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    // Build where clause
    const where: any = {
      ownerId: session.user.id,
    }

    // Filter by parent folder
    if (parentId) {
      where.parentId = parentId
    } else {
      // Root folders only
      where.parentId = null
    }

    // Get folders
    const folders = await prisma.folder.findMany({
      where,
      include: {
        _count: {
          select: {
            files: {
              where: {
                deletedAt: null, // Only count non-deleted files
              },
            },
            children: true, // Count subfolders
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'فشل تحميل المجلدات' },
      { status: 500 }
    )
  }
}

// POST - Create new folder
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, parentId } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'اسم المجلد مطلوب' },
        { status: 400 }
      )
    }

    // Verify parent folder ownership if parentId provided
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
        select: { ownerId: true },
      })

      if (!parentFolder || parentFolder.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: 'المجلد الأب غير موجود أو غير مصرح به' },
          { status: 403 }
        )
      }
    }

    // Create folder
    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      folder,
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'فشل إنشاء المجلد' },
      { status: 500 }
    )
  }
}
