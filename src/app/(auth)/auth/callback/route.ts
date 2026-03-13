import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getBaseUrl(request: Request): string {
  const { origin } = new URL(request.url)
  // On Vercel, the origin from request.url can be an internal URL behind the load balancer
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    return `${proto}://${forwardedHost}`
  }
  return origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const baseUrl = getBaseUrl(request)

  console.log('[auth/callback] Hit callback. code:', !!code, 'baseUrl:', baseUrl)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] Code exchange:', error ? `ERROR: ${error.message}` : 'SUCCESS')

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Read referral cookie and store on profile
        const cookieStore = await cookies()
        const refCode = cookieStore.get('glow_referral')?.value
        if (refCode) {
          await supabase.auth.updateUser({
            data: { referred_by_code: refCode },
          })
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'ADMIN') {
          return NextResponse.redirect(`${baseUrl}/admin`)
        }
        if (profile?.role === 'GLOW_GIRL') {
          return NextResponse.redirect(`${baseUrl}/glow-girl/dashboard`)
        }

        // Check for existing application
        const { data: application } = await supabase
          .from('glow_girl_applications')
          .select('status')
          .eq('user_id', user.id)
          .single()

        if (application) {
          if (application.status === 'APPROVED') {
            return NextResponse.redirect(`${baseUrl}/glow-girl/dashboard`)
          }
          return NextResponse.redirect(`${baseUrl}/apply/status`)
        }

        console.log('[auth/callback] New user, redirecting to /apply')
        return NextResponse.redirect(`${baseUrl}/apply`)
      }
    }
  }

  console.log('[auth/callback] Failed, redirecting to /login?error=auth')
  return NextResponse.redirect(`${baseUrl}/login?error=auth`)
}
