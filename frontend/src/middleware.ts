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
  // "/search" intentionally removed so search is publicly accessible from home
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8080/api";
    const response = await fetch(`${apiUrl}/auth/me`, {
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

  // Static files and API routes - allow directly
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get("SESSIONID")?.value;
  let userRole: string | null = null;

  // Helper to get role once per middleware call
  const getRole = async () => {
    if (!sessionId) return null;
    if (userRole) return userRole;
    userRole = await getUserRole(sessionId);
    return userRole;
  };

  // 1. Role-based redirection for public paths (Login/Register)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    if (sessionId) {
      console.log("[MIDDLEWARE] Authenticated user on public path, checking role");
      const role = await getRole();
      if (role) {
        const targetUrl = role === "admin" ? "/admin" : "/";
        console.log("[MIDDLEWARE] Redirecting to:", targetUrl);
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Homepage handling
  if (pathname === "/") {
    if (sessionId) {
      const role = await getRole();
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Protected paths and Role restrictions
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const restrictedRoles = ROLE_RESTRICTED_PATHS[`/${pathname.split("/")[1]}`];

  if (isProtectedPath || restrictedRoles) {
    if (!sessionId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      console.log("[MIDDLEWARE] Redirecting to login from:", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (restrictedRoles) {
      const role = await getRole();
      if (!role || !restrictedRoles.includes(role)) {
        console.log("[MIDDLEWARE] Role mismatch for", pathname, "expected:", restrictedRoles, "got:", role);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
