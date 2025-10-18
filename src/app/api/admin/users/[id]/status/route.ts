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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    const body = await request.json()
    const { isActive, accountStatus, suspendedReason } = body

    // Prevent admin from suspending themselves
    if (id === session.user.id) {
      return errorResponse("لا يمكنك تعليق حسابك الخاص", 400)
    }

    const updateData: any = {}

    if (typeof isActive !== "undefined") {
      updateData.isActive = isActive
    }

    if (accountStatus) {
      updateData.accountStatus = accountStatus
      
      if (accountStatus === "suspended" || accountStatus === "disabled") {
        updateData.suspendedAt = new Date()
        updateData.suspendedBy = session.user.id
        if (suspendedReason) {
          updateData.suspendedReason = suspendedReason
        }
      } else if (accountStatus === "active") {
        updateData.suspendedAt = null
        updateData.suspendedBy = null
        updateData.suspendedReason = null
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        accountStatus: true,
        suspendedAt: true,
        suspendedReason: true,
        suspendedBy: true,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_STATUS_UPDATED",
        targetType: "User",
        targetId: id,
        payload: { updateData },
      },
    })

    return successResponse({
      message: "تم تحديث حالة المستخدم بنجاح",
      user,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    return errorResponse("خطأ في تحديث حالة المستخدم", 500)
  }
}
