import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LandingHero } from '@/components/landing-hero'
import { Droplets, FlaskConical, Package } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50">
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Glow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/creators">
            <Button variant="ghost" size="sm">For Creators</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500">
              Become a Creator
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero with Framer Motion */}
        <LandingHero />

        {/* 3-Step Process */}
        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Creator designs',
                desc: 'Creators build their signature serum formula and branded storefront.',
                icon: FlaskConical,
              },
              {
                step: '02',
                title: 'You discover',
                desc: 'Take a short skin quiz on your favorite creator\'s page.',
                icon: Droplets,
              },
              {
                step: '03',
                title: 'We blend & ship',
                desc: 'Your custom serum arrives — base + boosters, ready for your ritual.',
                icon: Package,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-2">
                  <item.icon className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-5xl font-extralight text-violet-300">{item.step}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Opportunity Teaser */}
        <section className="py-16 md:py-24">
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-violet-600 to-rose-500 text-white">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight">
                    Turn your skincare expertise into a <span className="font-semibold">business</span>
                  </h2>
                  <p className="text-white/80">
                    Design custom serums, build your brand, and earn through our multi-stream compensation plan.
                  </p>
                  <Link href="/creators">
                    <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 h-12 px-8">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { stat: '25%', label: 'Commission on every sale' },
                    { stat: '15', label: 'Monthly bonus tiers' },
                    { stat: '10%', label: 'Referral match rate' },
                    { stat: '6', label: 'Reward tiers to unlock' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <div className="text-2xl font-bold">{item.stat}</div>
                      <div className="text-sm text-white/70">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Social Proof */}
        <section className="py-16 md:py-24 text-center">
          <h2 className="text-3xl font-light tracking-tight mb-4">
            Trusted by <span className="font-semibold">creators</span>
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join a growing community of skincare creators building their brands on Glow.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { quote: '"I launched my brand in a weekend and had my first sale within days."', name: 'Creator Testimonial' },
              { quote: '"The bonus tiers keep me motivated. I hit Gold in my second month."', name: 'Creator Testimonial' },
              { quote: '"My customers love the quiz experience. It sells itself."', name: 'Creator Testimonial' },
            ].map((t, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm italic text-muted-foreground">{t.quote}</p>
                  <p className="text-xs text-muted-foreground">&mdash; {t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA — Dual path */}
        <section className="py-16 md:py-24 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Ready to <span className="font-semibold">glow</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Whether you&apos;re looking for the perfect serum or building a skincare brand — we&apos;ve got you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600">
                Find Your Serum
              </Button>
            </Link>
            <Link href="/creators">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Start Your Brand
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <span>Glow Custom Serum</span>
          <span>Cosmetic products only. Not intended to diagnose or treat any condition.</span>
        </div>
      </footer>
    </div>
  )
}
