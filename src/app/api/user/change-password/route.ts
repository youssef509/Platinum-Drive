import { NextRequest } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { hashPassword, comparePassword } from "@/lib/auth/auth-utils"
import { changePasswordSchema } from "@/lib/validations/schemas"
import { validationErrorResponse, errorResponse, successResponse } from "@/lib/api/api-utils"
import { ZodError } from "zod"
import { notifyPasswordChanged } from "@/lib/services/notification"
import { requiresReauth } from "@/lib/security/security-utils"

export async function POST(request: NextRequest) {
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

    // Validate input with Zod
    const validatedData = changePasswordSchema.parse(body)

    // Get current user with password and settings
    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: { 
        id: true, 
        password: true,
        settings: {
          select: {
            requireReauth: true
          }
        }
      },
    })

    if (!user || !user.password) {
      return errorResponse("المستخدم غير موجود", 404)
    }

    // Check if reauth is required
    const needsReauth = user.settings?.requireReauth ?? false
    
    // Always verify current password (required field in schema)
    const isValidPassword = await comparePassword(
      validatedData.currentPassword,
      user.password
    )

    if (!isValidPassword) {
      if (needsReauth) {
        return errorResponse("كلمة المرور الحالية غير صحيحة. التحقق من الهوية مطلوب لتغيير كلمة المرور.", 403)
      }
      return errorResponse("كلمة المرور الحالية غير صحيحة", 400)
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: hashedPassword },
    })

    // Send notification
    await notifyPasswordChanged(dbUser.id)

    return successResponse({
      message: "تم تغيير كلمة المرور بنجاح",
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error("Change password error:", error)
    return errorResponse("خطأ داخلي في الخادم", 500)
  }
}
