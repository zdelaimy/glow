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

export function StorefrontAddToCart({ product, glowGirlId, slug }: Props) {
  const { addItem, setAttribution } = useCart()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setAttribution(glowGirlId, slug)
  }, [glowGirlId, slug, setAttribution])

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
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
  )
}
