import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EarningsCalculator } from '@/components/earnings-calculator'
import { REWARD_TIERS } from '@/lib/commissions/constants'
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'

export default async function GlowGirlsOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams

  // Store referral code in cookie if present
  if (params.ref) {
    const cookieStore = await cookies()
    cookieStore.set('glow_ref', params.ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('commission_settings')
    .select('*')
    .single()

  const { data: tiers } = await supabase
    .from('monthly_bonus_tiers')
    .select('*')
    .order('sort_order')

  const commissionSettings = settings as CommissionSettings
  const bonusTiers = (tiers || []) as MonthlyBonusTier[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">g</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">glow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <section className="py-20 md:py-28 text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6">Glow Girl Opportunity</Badge>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1] mb-6">
            Your glow.{' '}
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
              Your business.
            </span>
            <br />
            Your terms.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Open your own beauty storefront, sell curated Glow products, and earn commissions, bonuses, and rewards every month.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-violet-500">
              Start Your Glow Business
            </Button>
          </Link>
        </section>

        {/* Three Income Streams */}
        <section className="py-16">
          <h2 className="text-3xl font-light tracking-tight text-center mb-12">
            Three ways to <span className="font-semibold">earn</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Sell',
                subtitle: '25% commission',
                desc: 'Earn on every product sold through your storefront. One-time or subscription — you earn either way.',
                color: 'from-violet-500 to-violet-600',
              },
              {
                title: 'Refer',
                subtitle: '10% referral match',
                desc: 'Invite other Glow Girls. Earn a percentage match on their commissions for 12 months.',
                color: 'from-rose-400 to-rose-500',
              },
              {
                title: 'Pod Override',
                subtitle: '5% override',
                desc: 'Build your pod. Earn a 5% override on every sale from your pod members.',
                color: 'from-amber-400 to-amber-500',
              },
            ].map((stream) => (
              <Card key={stream.title} className="border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stream.color}`} />
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">{stream.title}</h3>
                    <span className="text-sm font-medium text-violet-600">{stream.subtitle}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{stream.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Monthly Bonus Tier Table */}
        <section className="py-16">
          <h2 className="text-3xl font-light tracking-tight text-center mb-4">
            Monthly <span className="font-semibold">bonus tiers</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
            Hit commission milestones each month and unlock bonus payouts on top of your earnings.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-3 px-6 py-3 bg-gray-50 text-sm font-medium text-muted-foreground border-b">
                <span>Monthly Commissions</span>
                <span className="text-center">Tier</span>
                <span className="text-right">Bonus</span>
              </div>
              {bonusTiers.map((tier, i) => (
                <div
                  key={tier.id}
                  className={`grid grid-cols-3 px-6 py-3 text-sm items-center ${
                    i % 2 === 0 ? '' : 'bg-gray-50/50'
                  } ${tier.bonus_cents >= 100000 ? 'font-medium' : ''}`}
                >
                  <span>
                    ${(tier.min_commission_cents / 100).toLocaleString()}
                    {tier.max_commission_cents ? ` – $${(tier.max_commission_cents / 100).toLocaleString()}` : '+'}
                  </span>
                  <span className="text-center">
                    <Badge variant={tier.bonus_cents > 0 ? 'default' : 'secondary'} className="text-xs">
                      {tier.tier_label}
                    </Badge>
                  </span>
                  <span className="text-right font-medium text-emerald-600">
                    {tier.bonus_cents > 0 ? `$${(tier.bonus_cents / 100).toLocaleString()}` : '—'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Top Sellers ($10K+ commissions): earn an additional $3,000 for every $5,000 above the $10K threshold.
            </p>
          </div>
        </section>

        {/* Interactive Earnings Calculator */}
        <section className="py-16" id="calculator">
          <h2 className="text-3xl font-light tracking-tight text-center mb-4">
            See your <span className="font-semibold">potential</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Slide to estimate your monthly earnings based on your sales volume.
          </p>
          {commissionSettings && (
            <EarningsCalculator tiers={bonusTiers} settings={commissionSettings} />
          )}
        </section>

        {/* 2026 Glow Girl Rewards */}
        <section className="py-16">
          <h2 className="text-3xl font-light tracking-tight text-center mb-4">
            2026 <span className="font-semibold">Glow Girl Rewards</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Earn points on every sale. Unlock exclusive rewards as you grow.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {REWARD_TIERS.map((tier, i) => (
              <Card
                key={tier.tier}
                className={`border-0 shadow-md overflow-hidden ${
                  i >= 4 ? 'bg-gradient-to-br from-violet-50 to-rose-50' : ''
                }`}
              >
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{tier.label}</h3>
                    <span className="text-xs text-muted-foreground">
                      {tier.minPoints.toLocaleString()} pts
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Start your <span className="font-semibold">glow business</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join Glow Girls building their own beauty businesses. No inventory, no minimums, no risk.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-10 text-base bg-gradient-to-r from-violet-600 to-violet-500">
              Become a Glow Girl
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <span>Glow Beauty</span>
          <span>Cosmetic products only. Not intended to diagnose or treat any condition.</span>
        </div>
      </footer>
    </div>
  )
}
