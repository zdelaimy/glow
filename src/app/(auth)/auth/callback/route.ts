import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    return `${proto}://${forwardedHost}`
  }
  const { origin } = new URL(request.url)
  return origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const baseUrl = getBaseUrl(request)

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_user`)
  }

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

  return NextResponse.redirect(`${baseUrl}/apply`)
}
