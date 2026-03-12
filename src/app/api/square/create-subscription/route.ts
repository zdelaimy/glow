import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareClient } from '@/lib/square'

const PLAN_VARIATION_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.SQUARE_PLAN_PRO_MONTHLY!,
    annual: process.env.SQUARE_PLAN_PRO_ANNUAL!,
  },
  elite: {
    monthly: process.env.SQUARE_PLAN_ELITE_MONTHLY!,
    annual: process.env.SQUARE_PLAN_ELITE_ANNUAL!,
  },
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

    const planVariationId = PLAN_VARIATION_IDS[plan]?.[billing]
    if (!planVariationId) {
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

    // 4. Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'GLOW_GIRL',
        subscription_plan: plan,
        subscription_billing: billing,
        subscription_id: subscriptionId,
        subscription_status: 'active',
        subscribed_at: new Date().toISOString(),
        square_customer_id: customerId,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriptionId })
  } catch (err) {
    console.error('Square subscription error:', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
