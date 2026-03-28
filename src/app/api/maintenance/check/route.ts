import { NextRequest, NextResponse } from "next/server"
import { auth, getDbUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    // Check maintenance mode setting
    const maintenanceSetting = await prisma.systemSettings.findUnique({
      where: { key: 'general.maintenanceMode' }
    })

    const isMaintenanceMode = maintenanceSetting?.value === 'true' || maintenanceSetting?.value === true

    // Check if user is admin (optional — no 401 if not logged in)
    const { userId } = await auth()
    let isAdmin = false

    if (userId) {
      const dbUser = await getDbUser()
      if (dbUser) {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: dbUser.id },
          include: { role: true }
        })

        isAdmin = userRoles.some((ur: { role: { name: string } }) => ur.role.name === 'admin')
      }
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
