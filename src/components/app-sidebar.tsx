import { Calendar, Home, Inbox, Search, Settings, User } from "lucide-react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "الملف الشخصي",
    url: "/profile",
    icon: User,
  },
  {
    title: "البريد الوارد",
    url: "#",
    icon: Inbox,
  },
  {
    title: "التقويم",
    url: "#",
    icon: Calendar,
  },
  {
    title: "بحث",
    url: "#",
    icon: Search,
  },
  {
    title: "الإعدادات",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar({ side }: { side?: "left" | "right" }) {
  return (
    <Sidebar side={side} dir="rtl">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={42}
                  height={42}
                />
                <span className="text-lg font-bold">لوحة التحكم</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>التطبيق</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}