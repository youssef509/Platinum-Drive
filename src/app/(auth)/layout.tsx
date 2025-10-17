export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div dir="rtl" className="flex items-center justify-center min-h-screen w-full text-right">
        {children}
   </div>
  );
}