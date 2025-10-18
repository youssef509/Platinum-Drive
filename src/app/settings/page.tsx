import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MainLayout from "@/components/main-layout"
import { Settings, Bell, Upload, Lock, Eye, FolderOpen } from "lucide-react"
import GeneralSettingsForm from "./general-settings-form"
import NotificationSettingsForm from "./notification-settings-form"
import UploadSettingsForm from "./upload-settings-form"
import PrivacySettingsForm from "./privacy-settings-form"
import FileManagementSettingsForm from "./file-management-settings-form"
import SecuritySettingsForm from "./security-settings-form"

export default async function SettingsPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/sign-in")
  }

  return (
    <MainLayout>
      <div className="w-full space-y-8" dir="rtl">
        <div className="text-right">
          <h1 className="text-4xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            قم بتخصيص تجربتك وإدارة تفضيلاتك
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-8" dir="rtl">
          <TabsList className="grid w-full grid-cols-6 h-12 p-1">
            <TabsTrigger value="general" className="flex items-center gap-2 text-sm h-10">
              <Settings className="h-4 w-4" />
              عام
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm h-10">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 text-sm h-10">
              <Upload className="h-4 w-4" />
              الرفع
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 text-sm h-10">
              <Eye className="h-4 w-4" />
              الخصوصية
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 text-sm h-10">
              <FolderOpen className="h-4 w-4" />
              الملفات
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-sm h-10">
              <Lock className="h-4 w-4" />
              الأمان
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Settings className="h-6 w-6" />
                  الإعدادات العامة
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بتخصيص الواجهة واللغة والمنطقة الزمنية
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <GeneralSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Bell className="h-6 w-6" />
                  إعدادات الإشعارات
                </CardTitle>
                <CardDescription className="text-base text-right">
                  تحكم في كيفية ووقت تلقي الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <NotificationSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Upload className="h-6 w-6" />
                  إعدادات الرفع
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بتحديد الإعدادات الافتراضية لرفع الملفات
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <UploadSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Eye className="h-6 w-6" />
                  إعدادات الخصوصية
                </CardTitle>
                <CardDescription className="text-base text-right">
                  تحكم في من يمكنه رؤية ملفك الشخصي ونشاطك
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <PrivacySettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <FolderOpen className="h-6 w-6" />
                  إدارة الملفات
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بتحديد كيفية عرض وإدارة ملفاتك
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <FileManagementSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Lock className="h-6 w-6" />
                  إعدادات الأمان
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بإدارة إعدادات الأمان والجلسات
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <SecuritySettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
