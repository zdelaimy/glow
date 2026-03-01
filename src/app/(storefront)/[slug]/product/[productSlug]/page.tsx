import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCheckout } from '@/components/product-checkout'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from "@/components/footer"
import type { Product } from '@/types/database'

interface Props {
  params: Promise<{ slug: string; productSlug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug: rawSlug, productSlug } = await params
  const slug = rawSlug.replace(/^@/, '')
  const supabase = await createClient()

  const { data: glowGirl } = await supabase
    .from('glow_girls')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .single()

  if (!glowGirl) notFound()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', productSlug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const p = product as Product

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader variant="light" />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href={`/${slug}`}
            className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 hover:text-[#6E6A62] transition-colors"
          >
            &larr; Back to shop
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f5f0eb]">
            {p.image_url ? (
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-light text-[#6E6A62]/30">
                  {p.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 mb-2 font-inter">
                Glow Labs
              </p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-neutral-900">
                {p.name}
              </h1>
              {p.tagline && (
                <p className="text-[#6E6A62]/60 mt-2">{p.tagline}</p>
              )}
            </div>

            {p.description && (
              <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{p.description}</p>
            )}

            {/* Ingredients */}
            {p.ingredients && p.ingredients.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-medium mb-3">
                  Key Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {p.ingredients.map((ingredient, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#6E6A62]/20 px-3 py-1 text-xs text-[#6E6A62]"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Checkout */}
            <ProductCheckout
              productId={p.id}
              slug={slug}
              glowGirlId={glowGirl.id}
              price={p.price_cents}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
