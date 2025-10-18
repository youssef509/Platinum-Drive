"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface FileManagementSettings {
  defaultSortBy: string
  defaultViewMode: string
  trashRetentionDays: number
  maxPreviewSize: number
}

export default function FileManagementSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<FileManagementSettings>({
    defaultSortBy: "modified",
    defaultViewMode: "grid",
    trashRetentionDays: 30,
    maxPreviewSize: 10,
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
        defaultSortBy: data.defaultSortBy || "modified",
        defaultViewMode: data.defaultViewMode || "grid",
        trashRetentionDays: data.trashRetentionDays || 30,
        maxPreviewSize: data.maxPreviewSize || 10,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="defaultSortBy" className="text-sm font-medium">الترتيب الافتراضي</Label>
          <Select
            value={settings.defaultSortBy}
            onValueChange={(value: string) => setSettings({ ...settings, defaultSortBy: value })}
          >
            <SelectTrigger id="defaultSortBy" className="text-right h-10">
              <SelectValue placeholder="اختر طريقة الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">الاسم</SelectItem>
              <SelectItem value="modified">تاريخ التعديل</SelectItem>
              <SelectItem value="created">تاريخ الإنشاء</SelectItem>
              <SelectItem value="size">الحجم</SelectItem>
              <SelectItem value="type">النوع</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground text-right">كيف تريد ترتيب ملفاتك افتراضياً</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultViewMode" className="text-sm font-medium">وضع العرض الافتراضي</Label>
          <Select
            value={settings.defaultViewMode}
            onValueChange={(value: string) => setSettings({ ...settings, defaultViewMode: value })}
          >
            <SelectTrigger id="defaultViewMode" className="text-right h-10">
              <SelectValue placeholder="اختر وضع العرض" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">شبكة</SelectItem>
              <SelectItem value="list">قائمة</SelectItem>
              <SelectItem value="compact">مضغوط</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground text-right">كيف تريد عرض ملفاتك افتراضياً</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trashRetentionDays" className="text-sm font-medium">مدة الاحتفاظ بالملفات المحذوفة (بالأيام)</Label>
          <Input
            id="trashRetentionDays"
            type="number"
            min="1"
            max="365"
            value={settings.trashRetentionDays}
            onChange={(e) => setSettings({ ...settings, trashRetentionDays: parseInt(e.target.value) || 30 })}
            className="text-right h-10"
          />
          <p className="text-xs text-muted-foreground text-right">عدد الأيام قبل حذف الملفات من سلة المهملات نهائياً</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPreviewSize" className="text-sm font-medium">الحد الأقصى لحجم المعاينة (ميجابايت)</Label>
          <Input
            id="maxPreviewSize"
            type="number"
            min="1"
            max="100"
            value={settings.maxPreviewSize}
            onChange={(e) => setSettings({ ...settings, maxPreviewSize: parseInt(e.target.value) || 10 })}
            className="text-right h-10"
          />
          <p className="text-xs text-muted-foreground text-right">أقصى حجم للملفات التي يمكن معاينتها في المتصفح</p>
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
