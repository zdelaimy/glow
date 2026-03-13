import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!glowGirl) return NextResponse.json({ error: 'Not a Glow Girl' }, { status: 403 })

    const { data: project } = await supabase
      .from('ai_studio_projects')
      .select('*, product:products(id, name, image_url), outputs:ai_studio_outputs(*), assets:ai_studio_assets(*)')
      .eq('id', id)
      .eq('glow_girl_id', glowGirl.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ project })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}
