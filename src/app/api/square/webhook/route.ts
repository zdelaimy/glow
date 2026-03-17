import { NextRequest, NextResponse } from 'next/server'
import { WebhooksHelper } from 'square'
import { getSquareClient } from '@/lib/square'
import { createServiceClient } from '@/lib/supabase/server'
import { processOrderCommission } from '@/lib/commissions/process-order-commission'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-square-hmacsha256-signature') || ''

  // Verify webhook signature
  const notificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/square/webhook`
  const isValid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    notificationUrl,
  })

  if (!isValid) {
    console.error('Square webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const event = JSON.parse(body) as {
    type: string
    data: { object: { payment: { id: string; order_id: string; status: string; amount_money?: { amount: number } } } }
  }

  if (event.type !== 'payment.completed') {
    return NextResponse.json({ received: true })
  }

  const payment = event.data.object.payment
  const supabase = await createServiceClient()

  // Deduplicate: check if we already processed this payment
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('square_payment_id', payment.id)
    .single()

  if (existingOrder) {
    return NextResponse.json({ received: true })
  }

  // Fetch the Square order to get the referenceId (our pending_orders.id)
  const square = getSquareClient()
  const squareOrder = await square.orders.get({
    orderId: payment.order_id,
  })

  const referenceId = squareOrder.order?.referenceId
  if (!referenceId) {
    console.error('Square order missing referenceId:', payment.order_id)
    return NextResponse.json({ error: 'Missing referenceId' }, { status: 400 })
  }

  // Look up pending order
  const { data: pending } = await supabase
    .from('pending_orders')
    .select('*')
    .eq('id', referenceId)
    .single()

  if (!pending) {
    console.error('Pending order not found:', referenceId)
    return NextResponse.json({ error: 'Pending order not found' }, { status: 404 })
  }

  const items = pending.items as { productId: string; quantity: number }[]
  const glowGirlId = pending.glow_girl_id
  const shipping = pending.shipping as { name: string; email: string; address: string; city: string; state: string; zip: string } | null
  const amountCents = Number(payment.amount_money?.amount || 0)
  const primaryProductId = items.length > 0 ? items[0].productId : null

  // Insert order
  const { data: order } = await supabase.from('orders').insert({
    square_payment_id: payment.id,
    glow_girl_id: glowGirlId,
    product_id: primaryProductId,
    status: 'paid',
    is_subscription: false,
    amount_cents: amountCents,
    currency: 'usd',
    shipping_name: shipping?.name || '',
    shipping_address: shipping ? {
      email: shipping.email,
      street: shipping.address,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
    } : {},
    line_items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
    blend_components: {},
    fulfillment_status: 'UNFULFILLED' as const,
  }).select('id').single()

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
    glow_girl_id: glowGirlId,
    metadata: { amount_cents: amountCents, items },
  })

  // Process commissions and points
  if (order && glowGirlId && amountCents) {
    await processOrderCommission(supabase, order.id, glowGirlId, amountCents)
  }

  return NextResponse.json({ received: true })
}
