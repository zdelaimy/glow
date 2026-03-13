import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'
import { AIStudioTabs } from './_components/ai-studio-tabs'
import type { AIStudioProject } from '@/lib/ai-studio/types'

export default async function AIStudioPage() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Fetch products for the dropdown
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('active', true)
    .order('sort_order')

  // Fetch recent projects
  const { data: projects } = await supabase
    .from('ai_studio_projects')
    .select('*, product:products(id, name, image_url), outputs:ai_studio_outputs(id, output_type, content, tokens_used)')
    .eq('glow_girl_id', glowGirl.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-inter">
      <header className="bg-white/60 backdrop-blur-sm border-b border-[#6E6A62]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg tracking-tight text-[#6E6A62] font-medium">
              GLOW
            </Link>
            <div>
              <h1 className="font-medium text-[#6E6A62]">{glowGirl.brand_name}</h1>
              <p className="text-sm text-[#6E6A62]/50">AI Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/glow-girl/dashboard"
              className="rounded-full border border-[#6E6A62]/30 px-4 py-2 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
            >
              Back to Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <AIStudioTabs
          products={(products || []).map(p => ({ id: p.id, name: p.name }))}
          initialProjects={(projects || []) as AIStudioProject[]}
        />
      </main>
    </div>
  )
}
