import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { glow_girl_id, calendly_url } = body

    if (!glow_girl_id) {
      return NextResponse.json({ error: 'Missing glow_girl_id' }, { status: 400 })
    }

    // Validate URL format if provided
    if (calendly_url) {
      try {
        new URL(calendly_url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
    }

    // Verify the user owns this glow girl record
    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('id', glow_girl_id)
      .eq('user_id', user.id)
      .single()

    if (!glowGirl) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('glow_girls')
      .update({ calendly_url: calendly_url || null })
      .eq('id', glow_girl_id)

    if (updateError) {
      console.error('[Calendly] Update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Calendly] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
