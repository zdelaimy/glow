'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { trackEvent } from '@/lib/actions/events'

interface Props {
  signatureId: string
  slug: string
  glowGirlId: string
  subscriptionPrice: number
  oneTimePrice: number
  accentColor: string
}

export function ProductCheckout({ signatureId, slug, glowGirlId, subscriptionPrice, oneTimePrice, accentColor }: Props) {
  const [isSubscription, setIsSubscription] = useState(true)
  const [loading, setLoading] = useState(false)

  const price = isSubscription ? subscriptionPrice : oneTimePrice

  async function handleCheckout() {
    setLoading(true)
    trackEvent('add_to_cart', glowGirlId, signatureId)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signatureId,
        mode: isSubscription ? 'subscription' : 'payment',
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
      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
        <div className="flex items-center gap-3">
          <Switch
            checked={isSubscription}
            onCheckedChange={setIsSubscription}
          />
          <Label className="cursor-pointer">
            {isSubscription ? 'Subscribe & Save' : 'One-time purchase'}
          </Label>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">${(price / 100).toFixed(2)}</p>
          {isSubscription && <p className="text-xs text-muted-foreground">per month</p>}
        </div>
      </div>
      {isSubscription && (
        <p className="text-xs text-muted-foreground text-center">
          Save ${((oneTimePrice - subscriptionPrice) / 100).toFixed(2)} vs. one-time purchase. Cancel anytime.
        </p>
      )}
      <Button
        className="w-full h-14 text-base rounded-full"
        style={{ backgroundColor: accentColor }}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? 'Redirecting...' : isSubscription ? 'Subscribe Now' : 'Buy Now'}
      </Button>
    </div>
  )
}
