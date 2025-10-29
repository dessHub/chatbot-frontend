import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if user is authenticated (has auth data in localStorage)
  // Note: This is a basic check. In production, validate the token server-side.
  const authCookie = request.cookies.get("auth")

  // If trying to access /chats without auth, redirect to login
  if (pathname.startsWith("/chats") && !authCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If on login page and authenticated, redirect to chats
  if (pathname === "/" && authCookie) {
    return NextResponse.redirect(new URL("/chats", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/chats/:path*"],
}
