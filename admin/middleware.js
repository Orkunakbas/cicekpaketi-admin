import { NextResponse } from 'next/server';

export function middleware(request) {
  // Basit middleware - gerektiğinde kullanırız
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Sadece gerekli sayfalarda çalışsın
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 