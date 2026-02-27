import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const meta = session.metadata || {}

      const orderData = {
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        creator_id: meta.creator_id,
        signature_id: meta.signature_id,
        status: 'paid',
        is_subscription: meta.is_subscription === 'true',
        amount_cents: session.amount_total || 0,
        currency: session.currency || 'usd',
        shipping_name: (session as unknown as { shipping_details?: { name?: string; address?: unknown } }).shipping_details?.name || null,
        shipping_address: (session as unknown as { shipping_details?: { name?: string; address?: unknown } }).shipping_details?.address || null,
        line_items: [{ name: 'Custom Serum', quantity: 1 }],
        blend_components: meta.blend_components ? JSON.parse(meta.blend_components) : {},
      }

      await supabase.from('orders').insert(orderData)

      // Track purchase event
      await supabase.from('events').insert({
        event_type: 'purchase',
        creator_id: meta.creator_id,
        signature_id: meta.signature_id,
        metadata: { amount_cents: session.amount_total },
      })

      // If subscription, create subscription record
      if (meta.is_subscription === 'true' && session.subscription) {
        const subResponse = await stripe.subscriptions.retrieve(session.subscription as string)
        const sub = subResponse as unknown as {
          id: string; customer: string | { id: string }; status: string;
          current_period_start: number; current_period_end: number;
        }
        await supabase.from('subscriptions').insert({
          creator_id: meta.creator_id,
          signature_id: meta.signature_id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subData = event.data.object as unknown as {
        id: string; status: string; current_period_start: number; current_period_end: number;
      }
      await supabase
        .from('subscriptions')
        .update({
          status: subData.status,
          current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subData.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as unknown as { id: string }
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
