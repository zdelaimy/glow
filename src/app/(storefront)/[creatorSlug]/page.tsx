import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StorefrontTracker } from '@/components/storefront-tracker'
import type { Creator, CreatorSignature, BaseFormula, Booster } from '@/types/database'

interface Props {
  params: Promise<{ creatorSlug: string }>
}

export default async function CreatorStorefront({ params }: Props) {
  const { creatorSlug } = await params
  const supabase = await createClient()

  // The slug in the URL may be prefixed with @ for vanity; strip it
  const slug = creatorSlug.replace(/^@/, '')

  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .single()

  if (!creator) notFound()

  const { data: signatures } = await supabase
    .from('creator_signatures')
    .select(`
      *,
      base:base_formulas(*),
      booster_primary:boosters!creator_signatures_booster_primary_id_fkey(*),
      booster_secondary:boosters!creator_signatures_booster_secondary_id_fkey(*)
    `)
    .eq('creator_id', creator.id)
    .eq('publish_status', 'PUBLISHED')

  const c = creator as Creator

  return (
    <div className="min-h-screen">
      <StorefrontTracker creatorId={creator.id} />

      {/* Hero */}
      <section
        className="relative py-24 md:py-32 px-6"
        style={{
          background: `linear-gradient(135deg, ${c.accent_color}10, ${c.accent_color}25, ${c.accent_color}10)`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {c.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={c.brand_name || ''} className="h-16 mx-auto mb-6 object-contain" />
          )}
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
            {c.hero_headline || c.brand_name}
          </h1>
          {c.benefits && c.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {c.benefits.map((b, i) => (
                <Badge key={i} variant="secondary" className="text-sm px-4 py-1.5">
                  {b}
                </Badge>
              ))}
            </div>
          )}
          <Link href={`/${slug}/quiz`}>
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full"
              style={{ backgroundColor: c.accent_color }}
            >
              Find Your Blend
            </Button>
          </Link>
        </div>
      </section>

      {/* Story */}
      {c.story && (
        <section className="py-16 px-6 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{c.story}</p>
        </section>
      )}

      {/* Signature Products */}
      {signatures && signatures.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8">Signature Serums</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signatures.map((sig) => {
                const s = sig as CreatorSignature & { base: BaseFormula; booster_primary: Booster; booster_secondary: Booster | null }
                return (
                  <Card key={s.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div
                      className="h-40 flex items-end p-5"
                      style={{ background: `linear-gradient(135deg, ${c.accent_color}20, ${c.accent_color}40)` }}
                    >
                      <h3 className="text-xl font-semibold">{s.signature_name}</h3>
                    </div>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{s.base?.name}</Badge>
                        <Badge variant="outline">{s.booster_primary?.name}</Badge>
                        {s.booster_secondary && <Badge variant="outline">{s.booster_secondary.name}</Badge>}
                      </div>
                      {s.benefit_bullets && s.benefit_bullets.length > 0 && (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {s.benefit_bullets.map((b, i) => (
                            <li key={i} className="flex gap-2">
                              <span style={{ color: c.accent_color }}>-</span> {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-xl font-semibold">${(s.subscription_price_cents / 100).toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          or ${(s.one_time_price_cents / 100).toFixed(2)}
                        </span>
                      </div>
                      <Link href={`/${slug}/product/${s.slug}`} className="block">
                        <Button className="w-full" style={{ backgroundColor: c.accent_color }}>
                          View Product
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quiz CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-light tracking-tight mb-3">
          Not sure which blend is right for you?
        </h2>
        <p className="text-muted-foreground mb-6">Take our quick skin quiz and we&apos;ll find your match.</p>
        <Link href={`/${slug}/quiz`}>
          <Button size="lg" variant="outline" className="h-12 px-8 rounded-full">
            Take the Quiz
          </Button>
        </Link>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-center mb-8">FAQ</h2>
          {[
            { q: 'What\'s included in my order?', a: 'Your order includes a base formula bottle and individual booster pods. Mix them together for your custom serum experience.' },
            { q: 'How do I mix my serum?', a: 'Simply dispense the base into your palm, add your booster pod(s), and mix gently. Press into clean skin as part of your daily ritual.' },
            { q: 'Is this safe for sensitive skin?', a: 'Our formulas use gentle, well-tolerated cosmetic ingredients. If you have specific concerns, we recommend consulting with a dermatologist.' },
            { q: 'Can I cancel my subscription?', a: 'Yes! You can cancel or pause your subscription at any time. No commitments, no hassle.' },
            { q: 'What\'s your return policy?', a: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with your blend, reach out to our team.' },
          ].map((faq, i) => (
            <div key={i} className="space-y-1">
              <h3 className="font-medium">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="py-12 px-6 text-center">
        <p className="text-sm text-muted-foreground italic">Creator testimonials coming soon.</p>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Powered by Glow &middot; Cosmetic products only. Not intended to diagnose or treat any condition.</p>
      </footer>
    </div>
  )
}
