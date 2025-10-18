'use client'

import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('./admin-dashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  )
})

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalFiles: number
  totalStorage: string | bigint
  recentUsers: number
  systemStats: {
    totalQuota: string | bigint
    usedStorage: string | bigint
    storageUtilization: number
  }
}

interface AdminWrapperProps {
  initialStats: DashboardStats
  userRoles: Array<{ role: { name: string } }>
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

export default function AdminWrapper({ initialStats, userRoles, user }: AdminWrapperProps) {
  return <AdminDashboard initialStats={initialStats} userRoles={userRoles} user={user} />
}