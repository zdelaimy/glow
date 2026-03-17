'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import type { Product } from '@/types/database'

interface Props {
  product: Product
  glowGirlId: string
  slug: string
}

export function AddToCartButton({ product, glowGirlId, slug }: Props) {
  const { addItem, setAttribution } = useCart()
  const [added, setAdded] = useState(false)

  // Set attribution on mount so the cart knows which Glow Girl to credit
  useEffect(() => {
    setAttribution(glowGirlId, slug)
  }, [glowGirlId, slug, setAttribution])

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-4 py-3 rounded-sm bg-[#f5f0eb]">
        <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60">Price</span>
        <p className="text-2xl font-light text-neutral-900">${(product.price_cents / 100).toFixed(2)}</p>
      </div>

      <button
        onClick={handleAdd}
        className={`w-full h-12 rounded-sm text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-[#6E6A62] text-white hover:bg-[#5a5650]'
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4" />
            Added to Bag
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </>
        )}
      </button>
    </div>
  )
}
