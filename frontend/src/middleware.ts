import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các đường dẫn public không cần authentication
const PUBLIC_PATHS = ["/login", "/register", "/auth"];

// Các đường dẫn protected - cần authentication
const PROTECTED_PATHS = [
  "/forum",
  "/admin",
  "/chat",
  "/messages",
  "/notifications",
  "/profile",
  "/pdf-qa",
  "/search",
  "/lawyer",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[MIDDLEWARE] Processing:", pathname);

  // Cho phép truy cập tất cả public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.log("[MIDDLEWARE] Public path, allowing access");
    return NextResponse.next();
  }

  // Cho phép homepage và static files
  if (
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Kiểm tra protected paths
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check SESSIONID cookie from backend (Spring sets this automatically)
    // Note: SESSIONID is HttpOnly so it's not accessible from JavaScript,
    // but middleware runs on server so it can check it
    const sessionId = request.cookies.get("SESSIONID")?.value;

    if (!sessionId) {
      // No session - redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      console.log(
        "[MIDDLEWARE] No SESSIONID for protected path:",
        pathname,
        "- redirecting to login"
      );
      return NextResponse.redirect(loginUrl);
    }
    console.log("[MIDDLEWARE] SESSIONID found for protected path:", pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
