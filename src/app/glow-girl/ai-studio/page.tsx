import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import { AIStudioTabs } from './_components/ai-studio-tabs'
import type { AIStudioProject, VideoTemplate } from '@/lib/ai-studio/types'

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

  // Fetch video templates
  const { data: templates } = await supabase
    .from('ai_studio_templates')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <AIStudioTabs
        products={(products || []).map(p => ({ id: p.id, name: p.name }))}
        initialProjects={(projects || []) as AIStudioProject[]}
        templates={(templates || []) as VideoTemplate[]}
      />
    </div>
  )
}
