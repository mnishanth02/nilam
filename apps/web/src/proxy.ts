import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
const publicRoutes = ['/', ...authRoutes, '/accept-invitation'];

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (
    pathname === '/' ||
    publicRoutes.some((route) => route !== '/' && pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  if (!sessionCookie && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url);
    const destination = pathname + (request.nextUrl.search || '');
    if (destination !== '/dashboard') {
      loginUrl.searchParams.set('redirect', destination);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
