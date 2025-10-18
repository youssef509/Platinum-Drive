"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PrivacySettings {
  profileVisibility: string
  showOnlineStatus: boolean
  showLastActive: boolean
  allowIndexing: boolean
}

export default function PrivacySettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    showOnlineStatus: false,
    showLastActive: false,
    allowIndexing: false,
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
        profileVisibility: data.profileVisibility || "private",
        showOnlineStatus: data.showOnlineStatus ?? false,
        showLastActive: data.showLastActive ?? false,
        allowIndexing: data.allowIndexing ?? false,
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
        <div className="space-y-2">
          <Label htmlFor="profileVisibility" className="text-sm font-medium">رؤية الملف الشخصي</Label>
          <Select
            value={settings.profileVisibility}
            onValueChange={(value: string) => setSettings({ ...settings, profileVisibility: value })}
          >
            <SelectTrigger id="profileVisibility" className="text-right h-10">
              <SelectValue placeholder="اختر مستوى الخصوصية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">عام - يمكن للجميع رؤيته</SelectItem>
              <SelectItem value="friends">الأصدقاء فقط</SelectItem>
              <SelectItem value="private">خاص - لا أحد يمكنه رؤيته</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground text-right">تحكم في من يمكنه رؤية معلومات ملفك الشخصي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="showOnlineStatus" className="text-sm font-medium">إظهار حالة الاتصال</Label>
              <p className="text-xs text-muted-foreground">السماح للآخرين برؤية ما إذا كنت متصلاً</p>
            </div>
            <Switch
              id="showOnlineStatus"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="showLastActive" className="text-sm font-medium">إظهار آخر نشاط</Label>
              <p className="text-xs text-muted-foreground">السماح للآخرين برؤية آخر مرة كنت نشطاً فيها</p>
            </div>
            <Switch
              id="showLastActive"
              checked={settings.showLastActive}
              onCheckedChange={(checked) => setSettings({ ...settings, showLastActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 md:col-span-2">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="allowIndexing" className="text-sm font-medium">السماح بالفهرسة</Label>
              <p className="text-xs text-muted-foreground">السماح لمحركات البحث بفهرسة ملفك الشخصي العام</p>
            </div>
            <Switch
              id="allowIndexing"
              checked={settings.allowIndexing}
              onCheckedChange={(checked) => setSettings({ ...settings, allowIndexing: checked })}
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
