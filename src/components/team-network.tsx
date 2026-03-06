'use client'

import { useEffect, useState } from 'react'
import { getTeamNetwork, type TeamMember, type TeamData } from '@/lib/actions/team'
import { LEVEL_OVERRIDE_DEFINITIONS } from '@/lib/commissions/constants'

const GLOW_SERUM_PRICE_CENTS = 8000 // $80

// Seed fake data for demo purposes — sales are in units of Glow Serum ($80)
const FAKE_UPLINE: TeamMember[] = [
  { id: 'up-1', brandName: 'Jessica Glow', level: 1, salesThisMonth: 40 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2025-06-15T00:00:00Z' },
]

const FAKE_DOWNLINE: TeamMember[] = [
  { id: 'down-1', brandName: 'Mia Luxe', level: 1, salesThisMonth: 38 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2025-09-01T00:00:00Z' },
  { id: 'down-2', brandName: 'Olivia Skin', level: 1, salesThisMonth: 22 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2025-10-14T00:00:00Z' },
  { id: 'down-3', brandName: 'Ava Belle', level: 1, salesThisMonth: 8 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2025-12-02T00:00:00Z' },
  { id: 'down-4', brandName: 'Sophia Ray', level: 2, salesThisMonth: 17 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2026-01-10T00:00:00Z' },
  { id: 'down-5', brandName: 'Chloe Dew', level: 2, salesThisMonth: 11 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2026-01-22T00:00:00Z' },
  { id: 'down-6', brandName: 'Lily Radiance', level: 3, salesThisMonth: 3 * GLOW_SERUM_PRICE_CENTS, joinedAt: '2026-02-15T00:00:00Z' },
]

// Simple seeded multiplier so fake data varies by month
function monthMultiplier(period: string): number {
  const [y, m] = period.split('-').map(Number)
  const hash = (y * 12 + m) % 7
  return [0.7, 0.85, 1.0, 1.15, 0.9, 0.75, 1.1][hash]
}

const FAKE_PERSONAL_SALES = 53 * GLOW_SERUM_PRICE_CENTS // 53 units = $4,240

function useFakeIfEmpty(data: TeamData | null, period: string): TeamData {
  if (!data) return buildFake(period)
  const hasReal = data.upline.length > 0 || data.downline.length > 0
  if (hasReal) return data
  return buildFake(period)
}

function buildFake(period: string): TeamData {
  const mult = monthMultiplier(period)
  return {
    upline: FAKE_UPLINE,
    downline: FAKE_DOWNLINE.map(m => ({
      ...m,
      salesThisMonth: Math.round(unitsFromCents(m.salesThisMonth) * mult) * GLOW_SERUM_PRICE_CENTS,
    })),
    personalSales: Math.round(unitsFromCents(FAKE_PERSONAL_SALES) * mult) * GLOW_SERUM_PRICE_CENTS,
  }
}

const DIRECT_COMMISSION_RATE = 0.25

function getOverrideRate(level: number): number {
  const def = LEVEL_OVERRIDE_DEFINITIONS.find(d => d.level === level)
  return def?.rate ?? 0
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function unitsFromCents(cents: number): number {
  return Math.round(cents / GLOW_SERUM_PRICE_CENTS)
}

function getLast6Months(): { label: string; value: string }[] {
  const months: { label: string; value: string }[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: d.toISOString().slice(0, 7),
    })
  }
  return months
}

export function TeamNetwork({ glowGirlId, glowGirlName }: { glowGirlId: string; glowGirlName: string }) {
  const periods = getLast6Months()
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0].value)
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setLoading(true)
    getTeamNetwork(glowGirlId, selectedPeriod)
      .then((data) => {
        setTeamData(data)
        const hasReal = data.upline.length > 0 || data.downline.length > 0
        setIsDemo(!hasReal)
      })
      .catch(() => {
        setTeamData(null)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
  }, [glowGirlId, selectedPeriod])

  const data = useFakeIfEmpty(teamData, selectedPeriod)

  // Group downline by level
  const downlineByLevel: Record<number, TeamMember[]> = {}
  for (const member of data.downline) {
    if (!downlineByLevel[member.level]) downlineByLevel[member.level] = []
    downlineByLevel[member.level].push(member)
  }
  const downlineLevels = Object.keys(downlineByLevel).map(Number).sort((a, b) => a - b)

  const totalOverrideEarnings = data.downline.reduce((s, m) => s + m.salesThisMonth * getOverrideRate(m.level), 0)
  const directCommission = data.personalSales * DIRECT_COMMISSION_RATE
  const totalEarnings = directCommission + totalOverrideEarnings

  // Direct recruiter (L1 upline only)
  const directRecruiter = data.upline.find(m => m.level === 1) ?? null

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
        <div className="animate-pulse text-[#6E6A62]/50">Loading team network...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
          This is a preview with sample data. Your actual team network will appear here as you recruit Glow Girls.
        </div>
      )}

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setSelectedPeriod(p.value)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedPeriod === p.value
                ? 'bg-[#6E6A62] text-white'
                : 'bg-[#f5f0eb] text-[#6E6A62]/70 hover:bg-[#6E6A62]/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Your Sales', value: formatCents(data.personalSales) },
          { label: 'Direct Commission (25%)', value: formatCents(directCommission) },
          { label: 'Override Earnings', value: formatCents(totalOverrideEarnings) },
          { label: 'Total Earnings', value: formatCents(totalEarnings) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
            <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
            <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Upline - Direct recruiter only */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Recruited By</h3>
        </div>
        <div className="p-6">
          {!directRecruiter ? (
            <p className="text-center text-[#6E6A62]/50 py-4">No upline — you&apos;re at the top!</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#6E6A62]/10 flex items-center justify-center text-sm font-medium text-[#6E6A62]">
                {directRecruiter.brandName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[#6E6A62]">{directRecruiter.brandName}</p>
                <p className="text-xs text-[#6E6A62]/40">
                  Joined {new Date(directRecruiter.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YOU node */}
      <div className="flex justify-center">
        <div className="bg-[#6E6A62] text-white rounded-2xl px-8 py-4 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1">You</div>
          <div className="font-medium text-lg">{glowGirlName}</div>
        </div>
      </div>

      {/* Direct Sales */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Your Direct Sales</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-light text-[#6E6A62]">{formatCents(data.personalSales)}</p>
              <p className="text-xs text-[#6E6A62]/40 mt-1">in sales this period</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light text-emerald-600">{formatCents(directCommission)}</p>
              <p className="text-xs text-emerald-600/70 mt-1">25% commission</p>
            </div>
          </div>
          {data.personalSales > 0 && (
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#f5f0eb]/40 border border-[#6E6A62]/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6E6A62]/10 flex items-center justify-center text-xs font-medium text-[#6E6A62]">G</div>
                <div>
                  <p className="text-sm font-medium text-[#6E6A62]">Glow Serum</p>
                  <p className="text-xs text-[#6E6A62]/40">$80.00 each</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#6E6A62]">{unitsFromCents(data.personalSales)} units</p>
                <p className="text-xs text-[#6E6A62]/40">{formatCents(data.personalSales)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Downline with commission info */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Your Downline</h3>
          <p className="text-xs text-[#6E6A62]/40 mt-1">Glow Girls you&apos;ve recruited and their recruits</p>
        </div>
        <div className="p-6">
          {data.downline.length === 0 ? (
            <p className="text-center text-[#6E6A62]/50 py-4">
              No recruits yet. Share your referral link to build your team!
            </p>
          ) : (
            <div className="space-y-6">
              {downlineLevels.map((level) => {
                const rate = getOverrideRate(level)
                const levelMembers = downlineByLevel[level]
                const levelSales = levelMembers.reduce((s, m) => s + m.salesThisMonth, 0)
                const levelOverride = levelSales * rate

                return (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        level === 1
                          ? 'bg-emerald-500 text-white'
                          : level === 2
                          ? 'bg-blue-500 text-white'
                          : 'bg-[#6E6A62]/20 text-[#6E6A62]'
                      }`}>
                        {level}
                      </span>
                      <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-medium">
                        Level {level} — {level === 1 ? 'Your direct recruits' : `${level} levels deep`}
                      </span>
                    </div>
                    <div className="grid gap-2 ml-8">
                      {levelMembers.map((member) => {
                        const memberOverride = member.salesThisMonth * rate
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#f5f0eb]/40 border border-[#6E6A62]/5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${
                                level === 1
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : level === 2
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-[#f5f0eb] text-[#6E6A62]/60'
                              }`}>
                                {member.brandName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#6E6A62] truncate">{member.brandName}</p>
                                <p className="text-xs text-[#6E6A62]/40">
                                  Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-sm font-medium text-[#6E6A62]">
                                {unitsFromCents(member.salesThisMonth)} serums · {formatCents(member.salesThisMonth)}
                              </p>
                              <p className="text-xs text-emerald-600 font-medium">
                                +{formatCents(memberOverride)} override
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      {/* Level summary */}
                      <div className="flex items-center justify-between py-2 px-4 text-xs text-[#6E6A62]/60">
                        <span>Level {level} Total</span>
                        <span>
                          {formatCents(levelSales)} sales → <span className="text-emerald-600 font-medium">{formatCents(levelOverride)} override ({(rate * 100).toFixed(0)}%)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
