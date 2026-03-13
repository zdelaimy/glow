'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'
import { Check, X } from 'lucide-react'

type Billing = 'monthly' | 'annual'

const PLANS = {
  pro: {
    name: 'Glow Girl Pro',
    monthlyPrice: 200,
    description: 'Everything you need to start selling and earning commissions.',
    planIds: {
      monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PRO_MONTHLY!,
      annual: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PRO_ANNUAL!,
    },
    badge: 'Most Popular',
  },
  elite: {
    name: 'Glow Girl Elite',
    monthlyPrice: 450,
    description: 'For serious builders who want maximum earning potential and exclusive perks.',
    planIds: {
      monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ELITE_MONTHLY!,
      annual: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ELITE_ANNUAL!,
    },
    badge: null as string | null,
  },
} as const

const FEATURES: { label: string; pro: boolean | string; elite: boolean | string }[] = [
  { label: 'Personal storefront & referral link', pro: true, elite: true },
  { label: 'Commission on every sale', pro: '25%', elite: '25%' },
  { label: '2 free products/month ($160 value)', pro: true, elite: true },
  { label: 'Referral match bonus', pro: '10%', elite: '10%' },
  { label: 'Pod override earnings', pro: '5%', elite: '5%' },
  { label: 'Full training library access', pro: true, elite: true },
  { label: 'Monthly bonus eligibility', pro: true, elite: true },
  { label: 'Social media growth coaching', pro: true, elite: true },
  { label: '1-on-1 mentorship', pro: false, elite: true },
  { label: 'Exclusive events & galas', pro: false, elite: true },
  { label: 'Private sales consulting (2x/month)', pro: false, elite: true },
]

function getPrice(monthlyPrice: number, billing: Billing) {
  if (billing === 'annual') {
    const annual = monthlyPrice * 12 * 0.85
    const perMonth = annual / 12
    return { perMonth, total: annual }
  }
  return { perMonth: monthlyPrice, total: monthlyPrice }
}

