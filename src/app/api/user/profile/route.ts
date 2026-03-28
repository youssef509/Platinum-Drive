import { NextRequest } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { updateProfileSchema } from "@/lib/validations/schemas"
import { validationErrorResponse, errorResponse, successResponse } from "@/lib/api/api-utils"
import { ZodError } from "zod"

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return errorResponse("Unauthorized", 401)
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()

    // Validate input with Zod
    const validatedData = updateProfileSchema.parse(body)

    // If email is being updated, check if it's already in use
    if (validatedData.email && validatedData.email !== dbUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return errorResponse("البريد الإلكتروني مستخدم بالفعل", 400)
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        updatedAt: true,
      },
    })

    return successResponse({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error("Profile update error:", error)
    return errorResponse("Internal server error", 500)
  }
}
