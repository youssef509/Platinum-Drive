import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

// GET /api/files/favorites - Get all favorite files and folders
export async function GET(request: NextRequest) {
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

    // Get favorite files
    const files = await prisma.file.findMany({
      where: {
        ownerId: dbUser.id,
        isFavorite: true,
        deletedAt: null
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get favorite folders
    const folders = await prisma.folder.findMany({
      where: {
        ownerId: dbUser.id,
        isFavorite: true
      },
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
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ files, folders })
  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الملفات المفضلة" },
      { status: 500 }
    )
  }
}
