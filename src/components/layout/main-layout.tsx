import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserProfileMenu } from "@/components/shared/user-profile-menu"
import { ThemeSwitcher } from "@/components/shared/theme-switcher"
import { NotificationMenu } from "@/components/shared/notification-menu"
import { SearchBar } from "@/components/shared/search-bar"
import { getDbUser } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db/prisma"

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const dbUser = await getDbUser()

  if (!dbUser) {
    redirect("/sign-in")
  }

  // Get user roles
  const userWithRoles = await prisma.user.findUnique({
    where: { id: dbUser.id },
    include: {
      roles: {
        include: { role: true }
      }
    }
  })

  const userRoles = userWithRoles?.roles.map((ur: { role: { name: string } }) => ur.role.name) || []

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" dir="rtl">
          <SidebarTrigger className="-mr-1" />
          <div className="flex-1 flex items-center justify-center px-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <NotificationMenu />
            <ThemeSwitcher />
            <UserProfileMenu
              userName={dbUser.name || "مستخدم"}
              userEmail={dbUser.email || ""}
              userImage={dbUser.image || ""}
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
        userName={dbUser.name || undefined}
        userEmail={dbUser.email || undefined}
      />
    </SidebarProvider>
  )
}