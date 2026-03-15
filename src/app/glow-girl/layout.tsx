import { requireGlowGirl } from '@/lib/auth'
import { GlowGirlSidebar } from './_components/glow-girl-sidebar'

export default async function GlowGirlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { glowGirl } = await requireGlowGirl()

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-inter">
      <GlowGirlSidebar
        brandName={glowGirl.brand_name || 'Glow Girl'}
      />
      {/* Main content — offset for desktop sidebar, top padding for mobile header */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
