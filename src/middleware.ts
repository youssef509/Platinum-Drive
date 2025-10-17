import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"]
  
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Redirect to sign-in if trying to access protected route while not authenticated
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to home if trying to access auth pages while authenticated
  if (isAuthenticated && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
