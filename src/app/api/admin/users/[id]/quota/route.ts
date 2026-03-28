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
    const { quotaBytes, reason } = body

    if (!quotaBytes || quotaBytes <= 0) {
      return errorResponse("الحصة يجب أن تكون أكبر من صفر", 400)
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { storageQuotaBytes: true },
    })

    if (!currentUser) {
      return errorResponse("المستخدم غير موجود", 404)
    }

    // Update user quota
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { storageQuotaBytes: BigInt(quotaBytes) },
      select: {
        id: true,
        email: true,
        name: true,
        storageQuotaBytes: true,
        usedStorageBytes: true,
      },
    })

    // Create quota history entry
    await prisma.quotaHistory.create({
      data: {
        userId: id,
        previousQuota: currentUser.storageQuotaBytes,
        newQuota: BigInt(quotaBytes),
        changedBy: user.id,
        reason: reason || "تحديث بواسطة المسؤول",
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_QUOTA_UPDATED",
        targetType: "User",
        targetId: id,
        payload: {
          previousQuota: currentUser.storageQuotaBytes.toString(),
          newQuota: quotaBytes.toString(),
          reason,
        },
      },
    })

    return successResponse({
      message: "تم تحديث حصة المستخدم بنجاح",
      user: {
        ...updatedUser,
        storageQuotaBytes: updatedUser.storageQuotaBytes.toString(),
        usedStorageBytes: updatedUser.usedStorageBytes.toString(),
      },
    })
  } catch (error) {
    console.error("Update user quota error:", error)
    return errorResponse("خطأ في تحديث حصة المستخدم", 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isAdmin: admin, user } = await isAdminUser();
    if (!admin || !user) return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403);

    // Get quota history
    const history = await prisma.quotaHistory.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return successResponse({ history })
  } catch (error) {
    console.error("Get quota history error:", error)
    return errorResponse("خطأ في جلب سجل الحصة", 500)
  }
}
