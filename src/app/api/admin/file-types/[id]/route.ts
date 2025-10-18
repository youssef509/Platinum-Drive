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

    const updateData: any = { updatedBy: session.user.id }
    
    if (body.isAllowed !== undefined) updateData.isAllowed = body.isAllowed
    if (body.maxFileSize !== undefined) {
      updateData.maxFileSize = body.maxFileSize ? BigInt(body.maxFileSize) : null
    }
    if (body.requiresApproval !== undefined) updateData.requiresApproval = body.requiresApproval
    if (body.scanOnUpload !== undefined) updateData.scanOnUpload = body.scanOnUpload
    if (body.generatePreview !== undefined) updateData.generatePreview = body.generatePreview
    if (body.convertFormat !== undefined) updateData.convertFormat = body.convertFormat
    if (body.displayName !== undefined) updateData.displayName = body.displayName
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.color !== undefined) updateData.color = body.color
    if (body.extension !== undefined) updateData.extension = body.extension
    if (body.category !== undefined) updateData.category = body.category

    const policy = await prisma.fileTypePolicy.update({
      where: { id: parseInt(id) },
      data: updateData,
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "FILE_TYPE_POLICY_UPDATED",
        targetType: "FileTypePolicy",
        targetId: id,
        payload: { updates: updateData },
      },
    })

    return successResponse({
      message: "تم تحديث سياسة نوع الملف بنجاح",
      policy: {
        ...policy,
        maxFileSize: policy.maxFileSize?.toString(),
      },
    })
  } catch (error) {
    console.error("Update file type policy error:", error)
    return errorResponse("خطأ في تحديث سياسة نوع الملف", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || !session.user || !(await isAdmin(session.user.id))) {
      return errorResponse("غير مصرح - صلاحيات المسؤول مطلوبة", 403)
    }

    await prisma.fileTypePolicy.delete({
      where: { id: parseInt(id) },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "FILE_TYPE_POLICY_DELETED",
        targetType: "FileTypePolicy",
        targetId: id,
      },
    })

    return successResponse({ message: "تم حذف سياسة نوع الملف بنجاح" })
  } catch (error) {
    console.error("Delete file type policy error:", error)
    return errorResponse("خطأ في حذف سياسة نوع الملف", 500)
  }
}
