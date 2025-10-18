import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NotificationMenu } from "@/components/notification-menu"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/sign-in")
  }

  // Get user roles
  const userWithRoles = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })

  const userRoles = userWithRoles?.roles.map(ur => ur.role.name) || []

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" dir="rtl">
          <SidebarTrigger className="-mr-1" />
          <div className="mr-auto flex items-center gap-2">
            <NotificationMenu />
            <ThemeSwitcher />
            <UserProfileMenu
              userName={session.user.name || "مستخدم"}
              userEmail={session.user.email || ""}
              userImage={session.user.image || ""}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
      <AppSidebar 
        side="right" 
        userRoles={userRoles}
        userName={session.user.name || undefined}
        userEmail={session.user.email || undefined}
      />
    </SidebarProvider>
  )
}