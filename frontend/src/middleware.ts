import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/auth"];

const PROTECTED_PATHS = [
  "/forum",
  "/admin",
  "/chat",
  "/messages",
  "/notifications",
  "/profile",
  "/pdf-qa",
  "/lawyer",
];

const ROLE_RESTRICTED_PATHS: Record<string, string[]> = {
  "/admin": ["admin"],
};

async function getUserRole(sessionId: string): Promise<string | null> {
  try {
    console.log("[MIDDLEWARE] Fetching user role with sessionId:", sessionId);

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

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get("SESSIONID")?.value;
  let userRole: string | null = null;

  const getRole = async () => {
    if (!sessionId) return null;
    if (userRole) return userRole;
    userRole = await getUserRole(sessionId);
    return userRole;
  };

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

  if (pathname === "/") {
    if (sessionId) {
      const role = await getRole();
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

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
