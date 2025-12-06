import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các đường dẫn public không cần authentication
const PUBLIC_PATHS = ["/login", "/register", "/auth", "/oauth-callback"];

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

  // Cho phép truy cập tất cả public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
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
    // Kiểm tra cookie đăng nhập
    const isLoggedIn = request.cookies.get("LOGGED_IN")?.value === "true";

    if (!isLoggedIn) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
