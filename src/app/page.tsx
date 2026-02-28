import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { HeroRhode } from "@/components/hero-rhode"
import { ProductHighlights } from "@/components/product-highlights"
import { Store, Share2, TrendingUp } from "lucide-react"
import { SupportForm } from "@/components/support-form"
import { SubscribeForm } from "@/components/subscribe-form"

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  }
  return <>{icons[name]}</>
}

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
          <p className="text-sm text-[#6E6A62]/70 max-w-xl mx-auto mb-20 uppercase tracking-wide font-inter">
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
                <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
                  Launch your own beauty storefront, sell curated Glow products,
                  and earn while doing what you love.
                </p>
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
            <Link href="/shop">
              <button className="h-12 px-8 rounded-full bg-[#6E6A62] text-white text-sm font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
                Shop Products
              </button>
            </Link>
            <Link href="/glow-girls">
              <button className="h-12 px-8 rounded-full bg-transparent text-[#6E6A62] border border-[#6E6A62]/30 text-sm font-medium hover:border-[#6E6A62]/60 transition-colors cursor-pointer font-inter">
                Become a Glow Girl
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f0eb]">
        <div className="max-w-7xl mx-auto px-6">
          {/* GLOW logo — full width, centered */}
          <div className="overflow-hidden pt-12 pb-4">
            <h2
              className="text-[20vw] md:text-[16vw] leading-[0.85] tracking-tight text-[#6E6A62] text-center select-none"
              aria-hidden="true"
            >
              GLOW
            </h2>
          </div>

          {/* Horizontal divider */}
          <div className="border-t border-[#6E6A62]/30" />

          {/* Footer Links — no vertical padding on container so border-r connects to horizontal line */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
            {/* Email Subscribe */}
            <div className="lg:w-[30%] lg:pr-12 lg:border-r lg:border-[#6E6A62]/30 lg:shrink-0 pt-14 pb-14">
              <SubscribeForm />
            </div>

            {/* Right side — 4 link columns */}
            <div className="lg:flex-1 lg:pl-12 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-14 pb-14">
              {/* Navigate */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                  Navigate
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Shop", href: "/shop" },
                    { label: "Our Story", href: "/about" },
                    { label: "Glow Girls", href: "/glow-girls" },
                    { label: "Compensation Plan", href: "/glow-girls/compensation" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#6E6A62]/70 hover:text-[#6E6A62] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                  Social
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Instagram", icon: "instagram", href: "https://instagram.com" },
                    { label: "Youtube", icon: "youtube", href: "https://youtube.com" },
                    { label: "TikTok", icon: "tiktok", href: "https://tiktok.com" },
                  ].map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#6E6A62]/70 hover:text-[#6E6A62] transition-colors flex items-center gap-2"
                      >
                        <SocialIcon name={link.icon} />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                  Official
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Privacy", href: "/privacy" },
                    { label: "Terms", href: "/terms" },
                    { label: "Accessibility", href: "/accessibility" },
                    { label: "FAQ", href: "/faq" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#6E6A62]/70 hover:text-[#6E6A62] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                  Support
                </h4>
                <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
                  We&apos;re here M-F 9am&ndash;5pm PST.
                </p>
                <SupportForm />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#6E6A62]/10 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-[#6E6A62]/40 uppercase tracking-wider font-inter">
            <span>&copy; {new Date().getFullYear()} Glow Labs. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
