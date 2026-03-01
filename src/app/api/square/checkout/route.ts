import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { getSquareClient } from '@/lib/square'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Guard: return 503 if Square is not configured yet
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Payment processing is not configured yet' },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()
    const body = await request.json() as {
      items: { productId: string; quantity: number }[]
      glowGirlId?: string
      slug?: string
    }

    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
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

    // Insert pending order (Square doesn't support freeform metadata on checkout)
    const { data: pending, error: pendingError } = await supabase
      .from('pending_orders')
      .insert({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        glow_girl_id: glowGirlId,
      })
      .select('id')
      .single()

    if (pendingError || !pending) {
      console.error('Failed to create pending order:', pendingError)
      return NextResponse.json({ error: 'Failed to create pending order' }, { status: 500 })
    }

    // Build Square line items
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!
      return {
        name: product.name,
        quantity: String(item.quantity),
        basePriceMoney: {
          amount: BigInt(product.price_cents),
          currency: 'USD' as const,
        },
      }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowlabs.nyc'
    const square = getSquareClient()

    const response = await square.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        referenceId: pending.id,
        lineItems,
      },
      checkoutOptions: {
        askForShippingAddress: true,
        redirectUrl: `${appUrl}/order-success`,
      },
    })

    const url = response.paymentLink?.url
    if (!url) {
      return NextResponse.json({ error: 'Failed to create checkout link' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Square checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
