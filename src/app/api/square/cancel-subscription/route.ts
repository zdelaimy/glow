import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareClient } from '@/lib/square'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the cancellation request exists and cooling-off period has passed
    const { data: cancelRequest } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!cancelRequest) {
      return NextResponse.json({ error: 'No pending cancellation request found' }, { status: 400 })
    }

    if (new Date(cancelRequest.cooling_off_ends_at) > new Date()) {
      return NextResponse.json({ error: 'Cooling-off period has not ended yet' }, { status: 400 })
    }

    // Get subscription ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Cancel in Square
    const client = getSquareClient()
    await client.subscriptions.cancel(profile.subscription_id)

    // Update profile
    await supabase
      .from('profiles')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.id)

    // Update cancellation request
    await supabase
      .from('cancellation_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', cancelRequest.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
