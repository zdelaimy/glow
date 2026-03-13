import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const COOLING_OFF_DAYS = 7

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { reason, reasonDetail } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    }

    // Get glow girl record
    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!glowGirl) {
      return NextResponse.json({ error: 'Glow Girl record not found' }, { status: 400 })
    }

    // Get subscription ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (!profile?.subscription_id || profile.subscription_status !== 'active') {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('cancellation_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending cancellation request' }, { status: 400 })
    }

    const coolingOffEndsAt = new Date()
    coolingOffEndsAt.setDate(coolingOffEndsAt.getDate() + COOLING_OFF_DAYS)

    const { error: insertError } = await supabase
      .from('cancellation_requests')
      .insert({
        user_id: user.id,
        glow_girl_id: glowGirl.id,
        subscription_id: profile.subscription_id,
        reason,
        reason_detail: reasonDetail || null,
        cooling_off_ends_at: coolingOffEndsAt.toISOString(),
      })

    if (insertError) {
      console.error('Cancellation request insert error:', insertError)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      coolingOffEndsAt: coolingOffEndsAt.toISOString(),
    })
  } catch (err) {
    console.error('Request cancellation error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// DELETE — withdraw a pending cancellation request
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { error } = await supabase
      .from('cancellation_requests')
      .update({ status: 'retained' })
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (error) {
      console.error('Withdraw cancellation error:', error)
      return NextResponse.json({ error: 'Failed to withdraw request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Withdraw cancellation error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
