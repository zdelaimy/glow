import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Build Stripe line items
    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.tagline || undefined,
            images: product.image_url ? [`${process.env.NEXT_PUBLIC_APP_URL}${product.image_url}`] : undefined,
            metadata: {
              product_id: product.id,
            },
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      }
    })

    const metadata: Record<string, string> = {
      items: JSON.stringify(items),
    }
    if (glowGirlId) metadata.glow_girl_id = glowGirlId

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowlabs.nyc'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      metadata,
      success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/shop`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
