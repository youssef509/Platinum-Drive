"use client"

import { useState, useEffect } from "react"
import ClientLayout from "@/components/client-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Files, 
  HardDrive, 
  Activity, 
  Settings, 
  FileType, 
  Shield,
  TrendingUp,
  UserCheck,
  UserX
} from "lucide-react"
import { toast } from "sonner"
import UsersManagement from "./users-management"
import SystemSettings from "./system-settings"
import FileTypesManagement from "./file-types-management"

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

interface AdminDashboardProps {
  initialStats: DashboardStats
  userRoles: Array<{ role: { name: string } }>
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

// Format bytes to human readable format
function formatBytes(bytes: string | bigint) {
  const bytesValue = typeof bytes === 'string' ? BigInt(bytes) : bytes
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytesValue === BigInt(0)) return '0 Byte'
  const i = Math.floor(Math.log(Number(bytesValue)) / Math.log(1024))
  return Math.round(Number(bytesValue) / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

export default function AdminDashboard({ initialStats, userRoles, user }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(false)

  // Refresh dashboard stats
  const refreshStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard/stats')
      if (!response.ok) throw new Error('فشل تحميل الإحصائيات')
      
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      toast.error('فشل تحديث الإحصائيات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ClientLayout userRoles={userRoles} user={user}>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-muted-foreground">
              إدارة المستخدمين والنظام والإعدادات
            </p>
          </div>
          <Button
            onClick={refreshStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <>
                <Activity className="h-4 w-4 animate-spin" />
                تحديث...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                تحديث الإحصائيات
              </>
            )}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground text-right">
                <span className="text-green-600">{stats.recentUsers}</span> جديد هذا الأسبوع
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 text-right">
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground text-right">
                <span className="text-red-600">{stats.inactiveUsers}</span> غير نشط
              </p>
            </CardContent>
          </Card>

          {/* Total Files */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Files className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">إجمالي الملفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{stats.totalFiles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground text-right">
                في النظام
              </p>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">استخدام التخزين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-right">{formatBytes(stats.totalStorage)}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                <span>%{stats.systemStats.storageUtilization}</span>
                <div className="w-8 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(stats.systemStats.storageUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <Tabs defaultValue="users" className="w-full" dir="rtl">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3" dir="rtl">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  إدارة المستخدمين
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  إعدادات النظام
                </TabsTrigger>
                <TabsTrigger value="filetypes" className="flex items-center gap-2">
                  <FileType className="h-4 w-4" />
                  أنواع الملفات
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="users" className="space-y-4">
                <UsersManagement onStatsChange={refreshStats} />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <SystemSettings />
              </TabsContent>
              
              <TabsContent value="filetypes" className="space-y-4">
                <FileTypesManagement />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </ClientLayout>
  )
}