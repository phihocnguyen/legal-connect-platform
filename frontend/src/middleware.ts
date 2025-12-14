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

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const requestHeaders = {
      "Content-Type": "application/json",
      Cookie: `SESSIONID=${sessionId}`,
    };
    console.log("[MIDDLEWARE] Request headers:", requestHeaders);

    const response = await fetch(`http://backend:8080/api/auth/me`, {
      method: "GET",
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[MIDDLEWARE] Response status:", response.status);
    if (!response.ok) {
      console.log(
        "[MIDDLEWARE] Failed to fetch user role:",
        response.status,
        response.statusText
      );

      // Try to read response body for more details
      try {
        const errorBody = await response.text();
        console.log("[MIDDLEWARE] Error response body:", errorBody);
      } catch (bodyError) {
        console.log(
          "[MIDDLEWARE] Could not read error response body:",
          bodyError
        );
      }

      return null;
    }

    const result = await response.json();
    console.log("[MIDDLEWARE] API Response:", JSON.stringify(result, null, 2));

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

    // Check role-based access - temporarily disabled due to middleware limitations
    // Role checks will be handled in page components
    const restrictedRoles = ROLE_RESTRICTED_PATHS[pathname.split("/")[1]];
    if (restrictedRoles) {
      console.log(
        "[MIDDLEWARE] Role check disabled for",
        pathname,
        "- will be handled in component"
      );
      // For now, allow access and let components handle authentication
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
