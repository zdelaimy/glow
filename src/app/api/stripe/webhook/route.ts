import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { processOrderCommission } from '@/lib/commissions/process-order-commission'
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

      // Parse items from metadata
      const items: { productId: string; quantity: number }[] = meta.items
        ? JSON.parse(meta.items)
        : []

      // Use the first product_id for the order's product_id column (primary product)
      const primaryProductId = items.length > 0 ? items[0].productId : null

      const customerEmail = session.customer_details?.email || null

      const orderData = {
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        glow_girl_id: meta.glow_girl_id,
        signature_id: null,
        product_id: primaryProductId,
        status: 'paid',
        is_subscription: false,
        amount_cents: session.amount_total || 0,
        currency: session.currency || 'usd',
        shipping_name: (session as unknown as { shipping_details?: { name?: string; address?: unknown } }).shipping_details?.name || null,
        shipping_address: (session as unknown as { shipping_details?: { name?: string; address?: unknown } }).shipping_details?.address || null,
        line_items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
        blend_components: {},
        customer_email: customerEmail,
        fulfillment_status: 'UNFULFILLED' as const,
      }

      const { data: order } = await supabase.from('orders').insert(orderData).select('id').single()

      // Insert order_items
      if (order && items.length > 0) {
        const productIds = items.map(i => i.productId)
        const { data: products } = await supabase
          .from('products')
          .select('id, price_cents')
          .in('id', productIds)

        if (products) {
          const orderItems = items.map(item => {
            const product = products.find(p => p.id === item.productId)
            const unitPrice = product?.price_cents || 0
            return {
              order_id: order.id,
              product_id: item.productId,
              quantity: item.quantity,
              unit_price_cents: unitPrice,
              total_cents: unitPrice * item.quantity,
            }
          })
          await supabase.from('order_items').insert(orderItems)
        }
      }

      // Track purchase event
      await supabase.from('events').insert({
        event_type: 'purchase',
        glow_girl_id: meta.glow_girl_id,
        metadata: { amount_cents: session.amount_total, items },
      })

      // Process commissions and points
      if (order && meta.glow_girl_id && session.amount_total) {
        await processOrderCommission(supabase, order.id, meta.glow_girl_id, session.amount_total)
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

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as unknown as {
        billing_reason: string; subscription: string | null;
        amount_paid: number; currency: string; payment_intent: string | null;
      }
      // Only process subscription renewal invoices (not the first one which is handled by checkout)
      if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('glow_girl_id, signature_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (sub && invoice.amount_paid) {
          const { data: order } = await supabase.from('orders').insert({
            glow_girl_id: sub.glow_girl_id,
            signature_id: sub.signature_id,
            stripe_payment_intent_id: invoice.payment_intent || null,
            status: 'paid',
            is_subscription: true,
            amount_cents: invoice.amount_paid,
            currency: invoice.currency || 'usd',
            line_items: [{ name: 'Subscription Renewal', quantity: 1 }],
            blend_components: {},
          }).select('id').single()

          if (order) {
            await processOrderCommission(supabase, order.id, sub.glow_girl_id, invoice.amount_paid)
          }
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
