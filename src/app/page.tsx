import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
        <section className="py-24 md:py-32 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Creator Commerce Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6">
            Your skin.{' '}
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
              Your creator.
            </span>
            <br />
            Your glow.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            Creators design signature custom serums. You take a quick quiz.
            We blend it just for you. It&apos;s skincare, reimagined.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600">
                Start as a Creator
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Shop Custom Serums
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Creator designs',
                desc: 'Creators build their signature serum formula and branded storefront.',
              },
              {
                step: '02',
                title: 'You discover',
                desc: 'Take a short skin quiz on your favorite creator\'s page.',
              },
              {
                step: '03',
                title: 'We blend & ship',
                desc: 'Your custom serum arrives — base + boosters, ready for your ritual.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="text-5xl font-extralight text-violet-300">{item.step}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-24 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Ready to <span className="font-semibold">glow</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join creators who are building the future of personalized skincare.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-violet-500">
              Get Started
            </Button>
          </Link>
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
