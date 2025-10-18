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
    const { name, email, storageQuotaBytes, role } = body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id }
        }
      })

      if (existingUser) {
        return errorResponse("البريد الإلكتروني مستخدم بالفعل", 400)
      }
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (storageQuotaBytes !== undefined) updateData.storageQuotaBytes = BigInt(storageQuotaBytes)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    // Update role if provided
    if (role) {
      // Get the role ID
      const roleRecord = await prisma.role.findFirst({
        where: { name: role }
      })

      if (roleRecord) {
        // Remove all existing roles
        await prisma.userRole.deleteMany({
          where: { userId: id }
        })

        // Add new role
        await prisma.userRole.create({
          data: {
            userId: id,
            roleId: roleRecord.id
          }
        })
      }
    }

    // Serialize BigInt fields
    const serializedUser = {
      ...updatedUser,
      storageQuotaBytes: updatedUser.storageQuotaBytes ? updatedUser.storageQuotaBytes.toString() : null,
      usedStorageBytes: updatedUser.usedStorageBytes ? updatedUser.usedStorageBytes.toString() : null,
    }

    return successResponse({
      message: "تم تحديث بيانات المستخدم بنجاح",
      user: serializedUser
    })
  } catch (error: any) {
    console.error("Update user error:", error)
    return errorResponse(error.message || "خطأ في تحديث بيانات المستخدم", 500)
  }
}
