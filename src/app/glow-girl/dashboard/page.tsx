import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReferralShare } from '@/components/referral-share'
import { AffiliateLink } from '@/components/affiliate-link'
import { EarningsCalculator } from '@/components/earnings-calculator'
import { WalletCard } from '@/components/wallet'
import { getWalletData } from '@/lib/actions/wallet'
import { LEVEL_OVERRIDE_DEFINITIONS } from '@/lib/commissions/constants'
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'

// Demo commission entries matching the My Team fake data (Glow Serum @ $80)
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

export default async function GlowGirlDashboard() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()
  const currentPeriod = new Date().toISOString().slice(0, 7)

  // Fetch analytics
  const { count: viewCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'storefront_view')

  const { count: productsSoldCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('status', 'paid')

  const { count: purchaseCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'purchase')

  // Fetch orders for revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('status', 'paid')

  const totalRevenue = (orders || []).reduce((sum, o) => sum + o.amount_cents, 0)
  const conversionRate = (viewCount && purchaseCount) ? ((purchaseCount || 0) / viewCount * 100).toFixed(1) : '0'

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

  const { data: commissionSettingsData } = await supabase
    .from('commission_settings')
    .select('*')
    .single()

  const commissionSettings = commissionSettingsData as CommissionSettings
  const sortedTiers = (bonusTiers || []) as MonthlyBonusTier[]

  // Referral data
  const { data: referrals } = await supabase
    .from('glow_girl_referrals')
    .select('*, referred:glow_girls!glow_girl_referrals_referred_id_fkey(id, brand_name, created_at, approved)')
    .eq('referrer_id', glowGirl.id)
    .order('created_at', { ascending: false })

  // Monthly commission trend (last 6 months)
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

  // Rank data
  const { data: rankData } = await supabase
    .from('glow_girl_ranks')
    .select('*')
    .eq('glow_girl_id', glowGirl.id)
    .single()

  const unlockedLevels = rankData?.unlocked_levels || 0
  const rankLabel = rankData?.rank_label || 'Starter'
  const groupVolumeCents = rankData?.group_volume_cents || 0
  // Override earnings this month
  const { data: overrideEarnings } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .in('commission_type', ['LEVEL_OVERRIDE'])
    .eq('period', currentPeriod)

  const overrideEarningsTotal = (overrideEarnings || []).reduce((s, c) => s + c.amount_cents, 0)

  // Wallet data
  const walletData = await getWalletData(glowGirl.id)

  const realTrendData = months.map(m => {
    const total = (trendCommissions || [])
      .filter(c => c.period === m)
      .reduce((s, c) => s + c.amount_cents, 0)
    return { month: m, total }
  })

  // Detect if user has real data or needs demo
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

  // Bonus tier progress (uses displayMonthTotal so demo data works)
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
        {!glowGirl.approved && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800 mb-6">
            Your Glow Girl account is pending approval. Your storefront will be visible once approved.
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto flex-wrap">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'earnings', label: 'Earnings' },
              { value: 'comp-plan', label: 'Comp Plan' },
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

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Link Clicks', value: viewCount || 0 },
                { label: 'Products Sold', value: productsSoldCount || 0 },
                { label: 'Conversion Rate', value: `${conversionRate}%` },
                { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
                  <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
                  <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            <WalletCard
              glowGirlId={glowGirl.id}
              availableBalanceCents={walletData.availableBalanceCents}
              pendingWithdrawalCents={walletData.pendingWithdrawalCents}
              hasTaxId={walletData.hasTaxId}
              taxIdLast4={walletData.taxIdLast4}
              recentWithdrawals={walletData.recentWithdrawals}
            />

            <AffiliateLink slug={glowGirl.slug} />

            <div>
              <h2 className="text-xl font-light text-[#6E6A62] mb-4">Recent Orders</h2>
              <OrdersList glowGirlId={glowGirl.id} />
            </div>

            {/* Referrals */}
            <ReferralShare referralCode={glowGirl.referral_code} />

            <div className="bg-white rounded-2xl border border-neutral-200/60">
              <div className="px-6 py-4 border-b border-neutral-200/60">
                <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Referred Glow Girls</h3>
              </div>
              <div className="p-6">
                {(!referrals || referrals.length === 0) ? (
                  <p className="text-center text-[#6E6A62]/50 py-6">
                    No referrals yet. Share your referral link to get started!
                  </p>
                ) : (
                  <div className="divide-y divide-neutral-200/60">
                    {referrals.map((ref) => {
                      const referred = ref.referred as { id: string; brand_name: string | null; created_at: string; approved: boolean } | null
                      return (
                        <div key={ref.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#6E6A62]">{referred?.brand_name || 'Unknown'}</p>
                            <p className="text-xs text-[#6E6A62]/50">
                              Joined {referred ? new Date(referred.created_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                            referred?.approved
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#f5f0eb] text-[#6E6A62]'
                          }`}>
                            {referred?.approved ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── Earnings Tab ─── */}
          <TabsContent value="earnings" className="space-y-8">
            {isEarningsDemo && (
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
                This is a preview with sample data. Your actual earnings will appear here as you make sales.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "This Month's Commissions", value: `$${(displayMonthTotal / 100).toFixed(2)}` },
                { label: 'Monthly Bonus', value: `$${(displayBonusTotal / 100).toFixed(2)}` },
                { label: 'Lifetime Earnings', value: `$${(displayLifetime / 100).toFixed(2)}` },
                { label: 'Pending Payout', value: `$${(displayPending / 100).toFixed(2)}` },
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
                {commissionSettings && (
                  <EarningsCalculator tiers={sortedTiers} settings={commissionSettings} />
                )}
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
                  <div className="grid grid-cols-3 px-6 py-3 text-xs font-medium text-[#6E6A62]/50 uppercase tracking-[0.15em] border-b border-neutral-100">
                    <span>Level</span>
                    <span className="text-center">Override Rate</span>
                    <span className="text-right">Unlock Requirement</span>
                  </div>
                  {[
                    { level: 'Level 1', rate: '10%', req: '1 personal recruit' },
                    { level: 'Level 2', rate: '5%', req: '3 personal recruits' },
                    { level: 'Level 3', rate: '4%', req: '5 recruits + $5K GV' },
                    { level: 'Level 4', rate: '3%', req: '$25K Group Volume' },
                    { level: 'Level 5', rate: '2%', req: '$75K Group Volume' },
                    { level: 'Level 6', rate: '1%', req: '$200K Group Volume' },
                    { level: 'Level 7', rate: '1%', req: '$500K Group Volume' },
                  ].map((row, i) => (
                    <div
                      key={row.level}
                      className={`grid grid-cols-3 px-6 py-3.5 text-sm items-center ${
                        i % 2 === 0 ? '' : 'bg-[#f5f0eb]/30'
                      }`}
                    >
                      <span className="text-[#6E6A62] font-medium">{row.level}</span>
                      <span className="text-center font-medium text-[#6E6A62]">{row.rate}</span>
                      <span className="text-right text-[#6E6A62]/60">{row.req}</span>
                    </div>
                  ))}
                </div>
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

        </Tabs>
    </div>
  )
}

async function OrdersList({ glowGirlId }: { glowGirlId: string }) {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('glow_girl_id', glowGirlId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/60 py-8 text-center text-[#6E6A62]/50">
        No orders yet. Share your storefront to get started!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="divide-y divide-neutral-200/60">
        {orders.map((order) => (
          <div key={order.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#6E6A62]">{order.shipping_name || 'Customer'}</p>
              <p className="text-sm text-[#6E6A62]/50">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              {order.tracking_number && (
                <p className="text-xs text-[#6E6A62]/50 mt-0.5">
                  {order.tracking_carrier ? `${order.tracking_carrier}: ` : ''}
                  {order.tracking_url ? (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">{order.tracking_number}</a>
                  ) : order.tracking_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-[#6E6A62]">${(order.amount_cents / 100).toFixed(2)}</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                  order.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#f5f0eb] text-[#6E6A62]'
                }`}>
                  {order.status}
                </span>
                {order.fulfillment_status && order.fulfillment_status !== 'UNFULFILLED' && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                    order.fulfillment_status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.fulfillment_status === 'SHIPPED'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-[#f5f0eb] text-[#6E6A62]'
                  }`}>
                    {order.fulfillment_status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
