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

// Role-based path access
const ROLE_RESTRICTED_PATHS: Record<string, string[]> = {
  "/admin": ["admin"],
};

async function getUserRole(sessionId: string): Promise<string | null> {
  try {
    console.log("[MIDDLEWARE] Fetching user role with sessionId:", sessionId);
    const response = await fetch("http://localhost:8080/api/auth/me", {
      method: "GET",
      headers: {
        Cookie: `SESSIONID=${sessionId}`,
      },
    });

    console.log("[MIDDLEWARE] Response status:", response.status);
    if (!response.ok) {
      console.log("[MIDDLEWARE] Failed to fetch user role:", response.status);
      return null;
    }

    const result = await response.json();
    console.log(
      "[MIDDLEWARE] Full user data from backend:",
      JSON.stringify(result)
    );
    // Backend returns {success, message, data: {role, ...}}
    const role = result.data?.role?.toLowerCase() || null;
    console.log(
      "[MIDDLEWARE] User role from backend:",
      result.data?.role,
      "normalized to:",
      role
    );
    return role;
  } catch (error) {
    console.log("[MIDDLEWARE] Error fetching user role:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("[MIDDLEWARE] Processing:", pathname);

  // Cho phép truy cập tất cả public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.log("[MIDDLEWARE] Public path, allowing access");
    return NextResponse.next();
  }

  // Static files and API routes - allow directly
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Homepage - redirect based on role if authenticated
  if (pathname === "/") {
    const sessionId = request.cookies.get("SESSIONID")?.value;
    if (sessionId) {
      const userRole = await getUserRole(sessionId);
      console.log("[MIDDLEWARE] Homepage access with role:", userRole);

      if (userRole === "admin") {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        console.log("[MIDDLEWARE] Redirecting admin to /admin");
        return NextResponse.redirect(adminUrl);
      }
      // User and lawyer stay on homepage
      console.log("[MIDDLEWARE]", userRole, "accessing homepage - allowing");
    }
    // Not authenticated or unknown role - allow access to homepage
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

    // Check role-based access
    const restrictedRoles = ROLE_RESTRICTED_PATHS[pathname.split("/")[1]];
    if (restrictedRoles) {
      const userRole = await getUserRole(sessionId);
      if (!userRole || !restrictedRoles.includes(userRole)) {
        console.log(
          "[MIDDLEWARE] User with role",
          userRole,
          "is not allowed to access",
          pathname
        );
        // Redirect to home page
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/";
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
