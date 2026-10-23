import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = [
    '/', 
    '/contact', 
    '/login', 
    '/register',
    '/forgot-password',
    '/reset-password',
    '/terms-of-service', 
    '/privacy-policy',   
  ]

  const isPublicRoute = publicRoutes.some((route) => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('rogele_access_token')?.value

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}