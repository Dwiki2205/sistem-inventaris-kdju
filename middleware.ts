// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Tambahkan header CORS untuk API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  // Logging untuk debugging
  console.log(`[${request.method}] ${request.nextUrl.pathname}`, {
    params: request.nextUrl.searchParams.toString(),
    timestamp: new Date().toISOString(),
  });
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/barang/edit/:path*',
  ],
};