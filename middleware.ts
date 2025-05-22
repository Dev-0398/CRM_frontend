import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode('953a8ced-57ec-4c98-9cce-34d10e4dc8ad');
const ALLOWED_PATHS = ['/', '/leads', '/users', '/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Allow unauthenticated access to login
  if (pathname === '/login') {
    if (token) {
      // Redirect authenticated users away from login
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Require token for all other routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  try {
    await jwtVerify(token, SECRET);

    // Restrict /settings to admin role only
    if (pathname === '/settings' && role !== 'admin') {
      return NextResponse.redirect(new URL('/no-access', request.url));
    }

    // Allow if path is in allowed list
    if (ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    // Block all others
    return NextResponse.redirect(new URL('/404', request.url));
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};