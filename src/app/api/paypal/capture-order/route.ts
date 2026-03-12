import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { captureOrder } from '@/lib/paypal'
import { processOrderCommission } from '@/lib/commissions/process-order-commission'
import { notifyNewOrder } from '@/lib/slack'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json() as {
      paypalOrderId: string
      items: { productId: string; quantity: number }[]
      glowGirlId?: string
      slug?: string
      shipping: {
        name: string
        email: string
        address: string
        city: string
        state: string
        zip: string
      }
    }

    const { paypalOrderId, items, shipping } = body

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'PayPal order ID is required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.zip || !shipping.email) {
      return NextResponse.json({ error: 'Shipping information is required' }, { status: 400 })
    }

    // Capture the PayPal payment
    const captureData = await captureOrder(paypalOrderId)

    if (captureData.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', captureData)
      return NextResponse.json(
        { error: captureData.details?.[0]?.description || 'Payment failed' },
        { status: 402 }
      )
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

    // Fetch products
    const productIds = items.map(i => i.productId)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('active', true)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 })
    }

    const totalCents = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.price_cents * item.quantity
    }, 0)

    const primaryProductId = items.length > 0 ? items[0].productId : null
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId

    // Insert order
    const { data: order } = await supabase.from('orders').insert({
      braintree_transaction_id: captureId,
      glow_girl_id: glowGirlId,
      product_id: primaryProductId,
      status: 'paid',
      is_subscription: false,
      amount_cents: totalCents,
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
      metadata: { amount_cents: totalCents, items },
    })

    // Process commissions and points
    if (order && glowGirlId && totalCents) {
      await processOrderCommission(supabase, order.id, glowGirlId, totalCents)
    }

    // Slack notification
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
        amountCents: totalCents,
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
    console.error('PayPal capture error:', err)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
