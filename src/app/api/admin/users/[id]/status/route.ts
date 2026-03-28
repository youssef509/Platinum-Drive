import { NextRequest } from "next/server"
import { isAdminUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { errorResponse, successResponse } from "@/lib/api/api-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isAdmin: admin, user } = await isAdminUser();
    if (!admin || !user) return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403);

    const body = await request.json()
    const { isActive, accountStatus, suspendedReason } = body

    // Prevent admin from suspending themselves
    if (id === user.id) {
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
        updateData.suspendedBy = user.id
        if (suspendedReason) {
          updateData.suspendedReason = suspendedReason
        }
      } else if (accountStatus === "active") {
        updateData.suspendedAt = null
        updateData.suspendedBy = null
        updateData.suspendedReason = null
      }
    }

    const updatedUser = await prisma.user.update({
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
        actorId: user.id,
        action: "USER_STATUS_UPDATED",
        targetType: "User",
        targetId: id,
        payload: { updateData },
      },
    })

    return successResponse({
      message: "تم تحديث حالة المستخدم بنجاح",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    return errorResponse("خطأ في تحديث حالة المستخدم", 500)
  }
}
