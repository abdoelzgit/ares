// middleware.ts (di root project, sejajar dengan package.json)
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith('/login')
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/api/auth')

  if (isPublicAsset) {
    return NextResponse.next()
  }

  // Sudah login tapi buka /login → lempar ke dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Belum login dan buka halaman selain /login → lempar ke login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Jalankan middleware di semua route KECUALI file statis dan API auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}