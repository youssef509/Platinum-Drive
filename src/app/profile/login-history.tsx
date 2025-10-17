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

interface LoginRecord {
  id: string
  ip: string
  userAgent: string
  device: string
  location: string
  loginTime: string
  status: 'success' | 'failed'
}

// Mock data for now - will replace with real API
const mockLoginHistory: LoginRecord[] = [
  {
    id: "1",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    device: "Windows Desktop",
    location: "القاهرة، مصر",
    loginTime: "2024-01-20T10:30:00Z",
    status: "success"
  },
  {
    id: "2",
    ip: "192.168.1.101",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    device: "iPhone",
    location: "الإسكندرية، مصر",
    loginTime: "2024-01-19T15:45:00Z",
    status: "success"
  },
  {
    id: "3",
    ip: "10.0.0.1",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    device: "MacBook Pro",
    location: "الجيزة، مصر",
    loginTime: "2024-01-18T09:15:00Z",
    status: "failed"
  },
  {
    id: "4",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    device: "Linux Desktop",
    location: "القاهرة، مصر",
    loginTime: "2024-01-17T20:22:00Z",
    status: "success"
  },
  {
    id: "5",
    ip: "192.168.1.102",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)",
    device: "iPad",
    location: "المنصورة، مصر",
    loginTime: "2024-01-16T14:10:00Z",
    status: "success"
  }
]

function getDeviceIcon(device: string) {
  if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
    return <Smartphone className="h-4 w-4" />
  }
  if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
    return <Tablet className="h-4 w-4" />
  }
  if (device.toLowerCase().includes('desktop') || device.toLowerCase().includes('windows') || device.toLowerCase().includes('mac') || device.toLowerCase().includes('linux')) {
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
    // Simulate API call
    const fetchLoginHistory = async () => {
      setIsLoading(true)
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoginHistory(mockLoginHistory)
      setIsLoading(false)
    }

    fetchLoginHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">سجل تسجيل الدخول</h3>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">سجل تسجيل الدخول</h3>
        <p className="text-sm text-muted-foreground">آخر 5 محاولات</p>
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
                    <span className="text-sm">{record.device}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm">{record.location}</span>
                </TableCell>
                <TableCell className="text-right">
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {record.ip}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm">{formatDate(record.loginTime)}</span>
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
      
      <p className="text-xs text-muted-foreground">
        يتم عرض آخر 5 محاولات تسجيل دخول فقط. للاطلاع على السجل الكامل، يرجى الاتصال بالدعم الفني.
      </p>
    </div>
  )
}