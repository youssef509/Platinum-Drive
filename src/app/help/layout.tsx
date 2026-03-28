import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { getDbUser } from "@/lib/auth/auth";
import { UserProfileMenu } from "@/components/shared/user-profile-menu";
import { Home } from "lucide-react";

export default async function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getDbUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div
          className="container mx-auto px-4 h-16 flex items-center justify-between"
          dir="rtl"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col text-right">
              <span className="text-lg font-bold">Platinum Drive</span>
              <span className="text-xs text-muted-foreground">
                مركز المساعدة
              </span>
            </div>
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="shrink-0"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            {dbUser ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">
                    <Home className="ml-2 h-4 w-4" />
                    الرئيسية
                  </Link>
                </Button>
                <UserProfileMenu
                  userName={dbUser.name || "مستخدم"}
                  userEmail={dbUser.email || ""}
                  userImage={dbUser.image || ""}
                />
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/sign-in">تسجيل الدخول</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-8">
        <div
          className="container mx-auto px-4 text-center text-sm text-muted-foreground"
          dir="rtl"
        >
          <p>© 2025 Platinum Drive. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
