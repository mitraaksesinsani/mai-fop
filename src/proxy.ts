import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('nims_token')?.value;
  const { pathname, search } = request.nextUrl;

  // Halaman atau asset yang bersifat publik (tidak butuh auth)
  const isPublic =
    pathname === '/login' ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/print') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/pictures') ||
    pathname.includes('.');

  // Jika belum login dan mengakses halaman terproteksi
  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    const fullTarget = pathname + search;
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', fullTarget);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan membuka halaman /login, arahkan ke dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali static files dan assets
     */
    '/((?!_next/static|_next/image|favicon.ico|images|pictures|.*\\..*).*)',
  ],
};
