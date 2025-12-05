import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Các đường dẫn public không cần authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/50_dataset_van_ban_phap_luat.csv'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép truy cập các đường dẫn public
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // Kiểm tra cookie đăng nhập
  const isLoggedIn = request.cookies.get('LOGGED_IN')?.value === 'true';

  if (!isLoggedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'], 
  // matcher này sẽ áp middleware cho tất cả route ngoại trừ các route Next.js mặc định và api
};
