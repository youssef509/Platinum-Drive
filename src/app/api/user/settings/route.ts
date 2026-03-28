import { NextRequest } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { errorResponse, successResponse } from "@/lib/api/api-utils"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return errorResponse("غير مصرح", 401)
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return errorResponse("غير مصرح", 401)
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: dbUser.id },
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: dbUser.id,
        },
      })
    }

    return successResponse({ settings })
  } catch (error) {
    console.error("Get user settings error:", error)
    return errorResponse("خطأ في جلب الإعدادات", 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return errorResponse("غير مصرح", 401)
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return errorResponse("غير مصرح", 401)
    }

    const body = await request.json()

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: dbUser.id },
      update: body,
      create: {
        userId: dbUser.id,
        ...body,
      },
    })

    return successResponse({
      message: "تم تحديث الإعدادات بنجاح",
      settings,
    })
  } catch (error) {
    console.error("Update user settings error:", error)
    return errorResponse("خطأ في تحديث الإعدادات", 500)
  }
}
