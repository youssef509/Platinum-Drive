"use client";

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
  Search,
  Share2,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

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
    title: "البحث",
    url: "/search",
    icon: Search,
  },
  {
    title: "المشاركات",
    url: "/shared",
    icon: Share2,
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
];

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
];

// Admin menu items
const adminItems = [
  {
    title: "لوحة التحكم",
    url: "/admin",
    icon: Shield,
  },
];

interface AppSidebarProps {
  side?: "left" | "right";
  userRoles?: string[];
  userName?: string;
  userEmail?: string;
}

export function AppSidebar({
  side = "left",
  userRoles,
  userName,
  userEmail,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isAdmin = userRoles?.some((role) => role.toLowerCase() === "admin");

  return (
    <Sidebar side={side} dir="rtl" className="border-l">
      {/* Header with Logo */}
      <SidebarHeader className="border-b px-6 py-5" dir="rtl">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-all"
          dir="rtl"
        >
          <div className="flex flex-col text-right min-w-0 flex-1 order-2">
            <span className="text-lg font-bold truncate">Platinum Drive</span>
            <span className="text-xs text-muted-foreground truncate">
              منصة التخزين السحابي
            </span>
          </div>
          <div className="w-10 h-10 flex items-center justify-center shrink-0 order-1">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
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
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "h-11 px-4 mb-2 rounded-lg transition-all relative",
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/15 border-r-4 border-primary"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Link
                            href={item.url}
                            className="flex items-center gap-3 flex-row-reverse"
                            dir="rtl"
                          >
                            <span
                              className={cn(
                                "font-medium flex-1 text-right",
                                isActive && "font-semibold"
                              )}
                            >
                              {item.title}
                            </span>
                            <item.icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                isActive && "text-primary"
                              )}
                            />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
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
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-10 px-4 rounded-lg transition-all relative",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15 border-r-4 border-primary"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 flex-row-reverse"
                        dir="rtl"
                      >
                        <span
                          className={cn(
                            "flex-1 text-right",
                            isActive && "font-semibold"
                          )}
                        >
                          {item.title}
                        </span>
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive && "text-primary"
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
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
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-10 px-4 rounded-lg transition-all relative",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15 border-r-4 border-primary"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 flex-row-reverse"
                        dir="rtl"
                      >
                        <span
                          className={cn(
                            "flex-1 text-right",
                            isActive && "font-semibold"
                          )}
                        >
                          {item.title}
                        </span>
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive && "text-primary"
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Time/Date Card */}
      <SidebarFooter className="border-t p-4" dir="rtl">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3" dir="rtl">
            <span className="text-xs font-medium text-muted-foreground flex-1 text-right">
              الوقت والتاريخ
            </span>
            <Clock className="h-4 w-4 text-primary shrink-0" />
          </div>

          {mounted ? (
            <div className="space-y-2" dir="ltr">
              {/* Time Display */}
              <div className="text-center">
                <div className="text-2xl font-bold tabular-nums tracking-wider text-primary">
                  {formatTime(currentTime)}
                </div>
              </div>

              {/* Date Display */}
              <div className="text-center pt-2 border-t border-primary/10">
                <div className="text-xs text-muted-foreground" dir="rtl">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2" dir="ltr">
              {/* Loading placeholder */}
              <div className="text-center">
                <div className="text-2xl font-bold tabular-nums tracking-wider text-primary/50">
                  --:--:--
                </div>
              </div>
              <div className="text-center pt-2 border-t border-primary/10">
                <div className="text-xs text-muted-foreground/50" dir="rtl">
                  جاري التحميل...
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
