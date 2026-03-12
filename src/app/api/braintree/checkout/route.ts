import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getBraintreeGateway } from '@/lib/braintree'
import { createClient } from '@/lib/supabase/server'
import { processOrderCommission } from '@/lib/commissions/process-order-commission'
import { notifyNewOrder } from '@/lib/slack'

export async function POST(request: NextRequest) {
  if (!process.env.BRAINTREE_MERCHANT_ID) {
    return NextResponse.json(
      { error: 'Payment processing is not configured yet' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const body = await request.json() as {
      nonce: string
      items: { productId: string; quantity: number }[]
      glowGirlId?: string
      slug?: string
      shipping?: {
        name: string
        email: string
        address: string
        city: string
        state: string
        zip: string
      }
    }

    const { nonce, items, shipping } = body

    if (!nonce) {
      return NextResponse.json({ error: 'Payment nonce is required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.zip || !shipping.email) {
      return NextResponse.json({ error: 'Shipping information is required' }, { status: 400 })
    }

    // Resolve the Glow Girl: explicit param or affiliate cookie
    let glowGirlId = body.glowGirlId || null
    if (!glowGirlId) {
      const cookieStore = await cookies()
      const ref = cookieStore.get('glow_ref')?.value
      if (ref) {
        const { data: gg } = await supabase
          .from('glow_girls')
          .select('id')
          .eq('slug', ref)
          .eq('approved', true)
          .single()
        if (gg) glowGirlId = gg.id
      }
    }

    // Fetch all products
    const productIds = items.map(i => i.productId)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('active', true)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 })
    }

    // Calculate total
    const totalCents = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.price_cents * item.quantity
    }, 0)
    const totalDollars = (totalCents / 100).toFixed(2)

    // Charge via Braintree
    const gateway = getBraintreeGateway()
    const result = await gateway.transaction.sale({
      amount: totalDollars,
      paymentMethodNonce: nonce,
      options: { submitForSettlement: true },
    })

    if (!result.success) {
      console.error('Braintree charge failed:', result.message)
      return NextResponse.json(
        { error: result.message || 'Payment failed' },
        { status: 402 }
      )
    }

    const transaction = result.transaction
    const amountCents = Math.round(parseFloat(transaction.amount) * 100)
    const primaryProductId = items.length > 0 ? items[0].productId : null

    // Insert order
    const { data: order } = await supabase.from('orders').insert({
      braintree_transaction_id: transaction.id,
      glow_girl_id: glowGirlId,
      product_id: primaryProductId,
      status: 'paid',
      is_subscription: false,
      amount_cents: amountCents,
      currency: 'usd',
      shipping_name: shipping.name,
      shipping_address: {
        email: shipping.email,
        street: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
      },
      line_items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
      blend_components: {},
      fulfillment_status: 'UNFULFILLED' as const,
    }).select('id').single()

    // Insert order_items
    if (order && items.length > 0) {
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

    // Track purchase event
    await supabase.from('events').insert({
      event_type: 'purchase',
      glow_girl_id: glowGirlId,
      metadata: { amount_cents: amountCents, items },
    })

    // Process commissions and points
    if (order && glowGirlId && amountCents) {
      await processOrderCommission(supabase, order.id, glowGirlId, amountCents)
    }

    // Slack notification (fire-and-forget so it doesn't block the response)
    if (order) {
      let glowGirlName: string | null = null
      if (glowGirlId) {
        const { data: gg } = await supabase
          .from('glow_girls')
          .select('brand_name')
          .eq('id', glowGirlId)
          .single()
        glowGirlName = gg?.brand_name || null
      }

      notifyNewOrder({
        productNames: products.map(p => p.name),
        amountCents,
        shippingName: shipping.name,
        shippingAddress: {
          email: shipping.email,
          street: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
        },
        glowGirlName,
        orderId: order.id,
      }).catch(err => console.error('Slack notification failed:', err))
    }

    return NextResponse.json({ success: true, orderId: order?.id })
  } catch (err) {
    console.error('Braintree checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
