import { NextRequest, NextResponse } from "next/server"
import { isAdminUser } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin: admin, user } = await isAdminUser();
    if (!admin || !user) {
      return NextResponse.json({ error: "غير مصرح - صلاحيات المسؤول مطلوبة" }, { status: 403 });
    }

    // Get dashboard statistics
    const [
      totalUsers,
      activeUsers,
      totalFiles,
      totalStorage,
      recentUsers,
      systemStats,
      recentLogins,
      topUsers
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
      }),

      // Recent login attempts (last 24 hours)
      prisma.loginHistory.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Top users by storage usage
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          usedStorageBytes: true
        },
        orderBy: {
          usedStorageBytes: 'desc'
        },
        take: 5
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalFiles,
      totalStorage: totalStorage._sum.usedStorageBytes || BigInt(0),
      recentUsers,
      recentLogins,
      systemStats: {
        totalQuota: systemStats._sum.storageQuotaBytes || BigInt(0),
        usedStorage: systemStats._sum.usedStorageBytes || BigInt(0),
        storageUtilization: systemStats._sum.storageQuotaBytes ?
          Math.round((Number(systemStats._sum.usedStorageBytes || BigInt(0)) / Number(systemStats._sum.storageQuotaBytes)) * 100) : 0
      },
      topUsers: topUsers.map((user: { usedStorageBytes: bigint } & Record<string, any>) => ({
        ...user,
        usedStorageBytes: user.usedStorageBytes.toString() // Convert BigInt to string for JSON
      }))
    }

    return NextResponse.json({
      stats: {
        ...stats,
        totalStorage: stats.totalStorage.toString(),
        systemStats: {
          ...stats.systemStats,
          totalQuota: stats.systemStats.totalQuota.toString(),
          usedStorage: stats.systemStats.usedStorage.toString()
        }
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: "فشل في تحميل إحصائيات لوحة التحكم" },
      { status: 500 }
    )
  }
}
