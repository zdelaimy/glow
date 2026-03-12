import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { subscriptionId, plan, billing } = await request.json() as {
      subscriptionId: string
      plan: 'pro' | 'elite'
      billing: 'monthly' | 'annual' | 'founder'
    }

    if (!subscriptionId || !plan || !billing) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update the user's profile with subscription info and promote to GLOW_GIRL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'GLOW_GIRL',
        subscription_plan: plan,
        subscription_billing: billing,
        subscription_id: subscriptionId,
        subscription_status: 'active',
        subscribed_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Activate subscription error:', err)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }
}
