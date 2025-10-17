import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Count users and roles
    const userCount = await prisma.user.count()
    const roleCount = await prisma.role.count()
    const roles = await prisma.role.findMany()
    
    return NextResponse.json({
      status: "ok",
      message: "Authentication backend is ready!",
      database: {
        connected: true,
        users: userCount,
        roles: roleCount,
        availableRoles: roles.map(r => r.name),
      },
      endpoints: {
        register: "/api/auth/register",
        signIn: "/api/auth/signin",
        signOut: "/api/auth/signout",
        session: "/api/auth/session",
        me: "/api/auth/me",
      },
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
