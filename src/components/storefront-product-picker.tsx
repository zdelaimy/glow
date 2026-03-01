'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { updateStorefrontProducts } from '@/lib/actions/storefront'
import type { Product } from '@/types/database'

interface Props {
  allProducts: Product[]
  selectedIds: string[]
  glowGirlId: string
}

export function StorefrontProductPicker({ allProducts, selectedIds, glowGirlId }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds))
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateStorefrontProducts(glowGirlId, Array.from(selected))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#6E6A62]">Curate Your Storefront</h2>
          <p className="text-sm text-[#6E6A62]/50 mt-1">
            Select the products you want to feature on your storefront.
            {selected.size === 0 && ' All products will be shown if none are selected.'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-[#6E6A62] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#5a5650] transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Selection'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProducts.map((product) => {
          const isSelected = selected.has(product.id)
          return (
            <button
              key={product.id}
              onClick={() => toggle(product.id)}
              className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? 'border-[#6E6A62] shadow-md'
                  : 'border-neutral-200/60 hover:border-[#6E6A62]/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-[#6E6A62] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="relative aspect-[3/4] bg-[#f5f0eb]">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className={`object-cover transition-opacity ${isSelected ? '' : 'opacity-60'}`}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-[#6E6A62]">{product.name}</h3>
                <p className="text-xs text-[#6E6A62]/50 mt-0.5">{product.tagline}</p>
                <p className="text-sm text-[#6E6A62] mt-1">${(product.price_cents / 100).toFixed(2)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
