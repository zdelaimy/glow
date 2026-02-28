import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOutButton } from '@/components/sign-out-button'
import { ReferralShare } from '@/components/referral-share'
import { TierProgressBar } from '@/components/tier-progress-bar'
import { getRewardTier } from '@/lib/commissions/calculate'
import { PodDashboard } from '@/components/pod-dashboard'
import { getMyPod, getPodStats } from '@/lib/actions/pods'
import type { MonthlyBonusTier, RewardTier } from '@/types/database'

export default async function GlowGirlDashboard() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()
  const currentPeriod = new Date().toISOString().slice(0, 7)

  // Fetch signatures
  const { data: signatures } = await supabase
    .from('glow_girl_signatures')
    .select('*, base:base_formulas(name), booster_primary:boosters!glow_girl_signatures_booster_primary_id_fkey(name)')
    .eq('glow_girl_id', glowGirl.id)
    .order('created_at', { ascending: false })

  // Fetch analytics
  const { count: viewCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'storefront_view')

  const { count: quizCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'quiz_complete')

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
  const conversionRate = (viewCount && quizCount) ? ((purchaseCount || 0) / viewCount * 100).toFixed(1) : '0'

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
  let currentBonusTier = sortedTiers[0]
  let nextBonusTier: MonthlyBonusTier | null = null
  for (let i = 0; i < sortedTiers.length; i++) {
    if (monthCommTotal >= sortedTiers[i].min_commission_cents) {
      currentBonusTier = sortedTiers[i]
      nextBonusTier = sortedTiers[i + 1] || null
    }
  }

  const tierProgress = nextBonusTier
    ? ((monthCommTotal - currentBonusTier.min_commission_cents) /
       (nextBonusTier.min_commission_cents - currentBonusTier.min_commission_cents)) * 100
    : 100

  // Referral data
  const { data: referrals } = await supabase
    .from('glow_girl_referrals')
    .select('*, referred:glow_girls!glow_girl_referrals_referred_id_fkey(id, brand_name, created_at, approved)')
    .eq('referrer_id', glowGirl.id)
    .order('created_at', { ascending: false })

  const { data: refEarnings } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('commission_type', 'REFERRAL_MATCH')
    .eq('period', currentPeriod)

  const refEarningsTotal = (refEarnings || []).reduce((s, c) => s + c.amount_cents, 0)

  // Rewards data
  const { data: pointsBalance } = await supabase
    .from('reward_points_balance')
    .select('total_points')
    .eq('glow_girl_id', glowGirl.id)
    .single()

  const totalPoints = pointsBalance?.total_points || 0
  const currentRewardTier = getRewardTier(totalPoints)

  const { data: milestones } = await supabase
    .from('reward_milestones')
    .select('*')
    .eq('glow_girl_id', glowGirl.id)
    .order('created_at', { ascending: false })

  const { data: recentPointsActivity } = await supabase
    .from('reward_points_ledger')
    .select('*')
    .eq('glow_girl_id', glowGirl.id)
    .order('created_at', { ascending: false })
    .limit(20)

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

  // Pod data
  let podData = null
  let podStats = null
  try {
    podData = await getMyPod()
    if (podData) {
      podStats = await getPodStats(podData.pod.id)
    }
  } catch {
    // Pod queries may fail if tables don't exist yet
  }

  const trendData = months.map(m => {
    const total = (trendCommissions || [])
      .filter(c => c.period === m)
      .reduce((s, c) => s + c.amount_cents, 0)
    return { month: m, total }
  })
  const maxTrend = Math.max(...trendData.map(t => t.total), 1)

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-inter">
      <header className="bg-white/60 backdrop-blur-sm border-b border-[#6E6A62]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg tracking-tight text-[#6E6A62] font-medium">
              GLOW
            </Link>
            <div>
              <h1 className="font-medium text-[#6E6A62]">{glowGirl.brand_name}</h1>
              <p className="text-sm text-[#6E6A62]/50">Glow Girl Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/@${glowGirl.slug}`}
              target="_blank"
              className="rounded-full border border-[#6E6A62]/30 px-4 py-2 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
            >
              View Storefront
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!glowGirl.approved && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800 mb-6">
            Your Glow Girl account is pending approval. Your storefront will be visible once approved.
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1 h-auto">
            {['overview', 'earnings', 'referrals', 'rewards', 'pod'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-full text-xs uppercase tracking-[0.15em] px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm text-[#6E6A62]/50"
              >
                {tab === 'pod' ? 'Pod' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Storefront Views', value: viewCount || 0 },
                { label: 'Quiz Completions', value: quizCount || 0 },
                { label: 'Conversion Rate', value: `${conversionRate}%` },
                { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
                  <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
                  <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-[#6E6A62]">Your Serums</h2>
                <Link
                  href="/glow-girl/signature"
                  className="rounded-full bg-[#6E6A62] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#5a5650] transition-colors"
                >
                  Create New Serum
                </Link>
              </div>

              {(!signatures || signatures.length === 0) ? (
                <div className="bg-white rounded-2xl border border-neutral-200/60 py-12 text-center">
                  <p className="text-[#6E6A62]/50 mb-4">You haven&apos;t created any serums yet.</p>
                  <Link
                    href="/glow-girl/signature"
                    className="inline-block rounded-full bg-[#6E6A62] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#5a5650] transition-colors"
                  >
                    Create your first signature serum
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signatures.map((sig) => (
                    <div key={sig.id} className="bg-white rounded-2xl border border-neutral-200/60">
                      <div className="px-6 py-4 border-b border-neutral-200/60 flex items-center justify-between">
                        <h3 className="font-medium text-[#6E6A62]">{sig.signature_name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                          sig.publish_status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#f5f0eb] text-[#6E6A62]'
                        }`}>
                          {sig.publish_status}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-[#6E6A62]/60 space-y-1">
                          <p>Base: {(sig.base as { name: string })?.name}</p>
                          <p>Booster: {(sig.booster_primary as { name: string })?.name}</p>
                          <p className="font-medium text-[#6E6A62] mt-2">
                            ${(sig.subscription_price_cents / 100).toFixed(2)}/mo &middot; ${(sig.one_time_price_cents / 100).toFixed(2)} one-time
                          </p>
                        </div>
                        <Link
                          href={`/@${glowGirl.slug}/product/${sig.slug}`}
                          className="block mt-3 w-full rounded-full border border-[#6E6A62]/30 text-center py-2 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-light text-[#6E6A62] mb-4">Recent Orders</h2>
              <OrdersList glowGirlId={glowGirl.id} />
            </div>
          </TabsContent>

          {/* ─── Earnings Tab ─── */}
          <TabsContent value="earnings" className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "This Month's Commissions", value: `$${(monthCommTotal / 100).toFixed(2)}` },
                { label: 'Monthly Bonus', value: `$${(monthBonusTotal / 100).toFixed(2)}` },
                { label: 'Lifetime Earnings', value: `$${(lifetimeTotal / 100).toFixed(2)}` },
                { label: 'Pending Payout', value: `$${(pendingPayoutTotal / 100).toFixed(2)}` },
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
                      ${((nextBonusTier.min_commission_cents - monthCommTotal) / 100).toLocaleString()} to {nextBonusTier.tier_label}
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
                {(!monthCommissions || monthCommissions.length === 0) ? (
                  <p className="text-center text-[#6E6A62]/50 py-6">No commissions yet this month.</p>
                ) : (
                  <div className="divide-y divide-neutral-200/60">
                    {monthCommissions.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#6E6A62]">
                            {c.commission_type === 'PERSONAL' ? 'Personal Sale' : c.commission_type === 'POD_OVERRIDE' ? 'Pod Override' : 'Referral Match'}
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

          {/* ─── Referrals Tab ─── */}
          <TabsContent value="referrals" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Total Referred', value: (referrals || []).length },
                { label: 'Active', value: (referrals || []).filter(r => (r.referred as { approved?: boolean })?.approved).length },
                { label: 'Referral Earnings This Month', value: `$${(refEarningsTotal / 100).toFixed(2)}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
                  <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
                  <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

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

          {/* ─── Pod Tab ─── */}
          <TabsContent value="pod">
            <PodDashboard podData={podData} podStats={podStats} />
          </TabsContent>

          {/* ─── Rewards Tab ─── */}
          <TabsContent value="rewards" className="space-y-8">
            <TierProgressBar
              totalPoints={totalPoints}
              currentTier={(currentRewardTier?.tier as RewardTier) || null}
              milestones={(milestones || []).map(m => ({ tier: m.tier as RewardTier, created_at: m.created_at }))}
            />

            <div className="bg-white rounded-2xl border border-neutral-200/60">
              <div className="px-6 py-4 border-b border-neutral-200/60">
                <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Recent Points Activity</h3>
              </div>
              <div className="p-6">
                {(!recentPointsActivity || recentPointsActivity.length === 0) ? (
                  <p className="text-center text-[#6E6A62]/50 py-6">No points activity yet. Make sales to earn points!</p>
                ) : (
                  <div className="divide-y divide-neutral-200/60">
                    {recentPointsActivity.map((entry) => (
                      <div key={entry.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#6E6A62]">{entry.description || entry.source}</p>
                          <p className="text-xs text-[#6E6A62]/50">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-medium text-[#6E6A62]">+{entry.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
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
            </div>
            <div className="text-right">
              <p className="font-medium text-[#6E6A62]">${(order.amount_cents / 100).toFixed(2)}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                order.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-[#f5f0eb] text-[#6E6A62]'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
