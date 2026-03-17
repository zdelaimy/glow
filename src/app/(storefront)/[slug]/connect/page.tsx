import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'
import { ConnectForm } from '@/components/connect-form'
import { CalendlyEmbed } from '@/components/calendly-embed'
import type { GlowGirl } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ConnectPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const supabase = await createClient()

  const slug = rawSlug.replace(/^@/, '')

  const { data: glowGirl } = await supabase
    .from('glow_girls')
    .select('*')
    .eq('slug', slug)
    .eq('approved', true)
    .single()

  if (!glowGirl) notFound()

  const g = glowGirl as GlowGirl

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <LandingHeader variant="light" />

      {/* Hero / Bio section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Photo */}
          {g.connect_photo_url ? (
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white shadow-lg">
              <Image
                src={g.connect_photo_url}
                alt={g.brand_name || 'Glow Girl'}
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#e8ddd4] to-[#d4c5b8] mx-auto mb-6 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-3xl md:text-4xl text-white/80 font-light italic">
                {(g.brand_name || 'G').charAt(0)}
              </span>
            </div>
          )}

          <p className="text-[11px] uppercase tracking-[0.2em] text-[#4a4740]/50 mb-3">
            Connect with
          </p>
          <h1 className="text-4xl md:text-5xl italic leading-tight mb-4 text-[#3d3a35]">
            {g.connect_headline || g.brand_name || 'Your Glow Girl'}
          </h1>

          {g.connect_bio ? (
            <p className="text-[15px] text-[#4a4740]/80 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
              {g.connect_bio}
            </p>
          ) : (
            <p className="text-sm text-[#4a4740]/70 max-w-md mx-auto leading-relaxed">
              Interested in premium beauty products or joining the Glow community?
              Fill out the form below and let&apos;s chat.
            </p>
          )}
        </div>
      </section>

      {/* Form + Calendly */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className={`${g.calendly_url ? 'grid lg:grid-cols-2 gap-10 lg:gap-14 items-start' : 'max-w-lg mx-auto'}`}>
            {/* Lead form */}
            <div className="bg-white rounded-2xl border border-[#6E6A62]/10 p-8 md:p-10 shadow-sm">
              <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a4740]/70 font-semibold mb-6">
                Tell me about yourself
              </h2>
              <ConnectForm glowGirlId={g.id} brandName={g.brand_name} />
            </div>

            {/* Calendly embed */}
            {g.calendly_url && (
              <div className="bg-white rounded-2xl border border-[#6E6A62]/10 p-8 md:p-10 shadow-sm">
                <h2 className="text-xs uppercase tracking-[0.15em] text-[#4a4740]/70 font-semibold mb-6">
                  Schedule a call
                </h2>
                <CalendlyEmbed url={g.calendly_url} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
