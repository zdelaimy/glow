import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/'

  console.log('[auth/callback] Hit callback. code:', !!code, 'redirect param:', redirect, 'origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] Code exchange result:', error ? `ERROR: ${error.message}` : 'SUCCESS')
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Read referral cookie and store on profile
        const cookieStore = await cookies()
        const refCode = cookieStore.get('glow_referral')?.value
        if (refCode) {
          // Store referred_by_code on the glow girl record when they onboard
          // For now, store it as user metadata so onboarding can read it
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
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile?.role === 'GLOW_GIRL') {
          return NextResponse.redirect(`${origin}/glow-girl/dashboard`)
        }

        // Check for existing application
        const { data: application } = await supabase
          .from('glow_girl_applications')
          .select('status')
          .eq('user_id', user.id)
          .single()

        if (application) {
          if (application.status === 'APPROVED') {
            return NextResponse.redirect(`${origin}/glow-girl/dashboard`)
          }
          return NextResponse.redirect(`${origin}/apply/status`)
        }

        console.log('[auth/callback] New user, redirecting to /apply')
        return NextResponse.redirect(`${origin}/apply`)
      }
      console.log('[auth/callback] User exists but no user object, redirecting to:', redirect)
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  console.log('[auth/callback] No code or exchange failed, redirecting to /login?error=auth')
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
