import type { Metadata } from "next";
import { Geist, Geist_Mono, Almarai } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClerkProvider } from '@clerk/nextjs';
import { MaintenanceChecker } from "@/components/shared/maintenance-checker";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const almarai = Almarai({
  variable: "--font-almarai",
  weight: ["300", "400", "700", "800"],
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Platinum Drive - منصة التخزين السحابي",
    template: "%s | Platinum Drive",
  },
  description:
    "منصة تخزين سحابي حديثة وآمنة مع ميزات متقدمة لإدارة الملفات والمستخدمين",
  keywords: [
    "تخزين سحابي",
    "ملفات",
    "مشاركة ملفات",
    "cloud storage",
    "file management",
  ],
  authors: [{ name: "Youssef Ahmed" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${almarai.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-almarai)" }}
      >
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <MaintenanceChecker>{children}</MaintenanceChecker>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
