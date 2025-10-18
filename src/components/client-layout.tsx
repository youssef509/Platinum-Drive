'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationMenu } from '@/components/notification-menu'
import { UserProfileMenu } from '@/components/user-profile-menu'
import { ThemeSwitcher } from '@/components/theme-switcher'

interface ClientLayoutProps {
  children: React.ReactNode
  userRoles: Array<{ role: { name: string } }>
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
}

export default function ClientLayout({ children, userRoles, user }: ClientLayoutProps) {
  // Convert userRoles to string array for AppSidebar
  const roleNames = userRoles.map(ur => ur.role.name)
  
  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4" dir="rtl">
          <SidebarTrigger className="-mr-1" />
          <div className="mr-auto flex items-center gap-2">
            <NotificationMenu />
            <ThemeSwitcher />
            <UserProfileMenu 
              userName={user.name || "مستخدم"}
              userEmail={user.email}
              userImage={user.avatar || ""}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
      <AppSidebar 
        side="right" 
        userRoles={roleNames}
        userName={user.name || undefined}
        userEmail={user.email}
      />
    </SidebarProvider>
  )
}