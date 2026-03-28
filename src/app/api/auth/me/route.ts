import { NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const dbUser = await getDbUser()
    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
