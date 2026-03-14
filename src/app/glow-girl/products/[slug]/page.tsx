import { requireGlowGirl } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CopyButton } from '../_components/copy-button'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  await requireGlowGirl()
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, education:product_education(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const edu = Array.isArray(product.education) ? product.education[0] : product.education

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        href="/glow-girl/products"
        className="inline-flex items-center gap-2 text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Products
      </Link>

      {/* Product header */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-6">
        <div className="flex items-start gap-5">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-24 h-24 rounded-xl object-cover shrink-0"
            />
          )}
          <div>
            <h1 className="text-2xl font-light text-[#6E6A62]">{product.name}</h1>
            {product.tagline && (
              <p className="text-sm text-[#6E6A62]/60 mt-1">{product.tagline}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-lg font-medium text-[#6E6A62]">
                ${(product.price_cents / 100).toFixed(2)}
              </span>
              {product.compare_at_price_cents && (
                <span className="text-sm text-[#6E6A62]/40 line-through">
                  ${(product.compare_at_price_cents / 100).toFixed(2)}
                </span>
              )}
              {product.category && (
                <span className="text-xs bg-[#f5f0eb] text-[#6E6A62]/60 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>
        {product.description && (
          <p className="text-sm text-[#6E6A62]/70 mt-4 leading-relaxed">{product.description}</p>
        )}
      </div>

      {/* Who it's for */}
      {edu?.who_its_for && (
        <Section title="Who It&apos;s For">
          <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{edu.who_its_for}</p>
        </Section>
      )}

      {/* Talking Points */}
      {edu?.talking_points && edu.talking_points.length > 0 && (
        <Section title="Talking Points">
          <ul className="space-y-2">
            {edu.talking_points.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#6E6A62]/70">
                <span className="text-[#6E6A62] mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Benefits */}
      {edu?.benefits && edu.benefits.length > 0 && (
        <Section title="Key Benefits">
          <div className="grid grid-cols-2 gap-2">
            {edu.benefits.map((benefit: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#6E6A62]/70 bg-[#f5f0eb]/40 rounded-lg px-3 py-2">
                <span className="text-emerald-500">✓</span>
                {benefit}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Ingredients */}
      {edu?.ingredients_detail && (
        <Section title="Ingredients">
          <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{edu.ingredients_detail}</p>
        </Section>
      )}

      {/* Usage Directions */}
      {edu?.usage_directions && (
        <Section title="Usage Directions">
          <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{edu.usage_directions}</p>
        </Section>
      )}

      {/* Pitch Scripts */}
      {edu?.pitch_scripts && edu.pitch_scripts.length > 0 && (
        <Section title="Pitch Scripts">
          <div className="space-y-4">
            {edu.pitch_scripts.map((script: { scenario: string; script: string }, i: number) => (
              <div key={i} className="bg-[#f5f0eb]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#6E6A62]/60 uppercase tracking-wider">
                    {script.scenario}
                  </span>
                  <CopyButton text={script.script} />
                </div>
                <p className="text-sm text-[#6E6A62] leading-relaxed whitespace-pre-line">{script.script}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* FAQs */}
      {edu?.faqs && edu.faqs.length > 0 && (
        <Section title="FAQs">
          <div className="space-y-3">
            {edu.faqs.map((faq: { q: string; a: string }, i: number) => (
              <div key={i} className="bg-[#f5f0eb]/40 rounded-xl p-4">
                <p className="text-sm font-medium text-[#6E6A62] mb-1">{faq.q}</p>
                <p className="text-sm text-[#6E6A62]/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Objection Handling */}
      {edu?.objection_handling && edu.objection_handling.length > 0 && (
        <Section title="Objection Handling">
          <div className="space-y-3">
            {edu.objection_handling.map((obj: { objection: string; response: string }, i: number) => (
              <div key={i} className="bg-[#f5f0eb]/40 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#6E6A62] mb-1">
                    &ldquo;{obj.objection}&rdquo;
                  </p>
                  <CopyButton text={obj.response} />
                </div>
                <p className="text-sm text-[#6E6A62]/70">{obj.response}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Compliance Notes */}
      {edu?.compliance_notes && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-2">Compliance Notes</h2>
          <p className="text-sm text-amber-800/80 leading-relaxed">{edu.compliance_notes}</p>
        </div>
      )}

      {/* No education data */}
      {!edu && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
          <p className="text-[#6E6A62]/50">
            Detailed product education content is being prepared for this product.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 mb-6">
      <div className="px-6 py-4 border-b border-neutral-200/60">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
