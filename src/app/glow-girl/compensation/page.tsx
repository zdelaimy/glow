import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamNetwork } from '@/components/team-network'
import { PayoutCard } from '@/components/wallet'
import { getPayoutData } from '@/lib/actions/wallet'
import { CompPlanCalculator } from './_components/comp-plan-calculator'
import { LEVEL_OVERRIDE_DEFINITIONS } from '@/lib/commissions/constants'
import type { MonthlyBonusTier } from '@/types/database'

// Demo commission entries
const DEMO_COMMISSIONS = [
  { id: 'demo-1', commission_type: 'PERSONAL', amount_cents: 106000, status: 'APPROVED', override_level: null, created_at: new Date().toISOString() },
  { id: 'demo-2', commission_type: 'LEVEL_OVERRIDE', amount_cents: 54400, status: 'APPROVED', override_level: 1, created_at: new Date().toISOString() },
  { id: 'demo-3', commission_type: 'LEVEL_OVERRIDE', amount_cents: 11200, status: 'APPROVED', override_level: 2, created_at: new Date().toISOString() },
  { id: 'demo-4', commission_type: 'LEVEL_OVERRIDE', amount_cents: 960, status: 'PENDING', override_level: 3, created_at: new Date().toISOString() },
]

const DEMO_TREND = (() => {
  const months: { month: string; total: number }[] = []
  const mults = [0.7, 0.85, 1.0, 1.15, 0.9, 1.0]
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push({ month: d.toISOString().slice(0, 7), total: Math.round(172560 * mults[5 - i]) })
  }
  return months
})()

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  starter: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  bronze: { bg: 'bg-amber-100/80', text: 'text-amber-700' },
  silver: { bg: 'bg-slate-200/60', text: 'text-slate-600' },
  gold: { bg: 'bg-yellow-100/80', text: 'text-yellow-700' },
  platinum: { bg: 'bg-indigo-100/60', text: 'text-indigo-600' },
  ruby: { bg: 'bg-rose-100/80', text: 'text-rose-600' },
  emerald: { bg: 'bg-emerald-100/80', text: 'text-emerald-700' },
  sapphire: { bg: 'bg-blue-100/80', text: 'text-blue-600' },
  diamond: { bg: 'bg-violet-100/80', text: 'text-violet-600' },
}

function getTierColors(label: string) {
  const key = label.toLowerCase().replace(/\s+/g, '').replace(/\+$/, '')
  return TIER_COLORS[key] || { bg: 'bg-[#f5f0eb]', text: 'text-[#6E6A62]' }
}

