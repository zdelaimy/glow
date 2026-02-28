"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

const products = [
  {
    name: "Shine Shampoo",
    tagline: "Argan & silk protein gloss shampoo",
    price: 42,
    img: "/shop/shampoo2.png",
  },
  {
    name: "Glow Serum",
    tagline: "Vitamin C & hyaluronic radiance serum",
    price: 54,
    img: "/shop/serum2.png",
  },
  {
    name: "Beauty Gummies",
    tagline: "Collagen + biotin daily supplement",
    price: 44,
    img: "/shop/gummies.png",
  },
]

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href="/shop"
      className="group relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#eae5df]">
        <Image
          src={product.img}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Hover CTA bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#6E6A62]/90 backdrop-blur-sm px-5 py-3.5 transition-all duration-400 ease-out ${
            hovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <span className="block text-center text-white text-xs tracking-[0.15em] uppercase font-medium">
            Buy {product.name} — ${product.price}.00
          </span>
        </div>
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
      </div>
    </Link>
  )
}

export function ProductHighlights() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
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
