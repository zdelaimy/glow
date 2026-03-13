import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get latest cancellation request
    const { data: request } = await supabase
      .from('cancellation_requests')
      .select('status, cooling_off_ends_at, reason')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get sponsor info (the person who referred this user)
    let sponsor: { name: string; email: string } | null = null

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('referred_by_code')
      .eq('user_id', user.id)
      .single()

    if (glowGirl?.referred_by_code) {
      const { data: referrer } = await supabase
        .from('glow_girls')
        .select('brand_name, user_id')
        .eq('referral_code', glowGirl.referred_by_code)
        .single()

      if (referrer) {
        // Get referrer's email from profiles
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', referrer.user_id)
          .single()

        if (referrerProfile) {
          // Get email from auth (available via the user's own supabase client for the profile lookup)
          // We'll use the brand_name and construct an email from profile
          sponsor = {
            name: referrer.brand_name || 'Your Sponsor',
            email: 'support@glowbeauty.com', // fallback — real email would need service role
          }
        }
      }
    }

    return NextResponse.json({
      request: request || null,
      sponsor,
    })
  } catch {
    return NextResponse.json({ request: null, sponsor: null })
  }
}
