"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  notifyOnUpload: boolean
  notifyOnShare: boolean
  notifyOnComment: boolean
  notifyOnMention: boolean
  notifyOnStorageLimit: boolean
  notifyOnNewFeatures: boolean
  notifyOnSecurityAlerts: boolean
}

export default function NotificationSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    desktopNotifications: false,
    notifyOnUpload: true,
    notifyOnShare: true,
    notifyOnComment: true,
    notifyOnMention: true,
    notifyOnStorageLimit: true,
    notifyOnNewFeatures: false,
    notifyOnSecurityAlerts: true,
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
        emailNotifications: data.emailNotifications ?? true,
        pushNotifications: data.pushNotifications ?? false,
        desktopNotifications: data.desktopNotifications ?? false,
        notifyOnUpload: data.notifyOnUpload ?? true,
        notifyOnShare: data.notifyOnShare ?? true,
        notifyOnComment: data.notifyOnComment ?? true,
        notifyOnMention: data.notifyOnMention ?? true,
        notifyOnStorageLimit: data.notifyOnStorageLimit ?? true,
        notifyOnNewFeatures: data.notifyOnNewFeatures ?? false,
        notifyOnSecurityAlerts: data.notifyOnSecurityAlerts ?? true,
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
      {/* الإشعارات العامة */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">وسائل الإشعارات</h3>
          <p className="text-sm text-muted-foreground">اختر كيف تريد تلقي الإشعارات</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="emailNotifications" className="text-sm font-medium">البريد الإلكتروني</Label>
              <p className="text-xs text-muted-foreground">استقبل الإشعارات عبر البريد الإلكتروني</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="pushNotifications" className="text-sm font-medium">إشعارات الدفع</Label>
              <p className="text-xs text-muted-foreground">استقبل الإشعارات على جهازك المحمول</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="desktopNotifications" className="text-sm font-medium">إشعارات سطح المكتب</Label>
              <p className="text-xs text-muted-foreground">استقبل الإشعارات على متصفحك</p>
            </div>
            <Switch
              id="desktopNotifications"
              checked={settings.desktopNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* أنواع الإشعارات */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">أنواع الإشعارات</h3>
          <p className="text-sm text-muted-foreground">اختر الأحداث التي تريد تلقي إشعارات عنها</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnUpload" className="text-sm font-medium">رفع الملفات</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند اكتمال رفع الملفات</p>
            </div>
            <Switch
              id="notifyOnUpload"
              checked={settings.notifyOnUpload}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnUpload: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnShare" className="text-sm font-medium">المشاركة</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند مشاركة ملف معك</p>
            </div>
            <Switch
              id="notifyOnShare"
              checked={settings.notifyOnShare}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnShare: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnComment" className="text-sm font-medium">التعليقات</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند إضافة تعليق على ملفاتك</p>
            </div>
            <Switch
              id="notifyOnComment"
              checked={settings.notifyOnComment}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnComment: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnMention" className="text-sm font-medium">الإشارات</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند الإشارة إليك في تعليق</p>
            </div>
            <Switch
              id="notifyOnMention"
              checked={settings.notifyOnMention}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnMention: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnStorageLimit" className="text-sm font-medium">حد المساحة</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند الاقتراب من حد المساحة</p>
            </div>
            <Switch
              id="notifyOnStorageLimit"
              checked={settings.notifyOnStorageLimit}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnStorageLimit: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnNewFeatures" className="text-sm font-medium">الميزات الجديدة</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند إضافة ميزات جديدة</p>
            </div>
            <Switch
              id="notifyOnNewFeatures"
              checked={settings.notifyOnNewFeatures}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnNewFeatures: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 bg-destructive/5 md:col-span-2">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="notifyOnSecurityAlerts" className="text-sm font-medium">تنبيهات الأمان</Label>
              <p className="text-xs text-muted-foreground">إشعارك عند حدوث نشاط أمني مشبوه (يُنصح بتفعيله)</p>
            </div>
            <Switch
              id="notifyOnSecurityAlerts"
              checked={settings.notifyOnSecurityAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnSecurityAlerts: checked })}
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
