"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { LandingHeader } from "@/components/landing-header"
import { Footer } from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/types/database"
import { ShoppingBag, Check } from "lucide-react"

const COMING_SOON_SLUGS = ['shine-shampoo', 'beauty-gummies']

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const comingSoon = COMING_SOON_SLUGS.includes(product.slug)

  function handleAddToCart() {
    if (comingSoon) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className={`relative aspect-[3/4] overflow-hidden rounded-sm bg-[#f5f0eb] ${comingSoon ? '' : 'cursor-pointer'}`} onClick={handleAddToCart}>
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover ${comingSoon ? 'opacity-60' : ''}`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}

        {/* Coming Soon badge */}
        {comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-sm text-neutral-700 text-xs uppercase tracking-[0.2em] font-medium px-6 py-2.5 rounded-full">
              Coming Soon
            </span>
          </div>
        )}

        {/* Hover CTA bar */}
        {!comingSoon && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-sm px-5 py-4 transition-all duration-400 ease-out ${
              hovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            <span className="flex items-center justify-center gap-2 text-white text-sm tracking-[0.15em] uppercase font-medium">
              <ShoppingBag className="w-4 h-4" />
              Add to Bag — ${(product.price_cents / 100).toFixed(0)}.00
            </span>
          </div>
        )}
      </div>

      {/* Product info below image */}
      <div className="pt-5 space-y-1.5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-[0.12em]">
            {product.name}
          </h3>
          <span className="text-sm text-neutral-900 shrink-0">
            ${(product.price_cents / 100).toFixed(0)}.00
          </span>
        </div>
        <p className="text-[13px] text-neutral-400 leading-relaxed">
          {product.tagline}
        </p>
        {comingSoon ? (
          <div className="mt-3 w-full h-11 rounded-sm bg-neutral-200 text-neutral-500 text-xs uppercase tracking-[0.15em] font-medium flex items-center justify-center">
            Coming Soon
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`mt-3 w-full h-11 rounded-sm text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-[#6E6A62] text-white hover:bg-[#5a5650]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Bag
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("feedback") as HTMLTextAreaElement
    const message = input.value.trim()
    if (!message) return

    setStatus("sending")
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
      input.value = ""
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-sm text-neutral-600">
          Thanks for your feedback! We&apos;ll keep it in mind.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto text-left">
      <label
        htmlFor="feedback"
        className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3"
      >
        What types of products would you like to see Glow make?
      </label>
      <textarea
        id="feedback"
        name="feedback"
        rows={3}
        placeholder="e.g. body lotion, lip gloss, SPF moisturizer..."
        className="w-full border border-neutral-200 rounded-sm px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 resize-none"
      />
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 h-11 px-8 rounded-sm bg-neutral-950 text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Submit"}
      </button>
    </form>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('sort_order')
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader variant="light" ctaHref="/" ctaLabel="Become a Glow Girl" />

      <section className="pt-32 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl italic leading-tight mb-5">
              The Essentials
            </h1>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              Everything you need to glow up — premium formulas, honest
              ingredients, real results.
            </p>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="text-center text-neutral-400 py-12">Loading products...</div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* More products coming soon + feedback */}
          <div className="mt-20 text-center border-t border-neutral-100 pt-16">
            <h2 className="text-2xl md:text-3xl italic mb-10">
              We&apos;re always working on what&apos;s next. Tell us what you want to see.
            </h2>

            <FeedbackForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
