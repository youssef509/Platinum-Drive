import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return errorResponse("غير مصرح", 401)
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = parseInt(searchParams.get("skip") || "0")

    // Fetch login history for the current user
    const loginHistory = await prisma.loginHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    })

    // Get total count for pagination
    const total = await prisma.loginHistory.count({
      where: {
        userId: session.user.id,
      },
    })

    return successResponse({
      loginHistory,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("Login history fetch error:", error)
    return errorResponse("خطأ في جلب سجل الدخول", 500)
  }
}
