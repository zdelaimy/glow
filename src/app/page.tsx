import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { HeroRhode } from "@/components/hero-rhode"
import { ProductHighlights } from "@/components/product-highlights"
import { Leaf, Sparkles, Heart } from "lucide-react"
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
              Clean Ingredients&ensp;&bull;&ensp;Premium Quality&ensp;&bull;&ensp;Curated Selection&ensp;&bull;&ensp;Dermatologist Tested&ensp;&bull;&ensp;Clean Ingredients&ensp;&bull;&ensp;Premium Quality&ensp;&bull;&ensp;Curated Selection&ensp;&bull;&ensp;Dermatologist Tested&ensp;&bull;&ensp;
            </span>
          ))}
        </div>
      </div>

      {/* Product Highlights */}
      <ProductHighlights />

      {/* Brand Story / Values */}
      <section className="bg-[#f5f0eb] py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter">
            Why Glow
          </p>
          <h2 className="text-3xl md:text-5xl leading-tight mb-6 text-[#6E6A62]">
            Beauty, without compromise.
          </h2>
          <p className="text-sm text-[#6E6A62]/70 max-w-lg mx-auto mb-20">
            We believe in fewer, better products — each one carefully formulated with clean ingredients that actually work.
          </p>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                icon: Leaf,
                title: "Clean Ingredients",
                desc: "Every formula is free from parabens, sulfates, and harsh chemicals. Just what your skin needs, nothing it doesn't.",
              },
              {
                icon: Sparkles,
                title: "Premium Quality",
                desc: "High-performance formulas crafted with care. Each product is designed to deliver visible results you can feel.",
              },
              {
                icon: Heart,
                title: "Curated Selection",
                desc: "We don't do hundreds of SKUs. A small, intentional collection so every product earns its place in your routine.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
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

      {/* Community Reels */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/60 mb-6 font-inter">
            Community
          </p>
          <h2 className="text-3xl md:text-4xl leading-tight mb-16 text-[#6E6A62]">
            From Our Glow Girls
          </h2>

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
        </div>
      </section>

      {/* Small Glow Girl CTA */}
      <section className="bg-[#f5f0eb] py-16 md:py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl leading-tight mb-3 text-[#6E6A62]">
            Want to sell Glow?
          </h2>
          <p className="text-sm text-[#6E6A62]/70 mb-8 max-w-md mx-auto">
            Open your own storefront, earn commissions, and build a beauty business on your terms.
          </p>
          <Link href="/glow-girls">
            <button className="h-11 px-7 rounded-full bg-[#6E6A62] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#5E5A52] transition-colors cursor-pointer font-inter">
              Learn More
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
