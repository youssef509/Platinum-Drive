"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Shield, 
  Mail, 
  Database, 
  Loader2,
  Save,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"

interface SystemSettings {
  // Security Settings
  'security.maxLoginAttempts': number
  'security.sessionTimeout': number
  'security.requireEmailVerification': boolean
  'security.allowPasswordReset': boolean
  'security.enforceStrongPasswords': boolean
  
  // Upload Settings  
  'upload.maxFileSize': number
  'upload.allowedFileTypes': string[]
  'upload.virusScanEnabled': boolean
  'upload.autoGenerateThumbnails': boolean
  
  // Email Settings
  'email.smtpHost': string
  'email.smtpPort': number
  'email.smtpUser': string
  'email.smtpSecure': boolean
  'email.fromAddress': string
  'email.fromName': string
  
  // Storage Settings
  'storage.defaultQuotaGB': number
  'storage.maxQuotaGB': number
  'storage.autoCleanupDays': number
  'storage.compressionEnabled': boolean
  
  // General Settings
  'general.siteName': string
  'general.siteDescription': string
  'general.maintenanceMode': boolean
  'general.registrationEnabled': boolean
  'general.defaultLanguage': string
  'general.defaultTimezone': string
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Partial<SystemSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('فشل تحميل الإعدادات')
      