export default function GlowGirlsPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite' | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader variant="light" ctaHref="/shop" ctaLabel="Shop" />

      <main className="pt-28 pb-24">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-4 font-inter">
            Become a Glow Girl
          </p>
          <h1 className="text-4xl md:text-5xl leading-tight text-[#6E6A62] mb-4">
            Choose your <span className="italic">plan</span>
          </h1>
          <p className="text-[#6E6A62]/60 text-base max-w-lg mx-auto">
            Start your beauty business today. Pick the plan that fits your goals and start earning immediately.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium font-inter transition-all ${
              billing === 'monthly'
                ? 'bg-[#6E6A62] text-white'
                : 'bg-white text-[#6E6A62]/70 border border-[#6E6A62]/15 hover:border-[#6E6A62]/40'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-full text-sm font-medium font-inter transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-[#6E6A62] text-white'
                : 'bg-white text-[#6E6A62]/70 border border-[#6E6A62]/15 hover:border-[#6E6A62]/40'
            }`}
          >
            Annual
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              billing === 'annual'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              Save 15%
            </span>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6 mb-20">
          {(['pro', 'elite'] as const).map((tier) => {
            const plan = PLANS[tier]
            const price = getPrice(plan.monthlyPrice, billing)
            const isElite = tier === 'elite'

            return (
              <div
                key={tier}
                className={`relative bg-white rounded-2xl border overflow-hidden transition-all ${
                  plan.badge
                    ? 'border-[#6E6A62] shadow-lg'
                    : 'border-neutral-200/60'
                }`}
              >
                {plan.badge && (
                  <div className="bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium font-inter text-center py-2">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-lg font-medium text-[#6E6A62] mb-1">{plan.name}</h3>
                  <p className="text-sm text-[#6E6A62]/50 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-light text-[#6E6A62]">
                        ${Math.round(price.perMonth)}
                      </span>
                      <span className="text-sm text-[#6E6A62]/50">/month</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-[#6E6A62]/40 mt-1">
                        ${price.total.toFixed(0)}/year &middot; billed annually
                      </p>
                    )}
                    {billing === 'annual' && (
                      <p className="text-xs text-emerald-600 mt-1">
                        You save ${(plan.monthlyPrice * 12 - price.total).toFixed(0)}/year
                      </p>
                    )}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 mb-8">
                    {FEATURES.map((f) => {
                      const value = tier === 'pro' ? f.pro : f.elite
                      if (value === false) return null
                      return (
                        <li key={f.label} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-[#6E6A62] mt-0.5 flex-shrink-0" />
                          <span className="text-[#6E6A62]/80">
                            {f.label}
                            {typeof value === 'string' && (
                              <span className="text-[#6E6A62] font-medium"> &middot; {value}</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>

                  {/* CTA / PayPal */}
                  {selectedPlan === tier ? (
                    <div>
                      <PayPalScriptProvider
                        options={{
                          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                          vault: true,
                          intent: 'subscription',
                        }}
                      >
                        <PayPalButtons
                          style={{
                            layout: 'vertical',
                            color: isElite ? 'black' : 'silver',
                            shape: 'rect',
                            label: 'subscribe',
                          }}
                          createSubscription={(data, actions) => {
                            return actions.subscription.create({
                              plan_id: plan.planIds[billing],
                            })
                          }}
                          onApprove={async (data) => {
                            try {
                              const res = await fetch('/api/paypal/activate-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  subscriptionId: data.subscriptionID,
                                  plan: tier,
                                  billing,
                                }),
                              })
                              const result = await res.json()
                              if (result.success) {
                                window.location.href = '/welcome'
                              } else {
                                setError(result.error || 'Subscription failed. Please try again.')
                              }
                            } catch {
                              setError('Subscription failed. Please try again.')
                            }
                          }}
                          onError={() => {
                            setError('Payment failed. Please try again.')
                          }}
                        />
                      </PayPalScriptProvider>
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="w-full mt-3 text-sm text-[#6E6A62]/50 hover:text-[#6E6A62] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan(tier)
                        setError(null)
                      }}
                      className={`w-full h-12 rounded-full text-sm font-medium font-inter transition-colors cursor-pointer ${
                        isElite
                          ? 'bg-[#6E6A62] text-white hover:bg-[#5E5A52]'
                          : 'bg-white text-[#6E6A62] border border-[#6E6A62] hover:bg-[#6E6A62] hover:text-white'
                      }`}
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <div className="max-w-4xl mx-auto px-6 mb-10">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Feature comparison table */}
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl text-[#6E6A62] text-center mb-10">
            Compare plans
          </h2>

          <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] border-b border-neutral-100">
              <div className="px-6 py-4" />
              <div className="px-4 py-4 text-center">
                <span className="text-xs uppercase tracking-[0.12em] font-medium text-[#6E6A62]/70 font-inter">
                  Pro
                </span>
              </div>
              <div className="px-4 py-4 text-center bg-[#f5f0eb]/40">
                <span className="text-xs uppercase tracking-[0.12em] font-medium text-[#6E6A62] font-inter">
                  Elite
                </span>
              </div>
            </div>

            {/* Table rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className={`grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] ${
                  i < FEATURES.length - 1 ? 'border-b border-neutral-100' : ''
                }`}
              >
                <div className="px-6 py-3.5 text-sm text-[#6E6A62]/80">
                  {feature.label}
                </div>
                <div className="px-4 py-3.5 flex items-center justify-center">
                  <FeatureValue value={feature.pro} />
                </div>
                <div className="px-4 py-3.5 flex items-center justify-center bg-[#f5f0eb]/40">
                  <FeatureValue value={feature.elite} />
                </div>
              </div>
            ))}

            {/* Price row */}
            <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] border-t border-neutral-200">
              <div className="px-6 py-5 text-sm font-medium text-[#6E6A62]">
                Price
              </div>
              <div className="px-4 py-5 text-center">
                <span className="text-lg font-light text-[#6E6A62]">
                  ${Math.round(getPrice(PLANS.pro.monthlyPrice, billing).perMonth)}
                </span>
                <span className="text-xs text-[#6E6A62]/50">/mo</span>
              </div>
              <div className="px-4 py-5 text-center bg-[#f5f0eb]/40">
                <span className="text-lg font-light text-[#6E6A62]">
                  ${Math.round(getPrice(PLANS.elite.monthlyPrice, billing).perMonth)}
                </span>
                <span className="text-xs text-[#6E6A62]/50">/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-2xl mx-auto px-6 text-center mt-20">
          <h2 className="text-2xl md:text-3xl italic text-[#6E6A62] mb-3">
            Not sure which plan?
          </h2>
          <p className="text-sm text-[#6E6A62]/60 mb-6">
            Start with Pro and upgrade anytime. Your commissions and team carry over.
          </p>
          <Link
            href="/shop"
            className="inline-block text-sm text-[#6E6A62] underline underline-offset-4 hover:text-[#5E5A52] transition-colors"
          >
            Or browse our products first
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-[#6E6A62]" />
  }
  if (value === false) {
    return <X className="w-4 h-4 text-neutral-300" />
  }
  return <span className="text-xs font-medium text-[#6E6A62] font-inter">{value}</span>
}
