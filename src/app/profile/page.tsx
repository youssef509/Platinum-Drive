import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ProfileForm from "./profile-form"
import PasswordForm from "./password-form"
import LoginHistory from "./login-history"
import { User, Shield, History } from "lucide-react"
import MainLayout from "@/components/main-layout"
import prisma from "@/lib/prisma"

export default async function ProfilePage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/sign-in")
  }

  // Fetch current user data directly from database to get fresh data including roles
  let userData = {
    id: session.user.id || "",
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    roles: ['USER']
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (user) {
      const roleNames = user.roles.map(ur => ur.role.name)
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roles: roleNames.length > 0 ? roleNames : ['USER']
      }
    }
  } catch (error) {
    console.log('Failed to fetch user data from database, using session data')
  }

  return (
    <MainLayout>
      <div className="w-full space-y-8" dir="rtl">
        <div className="text-right">
          <h1 className="text-4xl font-bold">الملف الشخصي</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            قم بإدارة معلومات حسابك وإعدادات الأمان
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-8" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 h-12 p-1">
            <TabsTrigger value="general" className="flex items-center gap-2 text-sm h-10">
              <User className="h-4 w-4" />
              المعلومات العامة
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-sm h-10">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-sm h-10">
              <History className="h-4 w-4" />
              سجل الدخول
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <User className="h-6 w-6" />
                  المعلومات الشخصية
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بتحديث معلومات حسابك الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <ProfileForm user={userData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <Shield className="h-6 w-6" />
                  تغيير كلمة المرور
                </CardTitle>
                <CardDescription className="text-base text-right">
                  قم بتحديث كلمة المرور لحماية حسابك
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <PasswordForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <Card className="p-8" dir="rtl">
              <CardHeader className="pb-6 text-right">
                <CardTitle className="flex items-center gap-3 text-2xl justify-start">
                  <History className="h-6 w-6" />
                  سجل محاولات الدخول
                </CardTitle>
                <CardDescription className="text-base text-right">
                  عرض آخر محاولات تسجيل الدخول لحسابك
                </CardDescription>
              </CardHeader>
              <CardContent className="text-right">
                <LoginHistory userId={session.user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}