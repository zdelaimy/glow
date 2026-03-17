'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, Trash2, Lock, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { ShippingForm, validateShipping, emptyShipping, getShippingCost } from '@/components/shipping-form'
import type { ShippingInfo } from '@/components/shipping-form'
import SquareCardForm from '@/components/square-card-form'
import { LandingHeader } from '@/components/landing-header'

export default function CheckoutPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalCents,
    glowGirlId,
    slug,
  } = useCart()

  const [shipping, setShipping] = useState<ShippingInfo>(emptyShipping)
  const [error, setError] = useState<string | null>(null)

  const shippingCents = getShippingCost(shipping.country)
  const grandTotalCents = totalCents + shippingCents

  const handleTokenize = useCallback(async (token: string) => {
    const shippingError = validateShipping(shipping)
    if (shippingError) {
      setError(shippingError)
      throw new Error(shippingError)
    }

    setError(null)

    const res = await fetch('/api/square/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: token,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        glowGirlId,
        slug,
        shipping,
      }),
    })

    const data = await res.json()

    if (data.success) {
      clearCart()
      window.location.href = slug ? `/${slug}/order-success` : '/order-success'
    } else {
      const msg = data.error || 'Payment failed. Please try again.'
      setError(msg)
      throw new Error(msg)
    }
  }, [items, glowGirlId, slug, shipping, clearCart])

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader variant="light" />

      <main className="pt-32 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 hover:text-[#6E6A62] transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-light text-[#6E6A62] mb-10">
            Checkout
          </h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <ShoppingBag className="w-12 h-12 text-[#6E6A62]/20 mx-auto mb-4" />
              <p className="text-[#6E6A62]/50 mb-6">Your bag is empty</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 rounded-sm hover:bg-[#5a5650] transition-colors"
              >
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
              {/* Left — Items + Shipping */}
              <div className="space-y-6">
                {/* Items */}
                <div className="bg-white rounded-xl border border-[#6E6A62]/[0.06] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#6E6A62]/[0.06]">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-medium">
                      Your Items ({totalItems})
                    </h2>
                  </div>

                  <div className="divide-y divide-[#6E6A62]/[0.06]">
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-5 p-6"
                      >
                        {/* Product image */}
                        <div className="w-24 h-28 relative rounded-sm overflow-hidden bg-[#f5f0eb] flex-shrink-0">
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl font-light text-[#6E6A62]/30">
                                {item.product.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-medium text-[#6E6A62]">
                                {item.product.name}
                              </h3>
                              {item.product.tagline && (
                                <p className="text-xs text-[#6E6A62]/40 mt-0.5">
                                  {item.product.tagline}
                                </p>
                              )}
                              <p className="text-sm text-[#6E6A62]/70 mt-1">
                                ${(item.product.price_cents / 100).toFixed(2)} each
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1.5 hover:bg-[#6E6A62]/[0.06] rounded transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-[#6E6A62]/30 hover:text-[#6E6A62]/60" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity */}
                            <div className="flex items-center gap-0 border border-[#6E6A62]/15 rounded-sm">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-[#6E6A62]/[0.04] transition-colors"
                              >
                                <Minus className="w-3 h-3 text-[#6E6A62]/60" />
                              </button>
                              <span className="w-9 h-9 flex items-center justify-center text-sm text-[#6E6A62] tabular-nums border-x border-[#6E6A62]/15">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-[#6E6A62]/[0.04] transition-colors"
                              >
                                <Plus className="w-3 h-3 text-[#6E6A62]/60" />
                              </button>
                            </div>

                            {/* Line total */}
                            <span className="text-base font-medium text-[#6E6A62] tabular-nums">
                              ${((item.product.price_cents * item.quantity) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-xl border border-[#6E6A62]/[0.06] p-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-medium mb-5">
                    Shipping Information
                  </h2>
                  <ShippingForm shipping={shipping} onChange={setShipping} hideHeader />
                </div>

                {/* Payment */}
                <div className="bg-white rounded-xl border border-[#6E6A62]/[0.06] p-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-medium mb-5">
                    Payment
                  </h2>
                  <SquareCardForm
                    onTokenize={handleTokenize}
                    buttonLabel={`Pay $${(grandTotalCents / 100).toFixed(2)}`}
                  />
                  {error && (
                    <p className="text-sm text-red-600 text-center mt-3">{error}</p>
                  )}
                </div>
              </div>

              {/* Right — Order Summary */}
              <div className="lg:sticky lg:top-28">
                <div className="bg-white rounded-xl border border-[#6E6A62]/[0.06] p-6">
                  <h2 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-medium mb-5">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-[#6E6A62]/70">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-[#6E6A62] tabular-nums">
                          ${((item.product.price_cents * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#6E6A62]/[0.06] pt-4 mb-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-[#6E6A62]/50">Subtotal</span>
                      <span className="text-sm text-[#6E6A62] tabular-nums">
                        ${(totalCents / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6E6A62]/50">Shipping</span>
                      <span className="text-sm text-[#6E6A62] tabular-nums">
                        {shippingCents === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${(shippingCents / 100).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {shippingCents > 0 && (
                      <p className="text-[11px] text-[#6E6A62]/40 mt-1">
                        International flat rate · Free shipping within the US
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline pt-4 border-t border-[#6E6A62]/15">
                    <span className="text-sm font-medium text-[#6E6A62]">Total</span>
                    <span className="text-2xl font-light text-[#6E6A62] tabular-nums">
                      ${(grandTotalCents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-5">
                    <Lock className="w-3 h-3 text-[#6E6A62]/30" />
                    <p className="text-[11px] text-[#6E6A62]/30">
                      Secure checkout powered by Square
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
