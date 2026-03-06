import { cookies } from 'next/headers'
import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { HeroRhode } from '@/components/hero-rhode'
import { glowGirlSlides } from '@/lib/hero-images'
import { Footer } from '@/components/footer'
import { Store, Share2, TrendingUp } from 'lucide-react'

export default async function GlowGirlsOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams

  // Store referral code in a separate cookie (not glow_ref, which is for sales attribution)
  if (params.ref) {
    const cookieStore = await cookies()
    cookieStore.set('glow_referral', params.ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader ctaHref="/welcome" />

      <main>
        {/* Hero — video carousel */}
        <HeroRhode slides={glowGirlSlides} ctaText="Become a Glow Girl" ctaHref="/welcome" />

        {/* Marquee ticker */}
        <div className="bg-[#f5f0eb] py-3 overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-[marquee_40s_linear_infinite]">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="text-xs uppercase tracking-[0.2em] text-[#6E6A62] font-medium font-inter">
                $10K in Sales in 10 Months · 10 Hrs/Week&ensp;&bull;&ensp;Earn 25% Commission&ensp;&bull;&ensp;$0 to Start&ensp;&bull;&ensp;$10K in Sales in 10 Months · 10 Hrs/Week&ensp;&bull;&ensp;Earn 25% Commission&ensp;&bull;&ensp;$0 to Start&ensp;&bull;&ensp;
              </span>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl leading-tight mb-6 text-[#6E6A62]">
              Your own beauty business, simplified.
            </h2>
            <div className="mb-20" />

            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              {[
                {
                  step: "01",
                  icon: Store,
                  title: "Open Your Store",
                  desc: "Get your own branded storefront in minutes — your name, your link, your beauty business.",
                },
                {
                  step: "02",
                  icon: Share2,
                  title: "Share & Sell",
                  desc: "Share Glow products with your audience and community. We handle the rest.",
                },
                {
                  step: "03",
                  icon: TrendingUp,
                  title: "Earn & Grow",
                  desc: "Earn commissions on every sale, build your Pod, and unlock bonuses as you grow.",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border border-neutral-200 bg-neutral-50 flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-[#6E6A62]" />
                  </div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-[#6E6A62] font-inter">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6E6A62]/70 leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Income Streams */}
        <section className="bg-[#f5f0eb] py-24 md:py-32">
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
                  title: 'Build Your Team',
                  subtitle: 'Up to 26% in overrides',
                  desc: 'Earn overrides on sales from up to 7 levels deep in your team. The more you build, the more levels you unlock.',
                },
                {
                  step: '03',
                  title: 'Monthly Bonuses',
                  subtitle: 'Up to $12,500+',
                  desc: 'Hit commission milestones each month and unlock bonus payouts on top of your earnings.',
                },
              ].map((stream) => (
                <div key={stream.title} className="bg-white rounded-2xl p-6 md:p-8 space-y-4">
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

        {/* Glow Girl Opportunity Stats */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-[#f5f0eb] rounded-2xl p-8 md:p-14 border border-neutral-200">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-[#6E6A62] mb-10 text-center">
                Turn your passion into a paycheck.
              </h2>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-5">
                  <p className="text-3xl md:text-4xl italic leading-tight text-[#6E6A62]">
                    $10,000 in sales.<br />
                    10 months.<br />
                    10 hours a week.<br />
                    That&apos;s the goal.
                  </p>
                  <Link href="/welcome">
                    <button className="mt-2 h-11 px-7 rounded-full bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
                      Get Started
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { stat: "25%", label: "Commission on every sale" },
                    { stat: "$0", label: "Cost to start" },
                    { stat: "Free", label: "Sales training included" },
                    { stat: "Monthly", label: "Commission payouts" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-neutral-200 rounded-xl p-4 bg-white"
                    >
                      <div className="text-2xl text-[#6E6A62]">{item.stat}</div>
                      <div className="text-xs text-[#6E6A62]/70 mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  video: '/resources/mentorship.mp4',
                },
                {
                  title: 'Sales Training',
                  desc: 'Access our library of proven sales strategies, scripts, and techniques built for beauty entrepreneurs.',
                  video: '/resources/training.mp4',
                },
                {
                  title: 'The Glow Girl Network',
                  desc: 'Join a private community of ambitious women sharing tips, wins, and support every day.',
                  video: '/resources/community.mp4',
                },
                {
                  title: 'Dinners & Galas',
                  desc: 'Exclusive in-person events to connect, celebrate milestones, and build relationships that last.',
                  video: '/resources/gala.mp4',
                },
                {
                  title: 'Social Media Growth',
                  desc: 'Learn how to grow your audience, create content that converts, and build your personal brand.',
                  video: '/resources/social-media.mp4',
                },
                {
                  title: 'Monetization Strategy',
                  desc: 'Go beyond commissions — learn how to turn your platform into multiple revenue streams.',
                  video: '/resources/monetization.mp4',
                },
              ].map((resource) => (
                <div
                  key={resource.title}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-200/60"
                >
                  <video
                    src={resource.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-6 space-y-2">
                    <h3 className="text-lg text-[#6E6A62]">{resource.title}</h3>
                    <p className="text-sm text-[#6E6A62]/60 leading-relaxed">{resource.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter">
              Community
            </p>
            <h2 className="text-3xl md:text-4xl leading-tight mb-16 text-[#6E6A62]">
              From Our Glow Girls
            </h2>

            <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  quote:
                    "I opened my store in a weekend and had my first sale within days.",
                  name: "Jessica M.",
                  location: "Austin, TX",
                  img: "/hero/headshot1.jpg",
                },
                {
                  quote:
                    "The bonus tiers keep me motivated. I hit Gold in my second month.",
                  name: "Aaliyah R.",
                  location: "Atlanta, GA",
                  img: "/hero/headshot2.jpg",
                },
                {
                  quote:
                    "The products sell themselves — my friends and family are obsessed.",
                  name: "Taylor K.",
                  location: "San Diego, CA",
                  img: "/hero/headshot3.jpg",
                },
              ].map((t, i) => (
                <div key={i} className="bg-[#f5f0eb] rounded-2xl p-6 text-left space-y-4 border border-neutral-200/60">
                  <p className="text-sm text-[#6E6A62] leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-medium text-[#6E6A62]">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-[#6E6A62]/50">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#f5f0eb] py-24 md:py-32 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl italic leading-tight mb-4 text-[#6E6A62]">
              Start your glow business
            </h2>
            <p className="text-sm text-[#6E6A62]/60 mb-10 max-w-md mx-auto">
              Join Glow Girls building their own beauty businesses. No inventory, no minimums, no risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/welcome">
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
