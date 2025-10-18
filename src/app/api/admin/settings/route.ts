import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-utils"

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  })

  return user?.roles.some((ur) => ur.role.name === "admin") || false
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: any = {}
    if (category) {
      where.category = category
    }

    const settings = await prisma.systemSettings.findMany({
      where,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    })

    // Convert array to object with key-value pairs
    const settingsObject = settings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    return successResponse({ settings: settingsObject })
  } catch (error) {
    console.error("Get system settings error:", error)
    return errorResponse("خطأ في جلب إعدادات النظام", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const { key, value, category, description, isPublic } = body

    if (!key || !value || !category) {
      return errorResponse("المفتاح والقيمة والفئة مطلوبة", 400)
    }

    const setting = await prisma.systemSettings.create({
      data: {
        key,
        value,
        category,
        description,
        isPublic: isPublic || false,
        updatedBy: session.user.id,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SYSTEM_SETTING_CREATED",
        targetType: "SystemSettings",
        targetId: setting.id,
        payload: { key, value, category },
      },
    })

    return successResponse({
      message: "تم إنشاء الإعداد بنجاح",
      setting,
    })
  } catch (error) {
    console.error("Create system setting error:", error)
    return errorResponse("خطأ في إنشاء الإعداد", 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return errorResponse("إعدادات غير صحيحة", 400)
    }

    // Update or create each setting
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // Determine category from key prefix
      const category = key.split('.')[0]
      
      return prisma.systemSettings.upsert({
        where: { key },
        update: {
          value: String(value),
          updatedBy: session.user.id,
        },
        create: {
          key,
          value: String(value),
          category,
          updatedBy: session.user.id,
        },
      })
    })

    await Promise.all(updatePromises)

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SYSTEM_SETTINGS_UPDATED",
        targetType: "SystemSettings",
        payload: { settingsCount: Object.keys(settings).length },
      },
    })

    return successResponse({
      message: "تم تحديث الإعدادات بنجاح",
    })
  } catch (error) {
    console.error("Update system settings error:", error)
    return errorResponse("خطأ في تحديث الإعدادات", 500)
  }
}
