'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalCents,
  } = useCart()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const totalDollars = (totalCents / 100).toFixed(2)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[61] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#6E6A62]" />
                <h2 className="text-sm uppercase tracking-[0.15em] font-medium text-[#6E6A62]">
                  Your Bag ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
                  <p className="text-sm text-neutral-400">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 py-5 border-b border-neutral-100 last:border-0"
                    >
                      {/* Product image */}
                      <div className="w-20 h-24 relative rounded-sm overflow-hidden bg-[#f5f0eb] flex-shrink-0">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-light text-[#6E6A62]/30">
                              {item.product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-medium text-neutral-900 leading-tight">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-0.5">
                              ${(item.product.price_cents / 100).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-neutral-300 hover:text-neutral-500" />
                          </button>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-0 mt-3 border border-neutral-200 rounded-sm w-fit">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-neutral-500" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm text-neutral-900 tabular-nums border-x border-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>

                        {/* Line total */}
                        <p className="text-sm font-medium text-neutral-900 mt-2 tabular-nums">
                          ${((item.product.price_cents * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="text-lg font-medium text-neutral-900 tabular-nums">
                    ${totalDollars}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full h-12 rounded-sm bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5a5650] transition-colors flex items-center justify-center gap-2"
                >
                  Checkout
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[11px] text-neutral-400 text-center mt-3">
                  Shipping & payment on next step
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
