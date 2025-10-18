import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return errorResponse("غير مصرح", 401)
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
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
    const session = await auth()

    if (!session || !session.user) {
      return errorResponse("غير مصرح", 401)
    }

    const body = await request.json()

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: body,
      create: {
        userId: session.user.id,
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
