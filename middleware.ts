import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "admin_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (not /api/admin which handles its own auth)
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(COOKIE_NAME)

    if (!session || !session.value) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
