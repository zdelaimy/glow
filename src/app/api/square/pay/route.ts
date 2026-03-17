import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { getSquareClient } from '@/lib/square'
import type { Country } from 'square'
import { createClient } from '@/lib/supabase/server'
import { processOrderCommission } from '@/lib/commissions/process-order-commission'
import { notifyNewOrder } from '@/lib/slack'

export async function POST(request: NextRequest) {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Payment processing is not configured yet' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const body = await request.json() as {
      sourceId: string
      items: { productId: string; quantity: number }[]
      glowGirlId?: string
      slug?: string
      shipping: {
        name: string
        email: string
        address: string
        address2?: string
        city: string
        state: string
        zip: string
        country: string
      }
    }

    const { sourceId, items, shipping } = body

    if (!sourceId) {
      return NextResponse.json({ error: 'Payment token is required' }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shipping || !shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
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

    // Calculate total
    const subtotalCents = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.price_cents * item.quantity
    }, 0)

    const isInternational = shipping.country && shipping.country !== 'US'
    const shippingCents = isInternational ? 1500 : 0
    const totalCents = subtotalCents + shippingCents

    // Create payment via Square Payments API
    const square = getSquareClient()
    const payment = await square.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(totalCents),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      buyerEmailAddress: shipping.email,
      shippingAddress: {
        addressLine1: shipping.address,
        addressLine2: shipping.address2 || undefined,
        locality: shipping.city,
        administrativeDistrictLevel1: shipping.state,
        postalCode: shipping.zip,
        country: (shipping.country || 'US') as Country,
        firstName: shipping.name.split(' ')[0],
        lastName: shipping.name.split(' ').slice(1).join(' ') || '',
      },
    })

    if (!payment.payment || payment.payment.status !== 'COMPLETED') {
      console.error('Square payment failed:', payment)
      return NextResponse.json(
        { error: 'Payment was not completed. Please try again.' },
        { status: 402 }
      )
    }

    const squarePaymentId = payment.payment.id!
    const primaryProductId = items.length > 0 ? items[0].productId : null

    // Insert order
    const { data: order } = await supabase.from('orders').insert({
      square_payment_id: squarePaymentId,
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
        street2: shipping.address2 || '',
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
        country: shipping.country,
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

    // Process commissions
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

      const fullStreet = shipping.address2
        ? `${shipping.address}, ${shipping.address2}`
        : shipping.address
      const notificationParams = {
        productNames: products.map(p => p.name),
        amountCents: totalCents,
        shippingName: shipping.name,
        shippingAddress: {
          email: shipping.email,
          street: fullStreet,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
        },
        glowGirlName,
        orderId: order.id,
      }

      notifyNewOrder(notificationParams).catch(err => console.error('Slack notification failed:', err))
    }

    return NextResponse.json({ success: true, orderId: order?.id })
  } catch (err) {
    console.error('Square pay error:', err)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
