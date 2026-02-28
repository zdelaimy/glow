import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { HeroRhode } from "@/components/hero-rhode"
import { Store, Share2, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Hero */}
      <HeroRhode />

      {/* How It Works — Curated-inspired dark section */}
      <section className="bg-neutral-950 text-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6">
            How It Works
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic leading-tight mb-6">
            Your own beauty business, simplified.
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto mb-20 uppercase tracking-wide">
            Open your storefront. Share products you love. Earn commissions on every sale.
          </p>

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
                desc: "Share Glow products with your audience and community. We handle fulfillment and shipping.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Earn & Grow",
                desc: "Earn commissions on every sale, build your Pod, and unlock bonuses as you grow.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow Girl Opportunity — dark card on off-white */}
      <section className="bg-neutral-100 py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-neutral-950 rounded-2xl p-8 md:p-14 text-white">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                  Glow Girl Opportunity
                </p>
                <h2 className="font-serif text-3xl md:text-4xl italic leading-tight">
                  Turn your passion into a paycheck.
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Launch your own beauty storefront, sell curated Glow products,
                  and earn through our multi-stream compensation plan.
                </p>
                <Link href="/glow-girls">
                  <button className="mt-2 h-11 px-7 rounded-full bg-white text-neutral-900 text-xs uppercase tracking-[0.15em] font-medium hover:bg-neutral-200 transition-colors cursor-pointer">
                    Learn More
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { stat: "25%", label: "Commission on every sale" },
                  { stat: "15", label: "Monthly bonus tiers" },
                  { stat: "10%", label: "Referral match rate" },
                  { stat: "6", label: "Reward tiers to unlock" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-neutral-800 rounded-xl p-4"
                  >
                    <div className="text-2xl font-serif">{item.stat}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-24 md:py-32 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6">
            Community
          </p>
          <h2 className="font-serif text-3xl md:text-4xl italic leading-tight mb-16">
            Trusted by Glow Girls.
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                quote:
                  "I opened my store in a weekend and had my first sale within days.",
                name: "Jessica M.",
                img: "/hero/headshot1.jpg",
              },
              {
                quote:
                  "The bonus tiers keep me motivated. I hit Gold in my second month.",
                name: "Aaliyah R.",
                img: "/hero/headshot2.jpg",
              },
              {
                quote:
                  "The products sell themselves — my friends and family are obsessed.",
                name: "Taylor K.",
                img: "/hero/headshot3.jpg",
              },
            ].map((t, i) => (
              <div key={i} className="text-left space-y-4">
                <p className="text-sm text-neutral-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="text-xs font-medium text-neutral-700">
                    {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow Girls Reels */}
      <section className="bg-neutral-100 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl italic leading-tight mb-16">
            From Our Glow Girls
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {[
              "/reels/insta1.mp4",
              "/reels/insta2.mp4",
              "/reels/instas3.mp4",
            ].map((src) => (
              <div key={src} className="rounded-2xl overflow-hidden bg-neutral-900 shadow-sm p-2 md:p-3">
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto block rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-neutral-950 text-white py-24 md:py-32 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-5xl italic leading-tight mb-4">
            Ready to glow?
          </h2>
          <p className="text-sm text-neutral-400 mb-10 max-w-md mx-auto">
            Shop premium beauty products or start your own Glow Girl
            business — we&apos;ve got you either way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop">
              <button className="h-12 px-8 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer">
                Shop Products
              </button>
            </Link>
            <Link href="/glow-girls">
              <button className="h-12 px-8 rounded-full bg-transparent text-white border border-neutral-700 text-sm font-medium hover:border-neutral-500 transition-colors cursor-pointer">
                Become a Glow Girl
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500">
          <span>Glow Beauty</span>
          <span>
            Cosmetic products only. Not intended to diagnose or treat any
            condition.
          </span>
        </div>
      </footer>
    </div>
  )
}
