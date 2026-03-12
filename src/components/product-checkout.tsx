'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { trackEvent } from '@/lib/actions/events'
import { ShippingForm, validateShipping, emptyShipping } from '@/components/shipping-form'
import type { ShippingInfo } from '@/components/shipping-form'

interface Props {
  productId: string
  slug: string
  glowGirlId: string
  price: number
}

export function ProductCheckout({ productId, slug, glowGirlId, price }: Props) {
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [shipping, setShipping] = useState<ShippingInfo>(emptyShipping)

  if (success) {
    return (
      <div className="space-y-4 pt-2">
        <div className="px-4 py-6 rounded-sm bg-green-50 text-center">
          <p className="text-sm text-green-800 font-medium">Payment successful! Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-4 py-3 rounded-sm bg-[#f5f0eb]">
        <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60">Price</span>
        <p className="text-2xl font-light text-neutral-900">${(price / 100).toFixed(2)}</p>
      </div>

      {!showPayment ? (
        <button
          className="w-full h-12 rounded-sm bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5a5650] transition-colors"
          onClick={() => setShowPayment(true)}
        >
          Buy Now
        </button>
      ) : (
        <div className="space-y-5">
          <ShippingForm shipping={shipping} onChange={setShipping} />

          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60 font-medium mb-3">
              Payment
            </p>

            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
              <PayPalButtons
                style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
                disabled={loading}
                createOrder={async () => {
                  const shippingError = validateShipping(shipping)
                  if (shippingError) {
                    setError(shippingError)
                    throw new Error(shippingError)
                  }
                  setError(null)

                  const res = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      items: [{ productId, quantity: 1 }],
                    }),
                  })
                  const data = await res.json()
                  if (!data.orderId) throw new Error('Failed to create order')
                  return data.orderId
                }}
                onApprove={async (data) => {
                  setLoading(true)
                  setError(null)

                  try {
                    trackEvent('add_to_cart', glowGirlId)

                    const res = await fetch('/api/paypal/capture-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paypalOrderId: data.orderID,
                        items: [{ productId, quantity: 1 }],
                        glowGirlId,
                        slug,
                        shipping,
                      }),
                    })

                    const result = await res.json()

                    if (result.success) {
                      setSuccess(true)
                      window.location.href = '/order-success'
                    } else {
                      setError(result.error || 'Payment failed. Please try again.')
                    }
                  } catch {
                    setError('Payment failed. Please try again.')
                  } finally {
                    setLoading(false)
                  }
                }}
                onError={(err) => {
                  console.error('PayPal error:', err)
                  setError('Payment failed. Please try again.')
                }}
              />
            </PayPalScriptProvider>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
