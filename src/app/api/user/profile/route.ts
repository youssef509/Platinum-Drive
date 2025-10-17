import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validations/schemas"
import { validationErrorResponse, errorResponse, successResponse } from "@/lib/api-utils"
import { ZodError } from "zod"

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()

    // Validate input with Zod
    const validatedData = updateProfileSchema.parse(body)

    // If email is being updated, check if it's already in use
    if (validatedData.email && validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return errorResponse("البريد الإلكتروني مستخدم بالفعل", 400)
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
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
