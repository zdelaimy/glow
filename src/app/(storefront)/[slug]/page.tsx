import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { StorefrontTracker } from '@/components/storefront-tracker'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from "@/components/footer"
import type { GlowGirl, Product } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GlowGirlStorefront({ params }: Props) {
  const { slug: rawSlug } = await params
  const supabase = await createClient()

  const slug = rawSlug.replace(/^@/, '')

  const { data: glowGirl } = await supabase
    .from('glow_girls')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .single()

  if (!glowGirl) notFound()

  const g = glowGirl as GlowGirl

  // If the Glow Girl has selected specific products, show only those; otherwise show all
  let productsQuery = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (g.selected_product_ids && g.selected_product_ids.length > 0) {
    productsQuery = productsQuery.in('id', g.selected_product_ids)
  }

  const { data: products } = await productsQuery

  return (
    <div className="min-h-screen bg-white">
      <StorefrontTracker glowGirlId={glowGirl.id} />
      <LandingHeader variant="light" />

      <section className="pt-32 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl italic leading-tight mb-5">
              {g.brand_name ? `${g.brand_name}'s Picks` : 'The Essentials'}
            </h1>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              Premium Glow products, curated just for you.
            </p>
          </div>

          {/* Product grid */}
          {products && products.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
              {products.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/${slug}/product/${product.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#f5f0eb]">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-sm px-5 py-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
                      <span className="block text-center text-white text-sm tracking-[0.15em] uppercase font-medium">
                        View Product — ${(product.price_cents / 100).toFixed(0)}.00
                      </span>
                    </div>
                  </div>
                  <div className="pt-5 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-[0.12em]">
                        {product.name}
                      </h3>
                      <span className="text-sm text-neutral-900 shrink-0">
                        ${(product.price_cents / 100).toFixed(0)}.00
                      </span>
                    </div>
                    {product.tagline && (
                      <p className="text-[13px] text-neutral-400 leading-relaxed">
                        {product.tagline}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-neutral-400 py-12">
              No products available yet.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
