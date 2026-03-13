import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/ai-studio/openai'
import { buildAnalyzePrompt } from '@/lib/ai-studio/prompts'
import { analyzeRequestSchema, analysisJsonSchema } from '@/lib/ai-studio/schemas'
import { downloadAsBase64 } from '@/lib/ai-studio/storage'
import { checkDailyLimit } from '@/lib/ai-studio/rate-limit'
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions'

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

    // Rate limit: 50 generations per day
    const rateCheck = await checkDailyLimit(glowGirl.id)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${rateCheck.limit} generations). Try again tomorrow.` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = analyzeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { platform, assetId, title } = parsed.data

    // Fetch asset
    const { data: asset } = await supabase
      .from('ai_studio_assets')
      .select('*')
      .eq('id', assetId)
      .eq('glow_girl_id', glowGirl.id)
      .single()

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Create project
    const { data: project, error: projError } = await supabase
      .from('ai_studio_projects')
      .insert({
        glow_girl_id: glowGirl.id,
        title,
        type: 'analyze',
        platform: platform || null,
        status: 'processing',
      })
      .select()
      .single()

    if (projError || !project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Link asset to project
    await supabase.from('ai_studio_assets').update({ project_id: project.id }).eq('id', assetId)

    const hasImage = asset.file_type.startsWith('image/')
    const { system, user: userPrompt } = buildAnalyzePrompt({
      platform,
      hasImage,
      fileName: asset.file_name,
    })

    const content: ChatCompletionContentPart[] = [{ type: 'text', text: userPrompt }]
    if (hasImage) {
      const imageBase64 = await downloadAsBase64(asset.storage_path)
      content.push({
        type: 'image_url',
        image_url: { url: `data:${asset.file_type};base64,${imageBase64}`, detail: 'high' },
      })
    }

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4',
      temperature: 0.8,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content },
      ],
      response_format: { type: 'json_schema', json_schema: analysisJsonSchema },
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      await supabase.from('ai_studio_projects').update({ status: 'failed' }).eq('id', project.id)
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsedResult = JSON.parse(result)
    const tokensUsed = completion.usage?.total_tokens || null

    const { data: output } = await supabase
      .from('ai_studio_outputs')
      .insert({
        project_id: project.id,
        output_type: 'analysis',
        content: parsedResult,
        model: 'gpt-5.4',
        tokens_used: tokensUsed,
      })
      .select()
      .single()

    await supabase.from('ai_studio_projects').update({ status: 'completed' }).eq('id', project.id)

    return NextResponse.json({ project: { ...project, status: 'completed' }, output: output || { content: parsedResult } })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
