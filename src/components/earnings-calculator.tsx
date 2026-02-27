'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'
import { REWARD_TIERS, TOP_SELLER_THRESHOLD_CENTS, TOP_SELLER_OVERFLOW_STEP_CENTS, TOP_SELLER_OVERFLOW_BONUS_CENTS } from '@/lib/commissions/constants'

interface Props {
  tiers: MonthlyBonusTier[]
  settings: CommissionSettings
}

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000, 15000]

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

    // Points projection
    const monthlyPoints = Math.floor(monthlySales) * settings.points_personal_multiplier
    const annualPoints = monthlyPoints * 12

    // Projected tier
    let projectedTier = null
    for (const t of REWARD_TIERS) {
      if (annualPoints >= t.minPoints) {
        projectedTier = t
      }
    }

    return {
      commissionCents,
      bonusCents,
      tierLabel: matchedTier?.tier_label || 'Starter',
      monthlyTotal,
      annualTotal,
      monthlyPoints,
      annualPoints,
      projectedTier,
    }
  }, [monthlySales, tiers, settings])

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Monthly sales volume</Label>
          <Input
            type="number"
            value={monthlySales}
            onChange={(e) => setMonthlySales(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-14 text-2xl font-semibold text-center"
            min={0}
            max={100000}
          />
          <input
            type="range"
            min={0}
            max={20000}
            step={100}
            value={monthlySales}
            onChange={(e) => setMonthlySales(parseInt(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                variant={monthlySales === amt ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMonthlySales(amt)}
                className={monthlySales === amt ? 'bg-violet-600' : ''}
              >
                ${amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white sticky top-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your projected earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Commissions ({(settings.commission_rate * 100).toFixed(0)}%)</span>
                <span className="font-semibold">${(results.commissionCents / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bonus Tier ({results.tierLabel})</span>
                <span className="font-semibold text-emerald-600">+${(results.bonusCents / 100).toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Monthly Total</span>
                <span className="text-xl font-bold text-violet-600">
                  ${(results.monthlyTotal / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected Annual</span>
                <span className="font-semibold">${(results.annualTotal / 100).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Annual Points</span>
                <span className="font-medium">{results.annualPoints.toLocaleString()}</span>
              </div>
              {results.projectedTier && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reward Tier</span>
                  <span className="font-medium text-violet-600">{results.projectedTier.label}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
