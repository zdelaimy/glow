import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getSquareClient } from '@/lib/square'
import { onboardGlowGirlToSlack } from '@/lib/slack'

function getPlanVariationId(plan: string, billing: string): string | undefined {
  const key = `SQUARE_PLAN_${plan.toUpperCase()}_${billing.toUpperCase()}`
  return process.env[key]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { token, plan, billing, fullName, email } = await request.json() as {
      token: string
      plan: 'pro' | 'elite'
      billing: 'monthly' | 'annual'
      fullName: string
      email: string
    }

    if (!token || !plan || !billing) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planVariationId = getPlanVariationId(plan, billing)
    if (!planVariationId) {
      console.error(`Missing env var: SQUARE_PLAN_${plan.toUpperCase()}_${billing.toUpperCase()}`)
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const client = getSquareClient()

    // 1. Create customer
    const nameParts = fullName.trim().split(/\s+/)
    const givenName = nameParts[0] || ''
    const familyName = nameParts.slice(1).join(' ') || ''

    const customerResult = await client.customers.create({
      givenName,
      familyName,
      emailAddress: email || user.email,
      referenceId: user.id,
    })

    const customerId = customerResult.customer?.id
    if (!customerId) {
      console.error('Failed to create Square customer:', customerResult)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // 2. Store card on file
    const cardResult = await client.cards.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId: token,
      card: {
        customerId,
      },
    })

    const cardId = cardResult.card?.id
    if (!cardId) {
      console.error('Failed to store card:', cardResult)
      return NextResponse.json({ error: 'Failed to store payment method' }, { status: 500 })
    }

    // 3. Create subscription
    const today = new Date().toISOString().split('T')[0]
    const subscriptionResult = await client.subscriptions.create({
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      planVariationId,
      customerId,
      startDate: today,
      cardId,
      timezone: 'America/New_York',
      source: { name: 'Glow Beauty' },
    })

    const subscriptionId = subscriptionResult.subscription?.id
    if (!subscriptionId) {
      console.error('Failed to create subscription:', subscriptionResult)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // 4. Update profile & promote to GLOW_GIRL
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

    // 5. Auto-approve application
    await supabase
      .from('glow_girl_applications')
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('user_id', user.id)
      .eq('status', 'PENDING')

    // 6. Auto-create glow_girls record
    const baseSlug = fullName
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

    // Check for referred_by_code
    const serviceClient = await createServiceClient()
    const { data: { user: fullUser } } = await serviceClient.auth.admin.getUserById(user.id)
    const referredByCode = (fullUser?.user_metadata?.referred_by_code as string) || null

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .insert({
        user_id: user.id,
        slug,
        brand_name: fullName,
        referral_code: referralCode,
        referred_by_code: referredByCode,
        approved: true,
      })
      .select()
      .single()

    // Fire-and-forget: referrals, pods, Slack (don't block the response)
    const backgroundWork = async () => {
      try {
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
            const slackChannelId = await onboardGlowGirlToSlack({
              brandName: fullName,
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
          }
        }
      } catch (err) {
        console.error('[Background onboarding] Error (non-blocking):', err)
      }
    }

    // Don't await — let it run in the background
    backgroundWork()

    return NextResponse.json({ success: true, subscriptionId })
  } catch (err: unknown) {
    const errObj = err as { body?: string; statusCode?: number; errors?: Array<{ detail?: string }> }
    console.error('Square subscription error:', JSON.stringify({
      message: err instanceof Error ? err.message : String(err),
      body: errObj.body,
      statusCode: errObj.statusCode,
      errors: errObj.errors,
    }, null, 2))
    const detail = errObj.errors?.[0]?.detail || (err instanceof Error ? err.message : 'Failed to create subscription')
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
