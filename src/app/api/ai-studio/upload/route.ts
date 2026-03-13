import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/ai-studio/storage'

export async function POST(req: NextRequest) {
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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!projectId) return NextResponse.json({ error: 'No projectId provided' }, { status: 400 })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (images 10MB, video 100MB)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${isVideo ? '100MB' : '10MB'}` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const storagePath = await uploadToStorage(glowGirl.id, projectId, file.name, buffer, file.type)

    const { data: asset, error } = await supabase
      .from('ai_studio_assets')
      .insert({
        project_id: projectId,
        glow_girl_id: glowGirl.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
      })
      .select()
      .single()

    if (error) {
      console.error('Asset insert error:', error)
      return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 })
    }

    return NextResponse.json({ asset })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
