import { requireGlowGirl } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'

export default async function ProductEducationPage() {
  await requireGlowGirl()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, education:product_education(*)')
    .eq('active', true)
    .order('sort_order')

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">Product Education</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Know your products inside and out. Confidence comes from knowledge.
        </p>
      </div>

      <div className="grid gap-4">
        {(products || []).map((product) => {
          const edu = Array.isArray(product.education) ? product.education[0] : product.education
          const hasTalkingPoints = edu?.talking_points?.length > 0
          const hasPitchScripts = edu?.pitch_scripts?.length > 0

          return (
            <Link
              key={product.id}
              href={`/glow-girl/products/${product.slug}`}
              className="bg-white rounded-2xl border border-neutral-200/60 p-5 hover:border-[#6E6A62]/30 hover:shadow-sm transition-all flex items-center gap-5"
            >
              {/* Product image */}
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#f5f0eb] flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-[#6E6A62]/30" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#6E6A62]">{product.name}</h3>
                {product.tagline && (
                  <p className="text-sm text-[#6E6A62]/50 mt-0.5 truncate">{product.tagline}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-[#f5f0eb] text-[#6E6A62]/60 px-2 py-0.5 rounded-full">
                    ${(product.price_cents / 100).toFixed(0)}
                  </span>
                  {product.category && (
                    <span className="text-xs bg-[#f5f0eb] text-[#6E6A62]/60 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}
                  {hasTalkingPoints && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Talking Points
                    </span>
                  )}
                  {hasPitchScripts && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      Pitch Scripts
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#6E6A62]/30 shrink-0" />
            </Link>
          )
        })}

        {(!products || products.length === 0) && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
            <p className="text-[#6E6A62]/50">No products available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
