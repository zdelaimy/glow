import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { signatureId, mode, slug } = await request.json()

    // Fetch signature with relations
    const { data: signature } = await supabase
      .from('glow_girl_signatures')
      .select(`
        *,
        base:base_formulas(*),
        booster_primary:boosters!glow_girl_signatures_booster_primary_id_fkey(*),
        booster_secondary:boosters!glow_girl_signatures_booster_secondary_id_fkey(*),
        glow_girl:glow_girls(*)
      `)
      .eq('id', signatureId)
      .single()

    if (!signature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 })
    }

    const isSubscription = mode === 'subscription'
    const priceCents = isSubscription
      ? signature.subscription_price_cents
      : signature.one_time_price_cents

    const glowGirl = signature.glow_girl as { slug: string; brand_name: string }

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: signature.signature_name,
              description: `Custom serum by ${glowGirl.brand_name}`,
              metadata: {
                signature_id: signature.id,
                glow_girl_id: signature.glow_girl_id,
              },
            },
            unit_amount: priceCents,
            ...(isSubscription
              ? { recurring: { interval: 'month' as const } }
              : {}),
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      metadata: {
        signature_id: signature.id,
        glow_girl_id: signature.glow_girl_id,
        is_subscription: String(isSubscription),
        blend_components: JSON.stringify({
          base: (signature.base as { name: string })?.name,
          booster_primary: (signature.booster_primary as { name: string })?.name,
          booster_secondary: (signature.booster_secondary as { name: string } | null)?.name,
        }),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/@${slug}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/@${slug}`,
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
