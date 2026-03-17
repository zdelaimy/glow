import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyNewLead } from '@/lib/slack'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { glow_girl_id, full_name, email, phone, instagram_handle, location, income_goal, message, interest } = body

    if (!glow_girl_id || !full_name || !email || !interest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate interest value
    if (!['become_glow_girl', 'products', 'general'].includes(interest)) {
      return NextResponse.json({ error: 'Invalid interest type' }, { status: 400 })
    }

    // Verify glow girl exists
    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id, brand_name, slack_channel_id')
      .eq('id', glow_girl_id)
      .eq('approved', true)
      .single()

    if (!glowGirl) {
      return NextResponse.json({ error: 'Invalid Glow Girl' }, { status: 404 })
    }

    // Insert lead
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        glow_girl_id,
        full_name,
        email,
        phone: phone || null,
        instagram_handle: instagram_handle || null,
        location: location || null,
        income_goal: income_goal || null,
        message: message || null,
        interest,
      })

    if (insertError) {
      console.error('[Leads] Insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    // Send Slack notification (non-blocking)
    notifyNewLead({
      glowGirlName: glowGirl.brand_name || 'Unknown',
      slackChannelId: glowGirl.slack_channel_id,
      leadName: full_name,
      leadEmail: email,
      leadPhone: phone || null,
      leadInstagram: instagram_handle || null,
      leadLocation: location || null,
      leadIncomeGoal: income_goal || null,
      interest,
      message: message || null,
    }).catch((err) => console.error('[Leads] Slack notification failed:', err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
