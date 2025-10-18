"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface SecuritySettings {
  sessionTimeout: number
  requireReauthForSensitive: boolean
  loginAlertsEnabled: boolean
  defaultSharePermission: string
  defaultLinkExpiry: number
}

export default function SecuritySettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    requireReauthForSensitive: true,
    loginAlertsEnabled: true,
    defaultSharePermission: "view",
    defaultLinkExpiry: 7,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setFetching(true)
      const response = await fetch("/api/user/settings")
      if (!response.ok) throw new Error("فشل تحميل الإعدادات")
      
      const data = await response.json()
      setSettings({
        sessionTimeout: data.sessionTimeout || 30,
        requireReauthForSensitive: data.requireReauthForSensitive ?? true,
        loginAlertsEnabled: data.loginAlertsEnabled ?? true,
        defaultSharePermission: data.defaultSharePermission || "view",
        defaultLinkExpiry: data.defaultLinkExpiry || 7,
      })
    } catch (error) {
      toast.error("فشل تحميل الإعدادات")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error("فشل حفظ الإعدادات")

      toast.success("تم حفظ الإعدادات بنجاح")
    } catch (error) {
      toast.error("فشل حفظ الإعدادات")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout" className="text-sm font-medium">مهلة الجلسة (بالدقائق)</Label>
            <Select
              value={settings.sessionTimeout.toString()}
              onValueChange={(value: string) => setSettings({ ...settings, sessionTimeout: parseInt(value) })}
            >
              <SelectTrigger id="sessionTimeout" className="text-right h-10">
                <SelectValue placeholder="اختر مدة الجلسة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 دقيقة</SelectItem>
                <SelectItem value="30">30 دقيقة</SelectItem>
                <SelectItem value="60">ساعة واحدة</SelectItem>
                <SelectItem value="120">ساعتان</SelectItem>
                <SelectItem value="240">4 ساعات</SelectItem>
                <SelectItem value="0">لا تنتهي تلقائياً</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-right">المدة قبل تسجيل الخروج التلقائي عند عدم النشاط</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultSharePermission" className="text-sm font-medium">الصلاحية الافتراضية للمشاركة</Label>
            <Select
              value={settings.defaultSharePermission}
              onValueChange={(value: string) => setSettings({ ...settings, defaultSharePermission: value })}
            >
              <SelectTrigger id="defaultSharePermission" className="text-right h-10">
                <SelectValue placeholder="اختر الصلاحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">عرض فقط</SelectItem>
                <SelectItem value="comment">عرض وتعليق</SelectItem>
                <SelectItem value="edit">تعديل كامل</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-right">الصلاحية الافتراضية عند مشاركة ملف</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="defaultLinkExpiry" className="text-sm font-medium">انتهاء صلاحية الروابط (بالأيام)</Label>
            <Select
              value={settings.defaultLinkExpiry.toString()}
              onValueChange={(value: string) => setSettings({ ...settings, defaultLinkExpiry: parseInt(value) })}
            >
              <SelectTrigger id="defaultLinkExpiry" className="text-right h-10">
                <SelectValue placeholder="اختر المدة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">يوم واحد</SelectItem>
                <SelectItem value="7">أسبوع</SelectItem>
                <SelectItem value="30">شهر</SelectItem>
                <SelectItem value="90">3 أشهر</SelectItem>
                <SelectItem value="0">لا تنتهي</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-right">المدة الافتراضية قبل انتهاء صلاحية روابط المشاركة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 bg-primary/5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="requireReauthForSensitive" className="text-sm font-medium">إعادة المصادقة للعمليات الحساسة</Label>
              <p className="text-xs text-muted-foreground">طلب كلمة المرور عند تغيير إعدادات الأمان (يُنصح بتفعيله)</p>
            </div>
            <Switch
              id="requireReauthForSensitive"
              checked={settings.requireReauthForSensitive}
              onCheckedChange={(checked) => setSettings({ ...settings, requireReauthForSensitive: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 bg-primary/5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="loginAlertsEnabled" className="text-sm font-medium">تنبيهات تسجيل الدخول</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند تسجيل الدخول من جهاز جديد (يُنصح بتفعيله)</p>
            </div>
            <Switch
              id="loginAlertsEnabled"
              checked={settings.loginAlertsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, loginAlertsEnabled: checked })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <Button type="submit" disabled={loading} className="px-8">
          {loading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "حفظ التغييرات"
          )}
        </Button>
      </div>
    </form>
  )
}
