import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST /api/files/[id]/favorite - Toggle favorite status
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

    // Check if file exists and user owns it
    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        isFavorite: true
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: "الملف غير موجود" },
        { status: 404 }
      )
    }

    if (file.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل هذا الملف" },
        { status: 403 }
      )
    }

    // Toggle favorite status
    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        isFavorite: !file.isFavorite
      },
      select: {
        id: true,
        isFavorite: true
      }
    })

    return NextResponse.json({
      success: true,
      isFavorite: updatedFile.isFavorite,
      message: updatedFile.isFavorite ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة"
    })
  } catch (error) {
    console.error("Toggle favorite error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المفضلة" },
      { status: 500 }
    )
  }
}
