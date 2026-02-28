import Link from "next/link"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors font-inter">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl text-[#6E6A62] mt-8 mb-10">Our Story</h1>
        <div className="space-y-6 text-sm text-[#6E6A62]/80 leading-relaxed">
          <p className="text-base text-[#6E6A62]">
            We started Glow because we believe every girl deserves the freedom to earn on her own terms.
          </p>

          <p>
            Too many talented, driven women are stuck in jobs they don&apos;t love — trading their time for someone else&apos;s dream. We wanted to build something different. A platform where you can turn your passion for beauty and community into a real business, without the gatekeeping, without the overhead, and without asking permission.
          </p>

          <p>
            Glow gives you everything you need to launch your own storefront and start selling premium beauty products to your audience. No inventory. No shipping headaches. No startup costs. Just you, your brand, and a community of women who are building something together.
          </p>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">Why We Built This</h2>
          <p>
            The creator economy changed everything — but most platforms still leave creators fighting for scraps. Algorithms decide who gets seen. Brand deals dry up. One bad month and you&apos;re starting over.
          </p>
          <p>
            We built Glow so that your income isn&apos;t dependent on an algorithm. When someone buys through your store, you earn. When you bring another Glow Girl into the network, you earn. It&apos;s that simple.
          </p>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">What Makes Glow Different</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong className="text-[#6E6A62]">Your own storefront</strong> — a branded online store that&apos;s uniquely yours</li>
            <li><strong className="text-[#6E6A62]">Zero inventory risk</strong> — we handle products, packaging, and shipping</li>
            <li><strong className="text-[#6E6A62]">Real commissions</strong> — 25% on every sale, paid out consistently</li>
            <li><strong className="text-[#6E6A62]">Team earnings</strong> — recruit other Glow Girls and earn from their success too</li>
            <li><strong className="text-[#6E6A62]">Rewards that matter</strong> — milestone gifts, retreats, and experiences as you grow</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">For Girls Who Want More</h2>
          <p>
            Whether you&apos;re a college student, a stay-at-home mom, a 9-to-5er looking for a side hustle, or a full-time creator ready to diversify — Glow was built for you. We believe that financial independence shouldn&apos;t require a corner office or a lucky break. It should be accessible to anyone willing to put in the work.
          </p>
          <p>
            This is more than a beauty brand. It&apos;s a community of women who decided they deserve better — and are building it together.
          </p>

          <div className="pt-6">
            <Link
              href="/welcome"
              className="inline-block bg-[#6E6A62] text-white text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-[#5a5751] transition-colors font-inter"
            >
              Become a Glow Girl
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
