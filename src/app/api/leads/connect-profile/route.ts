import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { glow_girl_id, connect_headline, connect_bio, connect_photo_url } = body

    if (!glow_girl_id) {
      return NextResponse.json({ error: 'Missing glow_girl_id' }, { status: 400 })
    }

    // Validate photo URL if provided
    if (connect_photo_url) {
      try {
        new URL(connect_photo_url)
      } catch {
        return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 })
      }
    }

    // Verify ownership
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
      .update({
        connect_headline: connect_headline || null,
        connect_bio: connect_bio || null,
        connect_photo_url: connect_photo_url || null,
      })
      .eq('id', glow_girl_id)

    if (updateError) {
      console.error('[ConnectProfile] Update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ConnectProfile] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
