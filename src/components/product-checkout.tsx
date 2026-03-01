'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/actions/events'

interface Props {
  productId: string
  slug: string
  glowGirlId: string
  price: number
}

export function ProductCheckout({ productId, slug, glowGirlId, price }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    trackEvent('add_to_cart', glowGirlId)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId, quantity: 1 }],
        glowGirlId,
        slug,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-4 py-3 rounded-sm bg-[#f5f0eb]">
        <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60">Price</span>
        <p className="text-2xl font-light text-neutral-900">${(price / 100).toFixed(2)}</p>
      </div>
      <button
        className="w-full h-12 rounded-sm bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5a5650] transition-colors disabled:opacity-50"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Buy Now'}
      </button>
    </div>
  )
}