export default async function CompensationPage() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()
  const currentPeriod = new Date().toISOString().slice(0, 7)

  // Earnings data
  const { data: monthCommissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('glow_girl_id', glowGirl.id)
    .eq('period', currentPeriod)
    .order('created_at', { ascending: false })

  const monthCommTotal = (monthCommissions || [])
    .filter(c => c.status !== 'CANCELLED')
    .reduce((s, c) => s + c.amount_cents, 0)

  const { data: monthBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('period', currentPeriod)

  const monthBonusTotal = (monthBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  const { data: allCommissions } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .in('status', ['APPROVED', 'PAID'])

  const { data: allBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)

  const lifetimeTotal = (allCommissions || []).reduce((s, c) => s + c.amount_cents, 0) +
    (allBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  const { data: pendingPayouts } = await supabase
    .from('payouts')
    .select('total_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('status', 'PENDING')

  const pendingPayoutTotal = (pendingPayouts || []).reduce((s, p) => s + p.total_cents, 0)

  // Bonus tier progress
  const { data: bonusTiers } = await supabase
    .from('monthly_bonus_tiers')
    .select('*')
    .order('sort_order')

  const sortedTiers = (bonusTiers || []) as MonthlyBonusTier[]

  // Rank data
  const { data: rankData } = await supabase
    .from('glow_girl_ranks')
    .select('*')
    .eq('glow_girl_id', glowGirl.id)
    .single()

  const unlockedLevels = rankData?.unlocked_levels || 0
  const rankLabel = rankData?.rank_label || 'Starter'
  const groupVolumeCents = rankData?.group_volume_cents || 0

  const { data: overrideEarnings } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .in('commission_type', ['LEVEL_OVERRIDE'])
    .eq('period', currentPeriod)

  const overrideEarningsTotal = (overrideEarnings || []).reduce((s, c) => s + c.amount_cents, 0)

  // Payout data
  const payoutData = await getPayoutData(glowGirl.id)

  // Monthly trend
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(d.toISOString().slice(0, 7))
  }

  const { data: trendCommissions } = await supabase
    .from('commissions')
    .select('period, amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .in('period', months)
    .in('status', ['PENDING', 'APPROVED', 'PAID'])

  const realTrendData = months.map(m => {
    const total = (trendCommissions || [])
      .filter(c => c.period === m)
      .reduce((s, c) => s + c.amount_cents, 0)
    return { month: m, total }
  })

  // Demo detection
  const hasRealEarnings = monthCommTotal > 0 || lifetimeTotal > 0
  const isEarningsDemo = !hasRealEarnings

  const displayCommissions = isEarningsDemo ? DEMO_COMMISSIONS : (monthCommissions || [])
  const displayMonthTotal = isEarningsDemo ? DEMO_COMMISSIONS.reduce((s, c) => s + c.amount_cents, 0) : monthCommTotal
  const displayBonusTotal = isEarningsDemo ? 0 : monthBonusTotal
  const displayLifetime = isEarningsDemo ? DEMO_COMMISSIONS.reduce((s, c) => s + c.amount_cents, 0) : lifetimeTotal
  const displayPending = isEarningsDemo ? 0 : pendingPayoutTotal
  const displayOverride = isEarningsDemo
    ? DEMO_COMMISSIONS.filter(c => c.commission_type === 'LEVEL_OVERRIDE').reduce((s, c) => s + c.amount_cents, 0)
    : overrideEarningsTotal
  const trendData = isEarningsDemo ? DEMO_TREND : realTrendData
  const maxTrend = Math.max(...trendData.map(t => t.total), 1)

  let currentBonusTier = sortedTiers[0]
  let nextBonusTier: MonthlyBonusTier | null = null
  for (let i = 0; i < sortedTiers.length; i++) {
    if (displayMonthTotal >= sortedTiers[i].min_commission_cents) {
      currentBonusTier = sortedTiers[i]
      nextBonusTier = sortedTiers[i + 1] || null
    }
  }

  const tierProgress = nextBonusTier
    ? ((displayMonthTotal - currentBonusTier.min_commission_cents) /
       (nextBonusTier.min_commission_cents - currentBonusTier.min_commission_cents)) * 100
    : 100

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">Compensation</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Your earnings, comp plan, and network.
        </p>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto flex-wrap">
          {[
            { value: 'earnings', label: 'Earnings' },
            { value: 'comp-plan', label: 'Comp Plan' },
            { value: 'network', label: 'Team Network' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full text-xs uppercase tracking-[0.15em] px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm text-[#6E6A62]/50"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── Earnings Tab ─── */}
        <TabsContent value="earnings" className="space-y-8">
          {isEarningsDemo && (
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
              This is a preview with sample data. Your actual earnings will appear here as you make sales.
            </div>
          )}

          <PayoutCard
            glowGirlId={glowGirl.id}
            hasTaxId={payoutData.hasTaxId}
            taxIdLast4={payoutData.taxIdLast4}
            payoutMethod={payoutData.payoutMethod}
            estimatedPayoutCents={payoutData.estimatedPayoutCents}
            approvedCents={payoutData.approvedCents}
            pendingCents={payoutData.pendingCents}
            nextPayoutDate={payoutData.nextPayoutDate}
            payoutHistory={payoutData.payoutHistory}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "This Month's Commissions", value: `$${(displayMonthTotal / 100).toFixed(2)}` },
              { label: 'Monthly Bonus', value: `$${(displayBonusTotal / 100).toFixed(2)}` },
              { label: 'Lifetime Earnings', value: `$${(displayLifetime / 100).toFixed(2)}` },
              { label: 'Next Payout', value: `$${(displayPending / 100).toFixed(2)}` },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
                <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
                <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Bonus tier progress */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Current Bonus Tier</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#6E6A62] text-white px-3 py-1 text-xs font-medium">
                  {currentBonusTier?.tier_label || 'Starter'}
                </span>
                {nextBonusTier && (
                  <span className="text-sm text-[#6E6A62]/50">
                    ${((nextBonusTier.min_commission_cents - displayMonthTotal) / 100).toLocaleString()} to {nextBonusTier.tier_label}
                  </span>
                )}
              </div>
              <div className="h-2 bg-[#f5f0eb] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6E6A62] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, tierProgress)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rank & Override Progress */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Your Rank</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-[#6E6A62] text-white px-3 py-1 text-xs font-medium">
                    {rankLabel}
                  </span>
                  <span className="ml-3 text-sm text-[#6E6A62]/60">
                    Level {unlockedLevels} of 7 unlocked
                  </span>
                </div>
                <span className="text-sm text-[#6E6A62]/60">
                  Override earnings: ${(displayOverride / 100).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f5f0eb]/50">
                <span className="text-sm text-[#6E6A62]/70">Your Group Volume</span>
                <span className="text-sm font-medium text-[#6E6A62]">${(groupVolumeCents / 100).toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                {LEVEL_OVERRIDE_DEFINITIONS.map((def) => {
                  const isUnlocked = def.level <= unlockedLevels
                  const isNext = def.level === unlockedLevels + 1
                  return (
                    <div
                      key={def.level}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                        isUnlocked
                          ? 'bg-emerald-50/80'
                          : isNext
                          ? 'bg-amber-50/80 border border-amber-200/60'
                          : 'bg-[#f5f0eb]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                          isUnlocked ? 'bg-emerald-500 text-white' : 'bg-[#6E6A62]/20 text-[#6E6A62]/50'
                        }`}>
                          {def.level}
                        </span>
                        <span className={isUnlocked ? 'text-emerald-800' : 'text-[#6E6A62]/60'}>
                          L{def.level} Override — {def.rateLabel}
                        </span>
                      </div>
                      <span className={`text-xs ${isUnlocked ? 'text-emerald-600' : 'text-[#6E6A62]/40'}`}>
                        {isUnlocked ? 'Unlocked' : def.requirement}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Monthly trend */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Monthly Trend</h3>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-2 h-32">
                {trendData.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#6E6A62]/20 rounded-t transition-all"
                      style={{ height: `${(m.total / maxTrend) * 100}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                    />
                    <span className="text-xs text-[#6E6A62]/50">
                      {m.month.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commissions table */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Commissions This Month</h3>
            </div>
            <div className="p-6">
              {displayCommissions.length === 0 ? (
                <p className="text-center text-[#6E6A62]/50 py-6">No commissions yet this month.</p>
              ) : (
                <div className="divide-y divide-neutral-200/60">
                  {displayCommissions.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#6E6A62]">
                          {c.commission_type === 'PERSONAL' ? 'Personal Sale'
                            : c.commission_type === 'LEVEL_OVERRIDE' ? `L${c.override_level} Override`
                            : c.commission_type === 'POD_OVERRIDE' ? 'Pod Override'
                            : 'Referral Match'}
                        </p>
                        <p className="text-xs text-[#6E6A62]/50">
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#6E6A62]">${(c.amount_cents / 100).toFixed(2)}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                          c.status === 'APPROVED' || c.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#f5f0eb] text-[#6E6A62]'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── Comp Plan Tab ─── */}
        <TabsContent value="comp-plan" className="space-y-8">
          {/* Earnings Calculator */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Earnings Calculator</h3>
            </div>
            <div className="p-6">
              <CompPlanCalculator />
            </div>
          </div>

          {/* 7-Level Override Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">7-Level Team Overrides</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#6E6A62]/60 mb-6">
                Earn overrides on the order amount from sales made by your team, up to 7 levels deep. Unlock deeper levels as you grow.
              </p>
              <div className="rounded-2xl overflow-hidden border border-neutral-200/60">
                <div className="grid grid-cols-3 bg-[#6E6A62] text-white px-6 py-3 text-sm font-inter font-semibold">
                  <span>Level</span>
                  <span className="text-center">You Earn</span>
                  <span className="text-right">What This Means</span>
                </div>
                {/* Personal row */}
                <div className="grid grid-cols-3 items-center px-6 py-3.5 bg-[#6E6A62]/[0.04] border-b border-neutral-200/60">
                  <span className="text-sm font-semibold text-[#6E6A62]">You</span>
                  <span className="text-center text-lg font-bold text-[#6E6A62]">25%</span>
                  <span className="text-right text-sm text-[#6E6A62]/60">Your own sales</span>
                </div>
                {[
                  { level: 'Level 1', rate: '10%', desc: 'People you recruit' },
                  { level: 'Level 2', rate: '5%', desc: 'Their recruits' },
                  { level: 'Level 3', rate: '4%', desc: '3 layers below you' },
                  { level: 'Level 4', rate: '3%', desc: '4 layers below you' },
                  { level: 'Level 5', rate: '2%', desc: '5 layers below you' },
                  { level: 'Level 6', rate: '1%', desc: '6 layers below you' },
                  { level: 'Level 7', rate: '1%', desc: '7 layers below you' },
                ].map((row, i) => (
                  <div
                    key={row.level}
                    className={`grid grid-cols-3 px-6 py-3.5 text-sm items-center border-b border-neutral-200/60 last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-[#f5f0eb]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#6E6A62]/[0.08] flex items-center justify-center text-sm font-bold text-[#6E6A62] font-inter">
                        {i + 1}
                      </span>
                      <span className="text-[#6E6A62] font-medium">{row.level}</span>
                    </div>
                    <span className="text-center text-lg font-bold text-[#6E6A62]">{row.rate}</span>
                    <span className="text-right text-[#6E6A62]/60">{row.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-[#6E6A62]/50 mt-4">
                <span className="font-semibold text-[#6E6A62]/70">Example:</span> Someone 3 levels below you sells a $80 serum.
                You automatically earn <span className="font-semibold text-[#6E6A62]/70">$3.20</span> (4%).
              </p>
            </div>
          </div>

          {/* Monthly Bonus Tier Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Monthly Bonus Tiers</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#6E6A62]/60 mb-6">
                Hit commission milestones each month and unlock bonus payouts on top of your earnings.
              </p>
              <div className="rounded-2xl overflow-hidden border border-neutral-200/60">
                <div className="grid grid-cols-3 px-6 py-3 text-xs font-medium text-[#6E6A62]/50 uppercase tracking-[0.15em] border-b border-neutral-100">
                  <span>Monthly Commissions</span>
                  <span className="text-center">Tier</span>
                  <span className="text-right">Bonus</span>
                </div>
                {sortedTiers.map((tier, i) => (
                  <div
                    key={tier.id}
                    className={`grid grid-cols-3 px-6 py-3.5 text-sm items-center ${
                      i % 2 === 0 ? '' : 'bg-[#f5f0eb]/30'
                    }`}
                  >
                    <span className="text-[#6E6A62]">
                      ${(tier.min_commission_cents / 100).toLocaleString()}
                      {tier.max_commission_cents ? ` – $${(tier.max_commission_cents / 100).toLocaleString()}` : '+'}
                    </span>
                    <span className="text-center">
                      <span className={`inline-block text-xs uppercase tracking-[0.1em] px-3 py-1 rounded-full font-medium ${getTierColors(tier.tier_label).bg} ${getTierColors(tier.tier_label).text}`}>
                        {tier.tier_label}
                      </span>
                    </span>
                    <span className="text-right font-medium text-[#6E6A62]">
                      {tier.bonus_cents > 0 ? `$${(tier.bonus_cents / 100).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── Team Network Tab ─── */}
        <TabsContent value="network">
          <TeamNetwork glowGirlId={glowGirl.id} glowGirlName={glowGirl.brand_name || 'You'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
