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
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db/prisma"

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