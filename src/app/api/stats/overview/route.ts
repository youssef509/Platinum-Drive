import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

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

    // Get total folders count
    const totalFolders = await prisma.folder.count({
      where: {
        ownerId: dbUser.id
      }
    })

    // Get total files count (excluding deleted)
    const totalFiles = await prisma.file.count({
      where: {
        ownerId: dbUser.id,
        deletedAt: null
      }
    })

    // Get total shared files count
    const totalShares = await prisma.sharedLink.count({
      where: {
        file: {
          ownerId: dbUser.id
        }
      }
    })

    return NextResponse.json({
      totalFolders,
      totalFiles,
      totalShares
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
