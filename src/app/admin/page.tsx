import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminWrapper from "./admin-wrapper"

// Check if user is admin
async function checkAdminAccess(userId: string) {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })

  return userWithRoles?.roles.some(ur => ur.role.name === 'admin') ?? false
}

// Get dashboard statistics
async function getDashboardStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalFiles,
      totalStorage,
      recentUsers,
      systemStats
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Active users count
      prisma.user.count({
        where: {
          isActive: true,
          accountStatus: 'active'
        }
      }),
      
      // Total files count
      prisma.file.count(),
      
      // Total storage usage
      prisma.user.aggregate({
        _sum: {
          usedStorageBytes: true
        }
      }),
      
      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // System storage stats
      prisma.user.aggregate({
        _sum: {
          storageQuotaBytes: true,
          usedStorageBytes: true
        }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalFiles,
      totalStorage: totalStorage._sum.usedStorageBytes || BigInt(0),
      recentUsers,
      systemStats: {
        totalQuota: systemStats._sum.storageQuotaBytes || BigInt(0),
        usedStorage: systemStats._sum.usedStorageBytes || BigInt(0),
        storageUtilization: systemStats._sum.storageQuotaBytes ? 
          Math.round((Number(systemStats._sum.usedStorageBytes || BigInt(0)) / Number(systemStats._sum.storageQuotaBytes)) * 100) : 0
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      totalFiles: 0,
      totalStorage: BigInt(0),
      recentUsers: 0,
      systemStats: {
        totalQuota: BigInt(0),
        usedStorage: BigInt(0),
        storageUtilization: 0
      }
    }
  }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Get user with roles for both admin check and layout
  const userWithRoles = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })

  if (!userWithRoles) {
    redirect('/sign-in')
  }

  // Check admin access
  const isAdmin = userWithRoles.roles.some(ur => ur.role.name === 'admin')
  if (!isAdmin) {
    redirect('/profile') // Redirect non-admin users
  }

  // Get dashboard statistics
  const stats = await getDashboardStats()

  // Convert BigInt to strings for JSON serialization
  const serializedStats = {
    ...stats,
    totalStorage: stats.totalStorage.toString(),
    systemStats: {
      ...stats.systemStats,
      totalQuota: stats.systemStats.totalQuota.toString(),
      usedStorage: stats.systemStats.usedStorage.toString()
    }
  }

  // Prepare user data for client components
  const userData = {
    id: userWithRoles.id,
    name: userWithRoles.name,
    email: userWithRoles.email,
    avatar: userWithRoles.image
  }

  return (
    <AdminWrapper 
      initialStats={serializedStats} 
      userRoles={userWithRoles.roles}
      user={userData}
    />
  )
}