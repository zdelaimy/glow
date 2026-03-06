"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const products = [
  {
    name: "Glow Serum",
    slug: "glow-serum",
    tagline: "Vitamin C & hyaluronic radiance serum",
    price: 80,
    img: "/shop/antiaging.png",
    comingSoon: false,
  },
  {
    name: "Beauty Gummies",
    slug: "beauty-gummies",
    tagline: "Collagen + biotin daily supplement",
    price: 44,
    img: "/shop/gummies.png",
    comingSoon: true,
  },
  {
    name: "Shine Shampoo",
    slug: "shine-shampoo",
    tagline: "Argan & silk protein gloss shampoo",
    price: 42,
    img: "/shop/shampoo2.png",
    comingSoon: true,
  },
]

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    if (product.comingSoon) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: dbProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', product.slug)
        .eq('active', true)
        .single()

      if (!dbProduct) {
        alert('Product not available yet — launching soon!')
        setLoading(false)
        return
      }

      const res = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: dbProduct.id, quantity: 1 }],
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Checkout is not available yet — launching soon!')
        setLoading(false)
      }
    } catch {
      alert('Checkout is not available yet — launching soon!')
      setLoading(false)
    }
  }

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div
        className={`relative aspect-[3/4] overflow-hidden rounded-sm bg-[#eae5df] ${product.comingSoon ? '' : 'cursor-pointer'}`}
        onClick={handleBuy}
      >
        <Image
          src={product.img}
          alt={product.name}
          fill
          className={`object-cover ${product.comingSoon ? "opacity-60" : ""}`}
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Coming Soon badge */}
        {product.comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-sm text-[#6E6A62] text-xs uppercase tracking-[0.2em] font-medium px-6 py-2.5 rounded-full">
              Coming Soon
            </span>
          </div>
        )}

        {/* Hover CTA bar */}
        {!product.comingSoon && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-[#6E6A62]/90 backdrop-blur-sm px-5 py-3.5 transition-all duration-400 ease-out ${
              hovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            <span className="block text-center text-white text-xs tracking-[0.15em] uppercase font-medium">
              {loading ? 'Redirecting...' : `Buy ${product.name} — $${product.price}.00`}
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="pt-4 space-y-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xs font-medium text-[#6E6A62] uppercase tracking-[0.12em]">
            {product.name}
          </h3>
          <span className="text-sm text-[#6E6A62] shrink-0">
            ${product.price}
          </span>
        </div>
        <p className="text-[12px] text-[#6E6A62]/50 leading-relaxed">
          {product.tagline}
        </p>
        {product.comingSoon ? (
          <div className="mt-3 w-full h-11 rounded-sm bg-neutral-200 text-[#6E6A62]/50 text-xs uppercase tracking-[0.15em] font-medium flex items-center justify-center">
            Coming Soon
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="mt-3 w-full h-11 rounded-sm bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5a5650] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Redirecting...' : 'Buy Now'}
          </button>
        )}
      </div>
    </div>
  )
}

export function ProductHighlights({ hero = false }: { hero?: boolean }) {
  return (
    <section className={hero ? "bg-white pt-32 pb-12 md:pt-36 md:pb-16" : "bg-white py-24 md:py-32"}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          {hero && (
            <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/50 mb-4 font-inter">
              Laboratory Created &middot; Dermatologist Tested
            </p>
          )}
          <h2 className="text-3xl md:text-4xl leading-tight mb-4 text-[#6E6A62]">
            The Essentials
          </h2>
          <p className="text-sm text-[#6E6A62]/60 max-w-md mx-auto leading-relaxed">
            Everything you need to glow up — premium formulas, honest
            ingredients, real results.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex h-11 px-8 items-center rounded-full border border-[#6E6A62]/30 text-[#6E6A62] text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#6E6A62] hover:text-white transition-colors font-inter"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
