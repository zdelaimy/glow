import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Set affiliate cookie when ?ref= param is present on /shop
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && request.nextUrl.pathname === '/shop') {
    const res = response ?? NextResponse.next()
    // Cookie lasts 30 days
    res.cookies.set('glow_ref', ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
    return res
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
