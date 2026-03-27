import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    // Check maintenance mode setting
    const maintenanceSetting = await prisma.systemSettings.findUnique({
      where: { key: 'general.maintenanceMode' }
    })

    const isMaintenanceMode = maintenanceSetting?.value === 'true' || maintenanceSetting?.value === true

    // Check if user is admin
    const session = await auth()
    let isAdmin = false

    if (session?.user?.id) {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: session.user.id },
        include: { role: true }
      })
      
      isAdmin = userRoles.some((ur: { role: { name: string } }) => ur.role.name === 'admin')
    }

    return NextResponse.json({
      maintenanceMode: isMaintenanceMode,
      isAdmin
    })
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    return NextResponse.json(
      { maintenanceMode: false, isAdmin: false },
      { status: 500 }
    )
  }
}
