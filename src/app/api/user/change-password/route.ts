import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hashPassword, comparePassword } from "@/lib/auth-utils"
import { changePasswordSchema } from "@/lib/validations/schemas"
import { validationErrorResponse, errorResponse, successResponse } from "@/lib/api-utils"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()

    // Validate input with Zod
    const validatedData = changePasswordSchema.parse(body)

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      return errorResponse("User not found", 404)
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      validatedData.currentPassword,
      user.password
    )

    if (!isValidPassword) {
      return errorResponse("Current password is incorrect", 400)
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return successResponse({
      message: "Password changed successfully",
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error("Change password error:", error)
    return errorResponse("Internal server error", 500)
  }
}
