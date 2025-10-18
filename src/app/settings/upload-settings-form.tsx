"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UploadSettings {
  defaultUploadFolder: string
  autoGenerateThumbnails: boolean
  compressImages: boolean
  deduplicateFiles: boolean
}

export default function UploadSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<UploadSettings>({
    defaultUploadFolder: "/",
    autoGenerateThumbnails: true,
    compressImages: false,
    deduplicateFiles: true,
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
        defaultUploadFolder: data.defaultUploadFolder || "/",
        autoGenerateThumbnails: data.autoGenerateThumbnails ?? true,
        compressImages: data.compressImages ?? false,
        deduplicateFiles: data.deduplicateFiles ?? true,
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
          <Label htmlFor="defaultUploadFolder" className="text-sm font-medium">المجلد الافتراضي للرفع</Label>
          <Input
            id="defaultUploadFolder"
            type="text"
            value={settings.defaultUploadFolder}
            onChange={(e) => setSettings({ ...settings, defaultUploadFolder: e.target.value })}
            placeholder="/"
            className="text-right h-10"
          />
          <p className="text-xs text-muted-foreground text-right">المسار الافتراضي لحفظ الملفات المرفوعة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="autoGenerateThumbnails" className="text-sm font-medium">إنشاء الصور المصغرة تلقائياً</Label>
              <p className="text-xs text-muted-foreground">إنشاء معاينات للصور والفيديوهات</p>
            </div>
            <Switch
              id="autoGenerateThumbnails"
              checked={settings.autoGenerateThumbnails}
              onCheckedChange={(checked) => setSettings({ ...settings, autoGenerateThumbnails: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="compressImages" className="text-sm font-medium">ضغط الصور</Label>
              <p className="text-xs text-muted-foreground">تقليل حجم الصور عند الرفع لتوفير المساحة</p>
            </div>
            <Switch
              id="compressImages"
              checked={settings.compressImages}
              onCheckedChange={(checked) => setSettings({ ...settings, compressImages: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5 md:col-span-2">
            <div className="space-y-0.5 text-right flex-1">
              <Label htmlFor="deduplicateFiles" className="text-sm font-medium">تجنب التكرار</Label>
              <p className="text-xs text-muted-foreground">منع رفع نفس الملف أكثر من مرة</p>
            </div>
            <Switch
              id="deduplicateFiles"
              checked={settings.deduplicateFiles}
              onCheckedChange={(checked) => setSettings({ ...settings, deduplicateFiles: checked })}
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
