"use client"

import { User, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UserProfileMenuProps {
  userName?: string
  userEmail?: string
  userImage?: string
}

export function UserProfileMenu({
  userName = "مستخدم",
  userEmail = "user@example.com",
  userImage,
}: UserProfileMenuProps) {
  const router = useRouter()

  // Get first letter of name for fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
          <User className="ml-2" />
          <span>الملف الشخصي</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
          <Settings className="ml-2" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="ml-2" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