      const data = await response.json()
      setSettings(data.settings || {})
    } catch (error) {
      toast.error('فشل تحميل إعدادات النظام')
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) throw new Error('فشل حفظ الإعدادات')
      
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      toast.error('فشل حفظ الإعدادات')
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  // Update setting
  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  useEffect(() => {
    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="mr-2">جاري تحميل الإعدادات...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-xl font-semibold">إعدادات النظام</h2>
          <p className="text-sm text-muted-foreground">
            إدارة الإعدادات العامة للنظام والحماية
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={saveSettings} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={loadSettings} disabled={loading} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة تحميل
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-4" dir="rtl">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="storage">التخزين</TabsTrigger>
          <TabsTrigger value="email">البريد</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Settings className="h-5 w-5" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription className="text-right">
                إعدادات الموقع الأساسية والتفضيلات العامة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-right">
                  <Label htmlFor="siteName" className="text-right">اسم الموقع</Label>
                  <Input
                    id="siteName"
                    value={settings['general.siteName'] || ''}
                    onChange={(e) => updateSetting('general.siteName', e.target.value)}
                    placeholder="Platinum Drive"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label htmlFor="defaultLanguage" className="text-right">اللغة الافتراضية</Label>
                  <Select 
                    value={settings['general.defaultLanguage'] || 'ar'}
                    onValueChange={(value) => updateSetting('general.defaultLanguage', value)}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-right">
                <Label htmlFor="siteDescription" className="text-right">وصف الموقع</Label>
                <Input
                  id="siteDescription"
                  value={settings['general.siteDescription'] || ''}
                  onChange={(e) => updateSetting('general.siteDescription', e.target.value)}
                  placeholder="منصة تخزين الملفات الذكية"
                  className="text-right"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <Switch
                  checked={settings['general.maintenanceMode'] || false}
                  onCheckedChange={(checked) => updateSetting('general.maintenanceMode', checked)}
                />
                <div className="space-y-0.5 text-right flex-1 mr-4">
                  <Label>وضع الصيانة</Label>
                  <p className="text-sm text-muted-foreground">
                    تفعيل وضع الصيانة يمنع الوصول للموقع مؤقتاً
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <Switch
                  checked={settings['general.registrationEnabled'] !== false}
                  onCheckedChange={(checked) => updateSetting('general.registrationEnabled', checked)}
                />
                <div className="space-y-0.5 text-right flex-1 mr-4">
                  <Label>تسجيل مستخدمين جدد</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين الجدد بإنشاء حسابات
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Shield className="h-5 w-5" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription className="text-right">
                إعدادات الحماية وكلمات المرور والجلسات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-right">
                  <Label htmlFor="maxLoginAttempts" className="text-right">عدد محاولات تسجيل الدخول</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings['security.maxLoginAttempts'] || 5}
                    onChange={(e) => updateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
                    className="text-right"
                  />
                </div>
                
                <div className="text-right">
                  <Label htmlFor="sessionTimeout" className="text-right">انتهاء الجلسة (بالدقائق)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="15"
                    max="1440"
                    value={settings['security.sessionTimeout'] || 60}
                    onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['security.requireEmailVerification'] !== false}
                    onCheckedChange={(checked) => updateSetting('security.requireEmailVerification', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>التحقق من البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      إجبار المستخدمين على تأكيد بريدهم الإلكتروني
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['security.allowPasswordReset'] !== false}
                    onCheckedChange={(checked) => updateSetting('security.allowPasswordReset', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>إعادة تعيين كلمة المرور</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستخدمين بإعادة تعيين كلمة المرور
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['security.enforceStrongPasswords'] !== false}
                    onCheckedChange={(checked) => updateSetting('security.enforceStrongPasswords', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>كلمات مرور قوية</Label>
                    <p className="text-sm text-muted-foreground">
                      إجبار استخدام كلمات مرور معقدة
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-4">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Database className="h-5 w-5" />
                إعدادات التخزين
              </CardTitle>
              <CardDescription className="text-right">
                إدارة مساحة التخزين والحصص وأنواع الملفات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-right">
                  <Label htmlFor="defaultQuota" className="text-right">الحصة الافتراضية (جيجابايت)</Label>
                  <Input
                    id="defaultQuota"
                    type="number"
                    min="1"
                    max="1000"
                    value={settings['storage.defaultQuotaGB'] || 10}
                    onChange={(e) => updateSetting('storage.defaultQuotaGB', parseInt(e.target.value))}
                    className="text-right"
                  />
                </div>
                
                <div className="text-right">
                  <Label htmlFor="maxQuota" className="text-right">الحد الأقصى للحصة (جيجابايت)</Label>
                  <Input
                    id="maxQuota"
                    type="number"
                    min="10"
                    max="10000"
                    value={settings['storage.maxQuotaGB'] || 100}
                    onChange={(e) => updateSetting('storage.maxQuotaGB', parseInt(e.target.value))}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="text-right">
                <Label htmlFor="maxFileSize" className="text-right">حجم الملف الأقصى (ميجابايت)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="5000"
                  value={settings['upload.maxFileSize'] || 100}
                  onChange={(e) => updateSetting('upload.maxFileSize', parseInt(e.target.value))}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  الحجم الحالي: {formatFileSize((settings['upload.maxFileSize'] || 100) * 1024 * 1024)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['upload.virusScanEnabled'] !== false}
                    onCheckedChange={(checked) => updateSetting('upload.virusScanEnabled', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>فحص الفيروسات</Label>
                    <p className="text-sm text-muted-foreground">
                      فحص الملفات المرفوعة للتأكد من خلوها من الفيروسات
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['upload.autoGenerateThumbnails'] !== false}
                    onCheckedChange={(checked) => updateSetting('upload.autoGenerateThumbnails', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>إنشاء صور مصغرة تلقائياً</Label>
                    <p className="text-sm text-muted-foreground">
                      إنشاء صور مصغرة للصور والفيديوهات المرفوعة
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Switch
                    checked={settings['storage.compressionEnabled'] !== false}
                    onCheckedChange={(checked) => updateSetting('storage.compressionEnabled', checked)}
                  />
                  <div className="space-y-0.5 text-right flex-1 mr-4">
                    <Label>ضغط التخزين</Label>
                    <p className="text-sm text-muted-foreground">
                      ضغط الملفات تلقائياً لتوفير مساحة التخزين
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Mail className="h-5 w-5" />
                إعدادات البريد الإلكتروني
              </CardTitle>
              <CardDescription className="text-right">
                إعدادات SMTP وإرسال البريد الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-right">
                  <Label htmlFor="smtpHost" className="text-right">خادم SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={settings['email.smtpHost'] || ''}
                    onChange={(e) => updateSetting('email.smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="text-right"
                  />
                </div>
                
                <div className="text-right">
                  <Label htmlFor="smtpPort" className="text-right">منفذ SMTP</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings['email.smtpPort'] || 587}
                    onChange={(e) => updateSetting('email.smtpPort', parseInt(e.target.value))}
                    className="text-right"
                  />
                </div>
              </div>

              <div className="text-right">
                <Label htmlFor="smtpUser" className="text-right">اسم المستخدم SMTP</Label>
                <Input
                  id="smtpUser"
                  type="email"
                  value={settings['email.smtpUser'] || ''}
                  onChange={(e) => updateSetting('email.smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-right">
                  <Label htmlFor="fromAddress" className="text-right">عنوان المرسل</Label>
                  <Input
                    id="fromAddress"
                    type="email"
                    value={settings['email.fromAddress'] || ''}
                    onChange={(e) => updateSetting('email.fromAddress', e.target.value)}
                    placeholder="noreply@platinumdrive.com"
                    className="text-right"
                  />
                </div>
                
                <div className="text-right">
                  <Label htmlFor="fromName" className="text-right">اسم المرسل</Label>
                  <Input
                    id="fromName"
                    value={settings['email.fromName'] || ''}
                    onChange={(e) => updateSetting('email.fromName', e.target.value)}
                    placeholder="Platinum Drive"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <Switch
                  checked={settings['email.smtpSecure'] !== false}
                  onCheckedChange={(checked) => updateSetting('email.smtpSecure', checked)}
                />
                <div className="space-y-0.5 text-right flex-1 mr-4">
                  <Label>اتصال آمن (TLS/SSL)</Label>
                  <p className="text-sm text-muted-foreground">
                    استخدام اتصال مشفر مع خادم البريد
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}