import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get folder details
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

    const folderId = params.id

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            files: {
              where: {
                deletedAt: null,
              },
            },
            children: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'المجلد غير موجود' },
        { status: 404 }
      )
    }

    if (folder.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول إلى هذا المجلد' },
        { status: 403 }
      )
    }

    return NextResponse.json({ folder })
  } catch (error) {
    console.error('Error fetching folder:', error)
    return NextResponse.json(
      { error: 'فشل تحميل المجلد' },
      { status: 500 }
    )
  }
}

// PUT - Update folder (rename)
export async function PUT(
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

    const folderId = params.id
    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'اسم المجلد مطلوب' },
        { status: 400 }
      )
    }

    // Check ownership
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { ownerId: true },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'المجلد غير موجود' },
        { status: 404 }
      )
    }

    if (folder.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بتعديل هذا المجلد' },
        { status: 403 }
      )
    }

    // Update folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        name: name.trim(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      folder: updatedFolder,
    })
  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { error: 'فشل تحديث المجلد' },
      { status: 500 }
    )
  }
}

// DELETE - Delete folder
export async function DELETE(
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

    const folderId = params.id

    // Check ownership and get folder with counts
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            files: {
              where: {
                deletedAt: null,
              },
            },
            children: true,
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'المجلد غير موجود' },
        { status: 404 }
      )
    }

    if (folder.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بحذف هذا المجلد' },
        { status: 403 }
      )
    }

    // Check if folder is empty
    if (folder._count.files > 0 || folder._count.children > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف مجلد يحتوي على ملفات أو مجلدات فرعية' },
        { status: 400 }
      )
    }

    // Delete folder
    await prisma.folder.delete({
      where: { id: folderId },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المجلد بنجاح',
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'فشل حذف المجلد' },
      { status: 500 }
    )
  }
}
