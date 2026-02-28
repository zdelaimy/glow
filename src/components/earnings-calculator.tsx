'use client'

import { useState, useMemo } from 'react'
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'
import { TOP_SELLER_THRESHOLD_CENTS, TOP_SELLER_OVERFLOW_STEP_CENTS, TOP_SELLER_OVERFLOW_BONUS_CENTS } from '@/lib/commissions/constants'

interface Props {
  tiers: MonthlyBonusTier[]
  settings: CommissionSettings
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 100000, 500000]

function formatDollar(amt: number) {
  if (amt >= 1000) return `$${(amt / 1000).toLocaleString()}k`
  return `$${amt}`
}

export function EarningsCalculator({ tiers, settings }: Props) {
  const [monthlySales, setMonthlySales] = useState(1000)

  const results = useMemo(() => {
    const salesCents = monthlySales * 100
    const commissionCents = Math.round(salesCents * settings.commission_rate)

    // Find matching bonus tier
    const sorted = [...tiers].sort((a, b) => a.sort_order - b.sort_order)
    let matchedTier = sorted[0]
    for (const tier of sorted) {
      if (commissionCents >= tier.min_commission_cents) {
        matchedTier = tier
      }
    }

    let bonusCents = matchedTier?.bonus_cents || 0

    // Top-seller overflow
    if (commissionCents >= TOP_SELLER_THRESHOLD_CENTS) {
      const above = commissionCents - TOP_SELLER_THRESHOLD_CENTS
      const steps = Math.floor(above / TOP_SELLER_OVERFLOW_STEP_CENTS)
      bonusCents += steps * TOP_SELLER_OVERFLOW_BONUS_CENTS
    }

    const monthlyTotal = commissionCents + bonusCents
    const annualTotal = monthlyTotal * 12

    return {
      commissionCents,
      bonusCents,
      tierLabel: matchedTier?.tier_label || 'Starter',
      monthlyTotal,
      annualTotal,
    }
  }, [monthlySales, tiers, settings])

  return (
    <div className="grid lg:grid-cols-5 gap-8 max-w-4xl mx-auto">
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-3">
          <label className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
            Monthly sales volume
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={`$${monthlySales.toLocaleString()}`}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                setMonthlySales(Math.min(500000, Math.max(0, parseInt(raw) || 0)))
              }}
              className="w-full h-14 text-2xl text-center text-[#6E6A62] bg-[#f5f0eb] border border-neutral-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/20 focus:border-[#6E6A62]/40 transition-all"
            />
          </div>
          <input
            type="range"
            min={0}
            max={500000}
            step={500}
            value={monthlySales}
            onChange={(e) => setMonthlySales(parseInt(e.target.value))}
            className="w-full accent-[#6E6A62]"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setMonthlySales(amt)}
                className={`h-8 px-3.5 rounded-full text-xs font-medium transition-colors cursor-pointer font-inter ${
                  monthlySales === amt
                    ? 'bg-[#6E6A62] text-white'
                    : 'bg-transparent border border-[#6E6A62]/30 text-[#6E6A62] hover:border-[#6E6A62]/60'
                }`}
              >
                {formatDollar(amt)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-[#f5f0eb] rounded-2xl p-6 border border-neutral-200/60 sticky top-8">
          <h3 className="text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter mb-5">
            Your projected earnings
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6E6A62]/60">Commissions ({(settings.commission_rate * 100).toFixed(0)}%)</span>
              <span className="font-medium text-[#6E6A62]">${(results.commissionCents / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6E6A62]/60">Bonus Tier ({results.tierLabel})</span>
              <span className="font-medium text-[#6E6A62]">+${(results.bonusCents / 100).toLocaleString()}</span>
            </div>
            <div className="border-t border-[#6E6A62]/10 pt-3 flex justify-between items-center">
              <span className="font-medium text-[#6E6A62]">Monthly Total</span>
              <span className="text-xl font-light text-[#6E6A62]">
                ${(results.monthlyTotal / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6E6A62]/60">Projected Annual</span>
              <span className="font-medium text-[#6E6A62]">${(results.annualTotal / 100).toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
