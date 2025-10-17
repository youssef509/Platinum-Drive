import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      )
    }

    // Get current user data with roles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Extract role names
    const roleNames = user.roles.map(ur => ur.role.name)
    const primaryRole = roleNames.length > 0 ? roleNames[0] : 'USER'

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      roles: roleNames,
      role: primaryRole
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات المستخدم" },
      { status: 500 }
    )
  }
}