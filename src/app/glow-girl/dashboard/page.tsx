import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
            </Link>
            <div>
              <h1 className="font-semibold">{glowGirl.brand_name}</h1>
              <p className="text-sm text-muted-foreground">Glow Girl Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/@${glowGirl.slug}`} target="_blank">
              <Button variant="outline" size="sm">View Storefront</Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!glowGirl.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
            Your Glow Girl account is pending approval. Your storefront will be visible once approved.
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="pod">Pod</TabsTrigger>
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
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-2xl font-semibold mt-1">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Serums</h2>
                <Link href="/glow-girl/signature">
                  <Button className="bg-gradient-to-r from-violet-600 to-violet-500">
                    Create New Serum
                  </Button>
                </Link>
              </div>

              {(!signatures || signatures.length === 0) ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">You haven&apos;t created any serums yet.</p>
                    <Link href="/glow-girl/signature">
                      <Button>Create your first signature serum</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signatures.map((sig) => (
                    <Card key={sig.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{sig.signature_name}</CardTitle>
                          <Badge variant={sig.publish_status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {sig.publish_status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Base: {(sig.base as { name: string })?.name}</p>
                          <p>Booster: {(sig.booster_primary as { name: string })?.name}</p>
                          <p className="font-medium text-foreground mt-2">
                            ${(sig.subscription_price_cents / 100).toFixed(2)}/mo &middot; ${(sig.one_time_price_cents / 100).toFixed(2)} one-time
                          </p>
                        </div>
                        <Link href={`/@${glowGirl.slug}/product/${sig.slug}`} className="block mt-3">
                          <Button variant="outline" size="sm" className="w-full">View Product</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
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
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-2xl font-semibold mt-1">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bonus tier progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Bonus Tier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>{currentBonusTier?.tier_label || 'Starter'}</Badge>
                  {nextBonusTier && (
                    <span className="text-sm text-muted-foreground">
                      ${((nextBonusTier.min_commission_cents - monthCommTotal) / 100).toLocaleString()} to {nextBonusTier.tier_label}
                    </span>
                  )}
                </div>
                <Progress value={Math.min(100, tierProgress)} className="h-2" />
              </CardContent>
            </Card>

            {/* Monthly trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {trendData.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-violet-200 rounded-t transition-all"
                        style={{ height: `${(m.total / maxTrend) * 100}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {m.month.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Commissions table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Commissions This Month</CardTitle>
              </CardHeader>
              <CardContent>
                {(!monthCommissions || monthCommissions.length === 0) ? (
                  <p className="text-center text-muted-foreground py-6">No commissions yet this month.</p>
                ) : (
                  <div className="divide-y">
                    {monthCommissions.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {c.commission_type === 'PERSONAL' ? 'Personal Sale' : c.commission_type === 'POD_OVERRIDE' ? 'Pod Override' : 'Referral Match'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(c.amount_cents / 100).toFixed(2)}</p>
                          <Badge variant={c.status === 'APPROVED' ? 'default' : 'secondary'} className="text-xs">
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Referrals Tab ─── */}
          <TabsContent value="referrals" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Referred</div>
                  <div className="text-2xl font-semibold mt-1">{(referrals || []).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Active</div>
                  <div className="text-2xl font-semibold mt-1">
                    {(referrals || []).filter(r => (r.referred as { approved?: boolean })?.approved).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Referral Earnings This Month</div>
                  <div className="text-2xl font-semibold mt-1">${(refEarningsTotal / 100).toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <ReferralShare referralCode={glowGirl.referral_code} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Referred Glow Girls</CardTitle>
              </CardHeader>
              <CardContent>
                {(!referrals || referrals.length === 0) ? (
                  <p className="text-center text-muted-foreground py-6">
                    No referrals yet. Share your referral link to get started!
                  </p>
                ) : (
                  <div className="divide-y">
                    {referrals.map((ref) => {
                      const referred = ref.referred as { id: string; brand_name: string | null; created_at: string; approved: boolean } | null
                      return (
                        <div key={ref.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{referred?.brand_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {referred ? new Date(referred.created_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <Badge variant={referred?.approved ? 'default' : 'secondary'}>
                            {referred?.approved ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Points Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {(!recentPointsActivity || recentPointsActivity.length === 0) ? (
                  <p className="text-center text-muted-foreground py-6">No points activity yet. Make sales to earn points!</p>
                ) : (
                  <div className="divide-y">
                    {recentPointsActivity.map((entry) => (
                      <div key={entry.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{entry.description || entry.source}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-medium text-violet-600">+{entry.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No orders yet. Share your storefront to get started!
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="divide-y">
          {orders.map((order) => (
            <div key={order.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{order.shipping_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(order.amount_cents / 100).toFixed(2)}</p>
                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
