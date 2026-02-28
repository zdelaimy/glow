import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EarningsCalculator } from '@/components/earnings-calculator'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from "@/components/footer"
import type { MonthlyBonusTier, CommissionSettings } from '@/types/database'

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
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader variant="light" />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-24 md:pt-40 md:pb-32 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl leading-[1.08] tracking-tight mb-6 text-[#6E6A62]">
              Your glow. <span className="italic">Your business.</span>
            </h1>
            <p className="text-sm md:text-base text-[#6E6A62]/60 max-w-xl mx-auto mb-10">
              Open your own beauty storefront, sell curated Glow products, and earn commissions, bonuses, and rewards every month.
            </p>
            <Link href="/login">
              <button className="h-12 px-8 rounded-full bg-[#6E6A62] text-white text-sm font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
                Start Your Glow Business
              </button>
            </Link>
          </div>
        </section>

        {/* Three Income Streams */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl leading-tight mb-16 text-[#6E6A62] text-center">
              Three ways to <span className="italic">earn</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Sell',
                  subtitle: '25% commission',
                  desc: 'Earn on every product sold through your storefront. One-time or subscription — you earn either way.',
                },
                {
                  step: '02',
                  title: 'Refer',
                  subtitle: '10% referral match',
                  desc: 'Invite other Glow Girls. Earn a percentage match on their commissions for 12 months.',
                },
                {
                  step: '03',
                  title: 'Pod Override',
                  subtitle: '5% override',
                  desc: 'Build your pod. Earn a 5% override on every sale from your pod members.',
                },
              ].map((stream) => (
                <div key={stream.title} className="bg-[#f5f0eb] rounded-2xl p-6 md:p-8 space-y-4">
                  <span className="text-xs text-[#6E6A62]/40 font-inter uppercase tracking-[0.15em]">{stream.step}</span>
                  <div>
                    <h3 className="text-xl text-[#6E6A62] mb-1">{stream.title}</h3>
                    <span className="text-sm font-medium text-[#6E6A62]/70 font-inter">{stream.subtitle}</span>
                  </div>
                  <p className="text-sm text-[#6E6A62]/60 leading-relaxed">{stream.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Bonus Tier Table */}
        <section className="bg-[#f5f0eb] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl leading-tight text-center mb-4 text-[#6E6A62]">
              Monthly <span className="italic">bonus tiers</span>
            </h2>
            <p className="text-center text-sm text-[#6E6A62]/60 mb-12 max-w-lg mx-auto">
              Hit commission milestones each month and unlock bonus payouts on top of your earnings.
            </p>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60">
                <div className="grid grid-cols-3 px-6 py-3 text-xs font-medium text-[#6E6A62]/50 uppercase tracking-[0.15em] border-b border-neutral-100 font-inter">
                  <span>Monthly Commissions</span>
                  <span className="text-center">Tier</span>
                  <span className="text-right">Bonus</span>
                </div>
                {bonusTiers.map((tier, i) => (
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
                      <span className={`inline-block text-xs uppercase tracking-[0.1em] px-3 py-1 rounded-full font-inter font-medium ${getTierColors(tier.tier_label).bg} ${getTierColors(tier.tier_label).text}`}>
                        {tier.tier_label}
                      </span>
                    </span>
                    <span className="text-right font-medium text-[#6E6A62]">
                      {tier.bonus_cents > 0 ? `$${(tier.bonus_cents / 100).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6E6A62]/50 text-center mt-4">
                Top Sellers ($10K+ commissions): earn an additional $3,000 for every $5,000 above the $10K threshold.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Earnings Calculator */}
        <section className="bg-white py-24 md:py-32" id="calculator">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter text-center">
              Earnings Calculator
            </p>
            <h2 className="text-3xl md:text-5xl leading-tight text-center mb-4 text-[#6E6A62]">
              See your <span className="italic">potential</span>
            </h2>
            <p className="text-center text-sm text-[#6E6A62]/60 mb-12 max-w-lg mx-auto">
              Slide to estimate your monthly earnings based on your sales volume.
            </p>
            {commissionSettings && (
              <EarningsCalculator tiers={bonusTiers} settings={commissionSettings} />
            )}
          </div>
        </section>

        {/* Glow Girl Resources */}
        <section className="bg-[#f5f0eb] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl leading-tight text-center mb-4 text-[#6E6A62]">
              Everything you need to <span className="italic">succeed</span>
            </h2>
            <p className="text-center text-sm text-[#6E6A62]/60 mb-12 max-w-lg mx-auto">
              When you join Glow, you get more than a storefront — you get a full support system.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                {
                  title: '1-on-1 Mentorship',
                  desc: 'Get paired with a successful Glow Girl who guides you through your first months and beyond.',
                },
                {
                  title: 'Sales Training',
                  desc: 'Access our library of proven sales strategies, scripts, and techniques built for beauty entrepreneurs.',
                },
                {
                  title: 'The Glow Girl Network',
                  desc: 'Join a private community of ambitious women sharing tips, wins, and support every day.',
                },
                {
                  title: 'Dinners & Galas',
                  desc: 'Exclusive in-person events to connect, celebrate milestones, and build relationships that last.',
                },
                {
                  title: 'Social Media Growth',
                  desc: 'Learn how to grow your audience, create content that converts, and build your personal brand.',
                },
                {
                  title: 'Monetization Strategy',
                  desc: 'Go beyond commissions — learn how to turn your platform into multiple revenue streams.',
                },
              ].map((resource) => (
                <div
                  key={resource.title}
                  className="bg-white rounded-2xl p-6 border border-neutral-200/60 space-y-2"
                >
                  <h3 className="text-lg text-[#6E6A62]">{resource.title}</h3>
                  <p className="text-sm text-[#6E6A62]/60 leading-relaxed">{resource.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white py-24 md:py-32 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl italic leading-tight mb-4 text-[#6E6A62]">
              Start your glow business
            </h2>
            <p className="text-sm text-[#6E6A62]/60 mb-10 max-w-md mx-auto">
              Join Glow Girls building their own beauty businesses. No inventory, no minimums, no risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <button className="h-12 px-8 rounded-full bg-[#6E6A62] text-white text-sm font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
                  Become a Glow Girl
                </button>
              </Link>
              <Link href="/shop">
                <button className="h-12 px-8 rounded-full bg-transparent text-[#6E6A62] border border-[#6E6A62]/30 text-sm font-medium hover:border-[#6E6A62]/60 transition-colors cursor-pointer font-inter">
                  Shop Products
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
