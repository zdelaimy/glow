import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCheckout } from '@/components/product-checkout'
import { Footer } from "@/components/footer"
import type { GlowGirl, BaseFormula, Booster, Texture, Scent } from '@/types/database'

interface Props {
  params: Promise<{ slug: string; signatureSlug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug: rawSlug, signatureSlug } = await params
  const slug = rawSlug.replace(/^@/, '')
  const supabase = await createClient()

  const { data: glowGirl } = await supabase
    .from('glow_girls')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .single()

  if (!glowGirl) notFound()

  const { data: signature } = await supabase
    .from('glow_girl_signatures')
    .select(`
      *,
      base:base_formulas(*),
      booster_primary:boosters!glow_girl_signatures_booster_primary_id_fkey(*),
      booster_secondary:boosters!glow_girl_signatures_booster_secondary_id_fkey(*),
      texture:textures(*),
      scent:scents(*)
    `)
    .eq('glow_girl_id', glowGirl.id)
    .eq('slug', signatureSlug)
    .eq('publish_status', 'PUBLISHED')
    .single()

  if (!signature) notFound()

  const g = glowGirl as GlowGirl
  const base = signature.base as BaseFormula
  const primaryBooster = signature.booster_primary as Booster
  const secondaryBooster = signature.booster_secondary as Booster | null
  const texture = signature.texture as Texture | null
  const scent = signature.scent as Scent | null

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-2">
            {g.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.logo_url} alt="" className="h-6" />
            )}
            <span className="font-medium">{g.brand_name}</span>
          </Link>
          <Link href={`/${slug}/quiz`} className="text-sm underline underline-offset-4">
            Take the Quiz
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Product Visual */}
          <div>
            <div
              className="aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${g.accent_color}15, ${g.accent_color}30)` }}
            >
              <div className="text-center space-y-4">
                <div
                  className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${g.accent_color}40, ${g.accent_color}80)` }}
                >
                  <span className="text-white text-4xl font-light">
                    {signature.signature_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{signature.signature_name}</p>
                  <p className="text-sm text-muted-foreground">by {g.brand_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{g.brand_name}</p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight">{signature.signature_name}</h1>
              {signature.description && (
                <p className="text-muted-foreground mt-3">{signature.description}</p>
              )}
            </div>

            {/* What's Included */}
            <Card className="border-0 bg-gray-50">
              <CardContent className="pt-5">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">What&apos;s Included</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${g.accent_color}20`, color: g.accent_color }}>B</div>
                    <div>
                      <p className="font-medium">{base.name} Base</p>
                      <p className="text-muted-foreground">{base.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${g.accent_color}20`, color: g.accent_color }}>1</div>
                    <div>
                      <p className="font-medium">{primaryBooster.name} Booster Pod</p>
                      <p className="text-muted-foreground">{primaryBooster.description}</p>
                    </div>
                  </div>
                  {secondaryBooster && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${g.accent_color}20`, color: g.accent_color }}>2</div>
                      <div>
                        <p className="font-medium">{secondaryBooster.name} Booster Pod</p>
                        <p className="text-muted-foreground">{secondaryBooster.description}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {texture && <Badge variant="outline">{texture.name} finish</Badge>}
                  {scent && <Badge variant="outline">{scent.name}</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {signature.benefit_bullets && signature.benefit_bullets.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">Benefits</h3>
                <ul className="space-y-1.5">
                  {signature.benefit_bullets.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.accent_color }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing + Checkout */}
            <ProductCheckout
              signatureId={signature.id}
              slug={slug}
              glowGirlId={glowGirl.id}
              subscriptionPrice={signature.subscription_price_cents}
              oneTimePrice={signature.one_time_price_cents}
              accentColor={g.accent_color}
            />

            {/* Ritual */}
            {signature.ritual_instructions && (
              <div className="pt-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">Mixing Ritual</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{signature.ritual_instructions}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
