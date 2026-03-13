import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // If there's an auth code in the URL, exchange it for a session
  // This handles the case where Supabase redirects to the Site URL with ?code=
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const url = request.nextUrl.clone()
        url.searchParams.delete('code')

        if (profile?.role === 'ADMIN') {
          url.pathname = '/admin'
          return NextResponse.redirect(url, { headers: supabaseResponse.headers })
        }
        if (profile?.role === 'GLOW_GIRL') {
          url.pathname = '/glow-girl/dashboard'
          return NextResponse.redirect(url, { headers: supabaseResponse.headers })
        }

        // Check for existing application
        const { data: application } = await supabase
          .from('glow_girl_applications')
          .select('status')
          .eq('user_id', user.id)
          .single()

        if (application) {
          url.pathname = application.status === 'APPROVED' ? '/glow-girl/dashboard' : '/apply/status'
          return NextResponse.redirect(url, { headers: supabaseResponse.headers })
        }

        url.pathname = '/apply'
        return NextResponse.redirect(url, { headers: supabaseResponse.headers })
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') || (path.startsWith('/glow-girl') && !path.startsWith('/glow-girls'))) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
