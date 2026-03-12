import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { onboardGlowGirlToSlack } from '@/lib/slack'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { founderCode, plan, billing, fullName } = await request.json() as {
      founderCode: string
      plan: 'pro' | 'elite'
      billing: string
      fullName: string
    }

    if (!founderCode || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update profile & promote to GLOW_GIRL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'GLOW_GIRL',
        subscription_plan: plan,
        subscription_billing: billing || 'founder',
        subscription_id: `FOUNDER_${founderCode.trim()}`,
        subscription_status: 'active',
        subscribed_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
    }

    // Auto-approve application
    await supabase
      .from('glow_girl_applications')
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('user_id', user.id)
      .eq('status', 'PENDING')

    // Auto-create glow_girls record
    const name = fullName || 'Glow Girl'
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 28)

    let slug = baseSlug
    const { data: existingSlug } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const referralCode = slug.toUpperCase().replace(/-/g, '').slice(0, 6) +
      Math.random().toString(36).slice(2, 6).toUpperCase()

    const serviceClient = await createServiceClient()
    const { data: { user: fullUser } } = await serviceClient.auth.admin.getUserById(user.id)
    const referredByCode = (fullUser?.user_metadata?.referred_by_code as string) || null

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .insert({
        user_id: user.id,
        slug,
        brand_name: name,
        referral_code: referralCode,
        referred_by_code: referredByCode,
        approved: true,
      })
      .select()
      .single()

    if (referredByCode && glowGirl) {
      const { data: referrer } = await supabase
        .from('glow_girls')
        .select('id')
        .eq('referral_code', referredByCode)
        .single()

      if (referrer && referrer.id !== glowGirl.id) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 12)

        await supabase.from('glow_girl_referrals').insert({
          referrer_id: referrer.id,
          referred_id: glowGirl.id,
          match_expires_at: expiresAt.toISOString(),
        })

        const { data: referrerPod } = await supabase
          .from('pod_memberships')
          .select('pod_id')
          .eq('glow_girl_id', referrer.id)
          .eq('role', 'LEADER')
          .is('left_at', null)
          .single()

        if (referrerPod) {
          await supabase.from('pod_memberships').insert({
            pod_id: referrerPod.pod_id,
            glow_girl_id: glowGirl.id,
            role: 'MEMBER',
          })
        }
      }
    }

    // Slack onboarding (non-blocking)
    if (glowGirl) {
      const applicantEmail = fullUser?.email
      let recruiterSlackChannelId: string | null = null

      if (referredByCode) {
        const { data: recruiterGirl } = await supabase
          .from('glow_girls')
          .select('slack_channel_id')
          .eq('referral_code', referredByCode)
          .single()
        recruiterSlackChannelId = recruiterGirl?.slack_channel_id || null
      }

      if (applicantEmail) {
        try {
          const slackChannelId = await onboardGlowGirlToSlack({
            brandName: name,
            slug,
            email: applicantEmail,
            recruiterSlackChannelId,
          })

          if (slackChannelId) {
            await supabase
              .from('glow_girls')
              .update({ slack_channel_id: slackChannelId })
              .eq('id', glowGirl.id)
          }
        } catch (err) {
          console.error('[Slack] Onboarding failed (non-blocking):', err)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Activate founder error:', err)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }
}
