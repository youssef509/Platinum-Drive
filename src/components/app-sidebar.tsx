"use client"

import { 
  Home, 
  User, 
  Shield, 
  FolderOpen, 
  Upload, 
  Star, 
  Trash2, 
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Main menu items
const mainItems = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "الملفات",
    url: "/files",
    icon: FolderOpen,
  },
  {
    title: "المفضلة",
    url: "/favorites",
    icon: Star,
  },
  {
    title: "الرفع",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "سلة المحذوفات",
    url: "/trash",
    icon: Trash2,
  },
]

// Account menu items
const accountItems = [
  {
    title: "الملف الشخصي",
    url: "/profile",
    icon: User,
  },
  {
    title: "الإعدادات",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "المساعدة",
    url: "/help",
    icon: HelpCircle,
  },
]

// Admin menu items
const adminItems = [
  {
    title: "لوحة التحكم",
    url: "/admin",
    icon: Shield,
  },
]

interface AppSidebarProps {
  side?: "left" | "right"
  userRoles?: string[]
  userName?: string
  userEmail?: string
}

export function AppSidebar({ side, userRoles = [], userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname()
  const isAdmin = userRoles.includes('admin')

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/sign-in' })
  }

  return (
    <Sidebar side={side} dir="rtl" className="border-l">
      {/* Header with Logo */}
      <SidebarHeader className="border-b px-6 py-5">
        <Link href="/" className="flex items-center gap-3 group transition-all">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="flex flex-col text-right min-w-0 flex-1">
            <span className="text-lg font-bold truncate">Platinum Drive</span>
            <span className="text-xs text-muted-foreground truncate">منصة التخزين السحابي</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 overflow-y-auto overflow-x-hidden">
        {/* Admin Section - Highlighted */}
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild
                          className={cn(
                            "h-11 px-4 mb-2 rounded-lg transition-all",
                            isActive 
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900" 
                              : "hover:bg-accent"
                          )}
                        >
                          <Link href={item.url}>
                            <item.icon className={cn("h-5 w-5", isActive && "text-blue-700 dark:text-blue-300")} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="my-4" />
          </>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "h-10 px-4 rounded-lg transition-all",
                        isActive 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "h-10 px-4 rounded-lg transition-all",
                        isActive 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info and Logout */}
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-3">
          {/* User Info - Clickable to Profile */}
          <Link 
            href="/profile" 
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-right overflow-hidden">
              <p className="text-sm font-medium truncate">{userName || 'مستخدم'}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail || 'لا يوجد بريد'}</p>
            </div>
          </Link>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}