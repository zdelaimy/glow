import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteProjectFiles } from '@/lib/ai-studio/storage'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!glowGirl) return NextResponse.json({ error: 'Not a Glow Girl' }, { status: 403 })

    const { data: projects } = await supabase
      .from('ai_studio_projects')
      .select('*, product:products(id, name, image_url), outputs:ai_studio_outputs(id, output_type, content, tokens_used)')
      .eq('glow_girl_id', glowGirl.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ projects: projects || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!glowGirl) return NextResponse.json({ error: 'Not a Glow Girl' }, { status: 403 })

    const { projectId } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    // Delete storage files
    await deleteProjectFiles(glowGirl.id, projectId).catch(() => {})

    // Delete project (cascades to assets + outputs)
    const { error } = await supabase
      .from('ai_studio_projects')
      .delete()
      .eq('id', projectId)
      .eq('glow_girl_id', glowGirl.id)

    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
