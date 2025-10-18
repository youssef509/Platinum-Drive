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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const { value, description, isPublic } = body

    const updateData: any = { updatedBy: session.user.id }
    if (value !== undefined) updateData.value = value
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const setting = await prisma.systemSettings.update({
      where: { key },
      data: updateData,
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SYSTEM_SETTING_UPDATED",
        targetType: "SystemSettings",
        targetId: setting.id,
        payload: { key, updates: updateData },
      },
    })

    return successResponse({
      message: "تم تحديث الإعداد بنجاح",
      setting,
    })
  } catch (error) {
    console.error("Update system setting error:", error)
    return errorResponse("خطأ في تحديث الإعداد", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SYSTEM_SETTING_DELETED",
        targetType: "SystemSettings",
        targetId: key,
        payload: { key },
      },
    })

    return successResponse({ message: "تم حذف الإعداد بنجاح" })
  } catch (error) {
    console.error("Delete system setting error:", error)
    return errorResponse("خطأ في حذف الإعداد", 500)
  }
}
