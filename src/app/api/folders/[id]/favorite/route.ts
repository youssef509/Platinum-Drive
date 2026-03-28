import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/folders/[id]/favorite - Toggle favorite status for folder
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if folder exists and user owns it
    const folder = await prisma.folder.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        isFavorite: true
      }
    })

    if (!folder) {
      return NextResponse.json(
        { error: "المجلد غير موجود" },
        { status: 404 }
      )
    }

    if (folder.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل هذا المجلد" },
        { status: 403 }
      )
    }

    // Toggle favorite status
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        isFavorite: !folder.isFavorite
      },
      select: {
        id: true,
        isFavorite: true
      }
    })

    return NextResponse.json({
      success: true,
      isFavorite: updatedFolder.isFavorite,
      message: updatedFolder.isFavorite ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة"
    })
  } catch (error) {
    console.error("Toggle folder favorite error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المفضلة" },
      { status: 500 }
    )
  }
}
