"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react"
import { toast } from "sonner"

interface LoginRecord {
  id: string
  ip: string | null
  userAgent: string | null
  device: string | null
  location: string | null
  createdAt: string
  status: 'success' | 'failed'
}

function getDeviceIcon(device: string | null) {
  if (!device) return <Globe className="h-4 w-4" />
  
  const deviceLower = device.toLowerCase()
  if (deviceLower.includes('iphone') || deviceLower.includes('android phone')) {
    return <Smartphone className="h-4 w-4" />
  }
  if (deviceLower.includes('ipad') || deviceLower.includes('tablet')) {
    return <Tablet className="h-4 w-4" />
  }
  if (deviceLower.includes('desktop') || deviceLower.includes('windows') || deviceLower.includes('mac') || deviceLower.includes('linux')) {
    return <Monitor className="h-4 w-4" />
  }
  return <Globe className="h-4 w-4" />
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

interface LoginHistoryProps {
  userId: string
}

export default function LoginHistory({ userId }: LoginHistoryProps) {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLoginHistory = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/user/login-history?limit=10')
        const data = await response.json()

        if (!response.ok) {
          toast.error("فشل في جلب سجل الدخول", {
            description: data.error || "حدث خطأ أثناء جلب البيانات"
          })
          return
        }

        setLoginHistory(data.loginHistory || [])
      } catch (error) {
        toast.error("حدث خطأ", {
          description: "فشل في الاتصال بالخادم"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoginHistory()
  }, [userId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 space-x-reverse">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loginHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا يوجد سجل دخول متاح</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">آخر {loginHistory.length} محاولة</p>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الجهاز</TableHead>
              <TableHead className="text-right">الموقع</TableHead>
              <TableHead className="text-right">عنوان IP</TableHead>
              <TableHead className="text-right">التاريخ والوقت</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-right">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {getDeviceIcon(record.device)}
                    <span className="text-sm">{record.device || 'Unknown Device'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm">{record.location || 'غير محدد'}</span>
                </TableCell>
                <TableCell className="text-right">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {record.ip || 'Unknown'}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm">{formatDate(record.createdAt)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={record.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {record.status === 'success' ? 'نجح' : 'فشل'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-xs text-muted-foreground text-right">
        يتم عرض آخر 10 محاولات تسجيل دخول فقط
      </p>
    </div>
  )
}
