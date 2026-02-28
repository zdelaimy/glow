import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { HeroRhode } from "@/components/hero-rhode"
import { ProductHighlights } from "@/components/product-highlights"
import { Store, Share2, TrendingUp } from "lucide-react"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader />

      {/* Hero */}
      <HeroRhode />

      {/* Marquee ticker */}
      <div className="bg-[#f5f0eb] py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-[marquee_40s_linear_infinite]">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="text-xs uppercase tracking-[0.2em] text-[#6E6A62] font-medium font-inter">
              Build Your Business&ensp;&bull;&ensp;Earn 25% Commission&ensp;&bull;&ensp;Free Shipping Over $50&ensp;&bull;&ensp;Premium Clean Ingredients&ensp;&bull;&ensp;Become a Glow Girl&ensp;&bull;&ensp;Build Your Business&ensp;&bull;&ensp;Earn 25% Commission&ensp;&bull;&ensp;Free Shipping Over $50&ensp;&bull;&ensp;Premium Clean Ingredients&ensp;&bull;&ensp;Become a Glow Girl&ensp;&bull;&ensp;
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

      {/* Glow Girl Opportunity */}
      <section className="bg-[#f5f0eb] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-14 border border-neutral-200">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 font-inter">
                  Glow Girl Opportunity
                </p>
                <h2 className="text-3xl md:text-4xl italic leading-tight text-[#6E6A62]">
                  Turn your passion into a paycheck.
                </h2>
                <Link href="/glow-girls">
                  <button className="mt-2 h-11 px-7 rounded-full bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
                    Learn More
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { stat: "25%", label: "Commission on every sale" },
                  { stat: "$0", label: "Cost to start" },
                  { stat: "Free", label: "Sales training included" },
                  { stat: "Weekly", label: "Commission payouts" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-neutral-200 rounded-xl p-4"
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

      {/* Product Highlights */}
      <ProductHighlights />

      {/* From Our Glow Girls — Reels + Community */}
      <section className="bg-[#f5f0eb] py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter">
            Community
          </p>
          <h2 className="text-3xl md:text-4xl leading-tight mb-16 text-[#6E6A62]">
            From Our Glow Girls
          </h2>

          {/* Reels */}
          <div className="grid sm:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            {[
              "/reels/insta1.mp4",
              "/reels/insta2.mp4",
              "/reels/instas3.mp4",
            ].map((src) => (
              <div key={src} className="rounded-2xl overflow-hidden bg-black shadow-sm p-2 md:p-3">
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

          {/* Testimonials */}
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
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
              <div key={i} className="bg-white rounded-2xl p-6 text-left space-y-4 border border-neutral-200/60">
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
      <section className="bg-white py-24 md:py-32 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl italic leading-tight mb-4 text-[#6E6A62]">
            Ready to glow?
          </h2>
          <p className="text-sm text-[#6E6A62]/70 mb-10 max-w-md mx-auto">
            Shop premium beauty products or start your own Glow Girl
            business — we&apos;ve got you either way.
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

      <Footer />
    </div>
  )
}
