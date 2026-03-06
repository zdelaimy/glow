'use client'

import { useState, useMemo } from 'react'
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'
import { TOP_SELLER_THRESHOLD_CENTS, TOP_SELLER_OVERFLOW_STEP_CENTS, TOP_SELLER_OVERFLOW_BONUS_CENTS, LEVEL_OVERRIDE_DEFINITIONS } from '@/lib/commissions/constants'
import { computeUnlockedLevels, getLevelOverrideRates } from '@/lib/commissions/calculate'

interface Props {
  tiers: MonthlyBonusTier[]
  settings: CommissionSettings
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000, 100000]

function formatDollar(amt: number) {
  if (amt >= 1000) return `$${(amt / 1000).toLocaleString()}k`
  return `$${amt}`
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function EarningsCalculator({ tiers, settings }: Props) {
  const [monthlySales, setMonthlySales] = useState(1000)
  const [includeTeam, setIncludeTeam] = useState(false)
  const [recruits, setRecruits] = useState(3)
  const [teamRecruitRate, setTeamRecruitRate] = useState(2)
  const [avgRecruitSales, setAvgRecruitSales] = useState(1000)

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

    // Team override calculation
    let teamOverrideCents = 0
    let levelBreakdown: { level: number; count: number; volumeCents: number; rate: number; overrideCents: number; locked: boolean }[] = []
    let unlockedLevels = 0
    let totalGvCents = 0

    if (includeTeam) {
      const avgRecruitSalesCents = avgRecruitSales * 100
      const rates = getLevelOverrideRates(settings)

      // Fractal model: L1 = your personal recruits, deeper levels replicate at teamRecruitRate
      const levelData: { count: number; volumeCents: number }[] = []
      for (let i = 1; i <= 7; i++) {
        const count = i === 1 ? recruits : levelData[i - 2].count * teamRecruitRate
        const volumeCents = count * avgRecruitSalesCents
        levelData.push({ count, volumeCents })
      }

      totalGvCents = levelData.reduce((sum, l) => sum + l.volumeCents, 0)
      unlockedLevels = computeUnlockedLevels(recruits, totalGvCents, settings)

      levelBreakdown = levelData.map((ld, i) => {
        const level = i + 1
        const locked = level > unlockedLevels
        const overrideCents = locked ? 0 : Math.round(ld.volumeCents * rates[i])
        return { level, count: ld.count, volumeCents: ld.volumeCents, rate: rates[i], overrideCents, locked }
      })

      teamOverrideCents = levelBreakdown.reduce((sum, l) => sum + l.overrideCents, 0)
    }

    const monthlyTotal = commissionCents + bonusCents + teamOverrideCents
    const annualTotal = monthlyTotal * 12

    return {
      commissionCents,
      bonusCents,
      tierLabel: matchedTier?.tier_label || 'Starter',
      teamOverrideCents,
      levelBreakdown,
      unlockedLevels,
      totalGvCents,
      monthlyTotal,
      annualTotal,
    }
  }, [monthlySales, tiers, settings, includeTeam, recruits, teamRecruitRate, avgRecruitSales])

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
                setMonthlySales(Math.min(100000, Math.max(0, parseInt(raw) || 0)))
              }}
              className="w-full h-14 text-2xl text-center text-[#6E6A62] bg-[#f5f0eb] border border-neutral-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/20 focus:border-[#6E6A62]/40 transition-all"
            />
          </div>
          <input
            type="range"
            min={0}
            max={100000}
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

        {/* Team Income Toggle & Inputs */}
        <div className="space-y-4">
          <button
            onClick={() => setIncludeTeam(!includeTeam)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className={`w-9 h-5 rounded-full transition-colors relative ${includeTeam ? 'bg-[#6E6A62]' : 'bg-[#6E6A62]/20'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${includeTeam ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-[#6E6A62] group-hover:text-[#6E6A62]/80 transition-colors font-inter">
              Include team income
            </span>
          </button>

          {includeTeam && (
            <div className="space-y-4 pl-0.5">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                    Personal recruits
                  </label>
                  <span className="text-sm font-medium text-[#6E6A62] tabular-nums">{recruits}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={recruits}
                  onChange={(e) => setRecruits(parseInt(e.target.value))}
                  className="w-full accent-[#6E6A62]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                    Avg recruits per team member
                  </label>
                  <span className="text-sm font-medium text-[#6E6A62] tabular-nums">{teamRecruitRate}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={teamRecruitRate}
                  onChange={(e) => setTeamRecruitRate(parseInt(e.target.value))}
                  className="w-full accent-[#6E6A62]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                    Avg monthly sales per recruit
                  </label>
                  <span className="text-sm font-medium text-[#6E6A62] tabular-nums">${avgRecruitSales.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={500}
                  value={avgRecruitSales}
                  onChange={(e) => setAvgRecruitSales(parseInt(e.target.value))}
                  className="w-full accent-[#6E6A62]"
                />
              </div>
            </div>
          )}
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
              <span className="font-medium text-[#6E6A62]">{formatCents(results.commissionCents)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6E6A62]/60">Bonus Tier ({results.tierLabel})</span>
              <span className="font-medium text-[#6E6A62]">+{formatCents(results.bonusCents)}</span>
            </div>

            {includeTeam && (
              <>
                <div className="border-t border-[#6E6A62]/10 pt-3 space-y-2">
                  {results.levelBreakdown.map((lb) => (
                    <div key={lb.level} className="flex justify-between items-center">
                      <span className="text-sm text-[#6E6A62]/60">
                        L{lb.level} Override ({LEVEL_OVERRIDE_DEFINITIONS[lb.level - 1].rateLabel})
                      </span>
                      {lb.locked ? (
                        <span className="text-xs text-[#6E6A62]/30 font-inter">Locked</span>
                      ) : (
                        <span className="font-medium text-[#6E6A62]">+{formatCents(lb.overrideCents)}</span>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-medium text-[#6E6A62]/70">Total Team Overrides</span>
                    <span className="font-medium text-[#6E6A62]">+{formatCents(results.teamOverrideCents)}</span>
                  </div>
                </div>
                <div className="text-xs text-[#6E6A62]/40 font-inter leading-relaxed">
                  Group Volume: {formatDollar(Math.round(results.totalGvCents / 100))} · Level {results.unlockedLevels} of 7 unlocked
                  <br />
                  Team size: {results.levelBreakdown.reduce((s, l) => s + l.count, 0).toLocaleString()} across 7 levels
                </div>
              </>
            )}

            <div className="border-t border-[#6E6A62]/10 pt-3 flex justify-between items-center">
              <span className="font-medium text-[#6E6A62]">Monthly Total</span>
              <span className="text-xl font-light text-[#6E6A62]">
                {formatCents(results.monthlyTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6E6A62]/60">Projected Annual</span>
              <span className="font-medium text-[#6E6A62]">{formatCents(results.annualTotal)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
