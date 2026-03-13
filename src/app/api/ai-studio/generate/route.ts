import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/ai-studio/openai'
import { buildGeneratePrompt } from '@/lib/ai-studio/prompts'
import { generateRequestSchema, postPackageJsonSchema } from '@/lib/ai-studio/schemas'
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
    const parsed = generateRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { platform, goal, productId, tone, audience, assetId, title } = parsed.data

    // Fetch product if specified
    let productName: string | undefined
    let productDescription: string | undefined
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('name, description')
        .eq('id', productId)
        .single()
      if (product) {
        productName = product.name
        productDescription = product.description || undefined
      }
    }

    // Create project
    const { data: project, error: projError } = await supabase
      .from('ai_studio_projects')
      .insert({
        glow_girl_id: glowGirl.id,
        title,
        type: 'generate',
        platform,
        goal,
        product_id: productId || null,
        tone,
        audience: audience || null,
        status: 'processing',
      })
      .select()
      .single()

    if (projError || !project) {
      console.error('Project create error:', projError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Build prompt
    let hasImage = false
    let imageBase64: string | undefined
    let imageType: string | undefined

    if (assetId) {
      const { data: asset } = await supabase
        .from('ai_studio_assets')
        .select('*')
        .eq('id', assetId)
        .eq('glow_girl_id', glowGirl.id)
        .single()

      if (asset && asset.file_type.startsWith('image/')) {
        hasImage = true
        imageBase64 = await downloadAsBase64(asset.storage_path)
        imageType = asset.file_type
      }
    }

    const { system, user: userPrompt } = buildGeneratePrompt({
      platform,
      goal,
      tone,
      productName,
      productDescription,
      audience,
      hasImage,
    })

    // Build messages
    const content: ChatCompletionContentPart[] = [{ type: 'text', text: userPrompt }]
    if (hasImage && imageBase64 && imageType) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:${imageType};base64,${imageBase64}`, detail: 'high' },
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
      response_format: { type: 'json_schema', json_schema: postPackageJsonSchema },
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      await supabase.from('ai_studio_projects').update({ status: 'failed' }).eq('id', project.id)
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsedResult = JSON.parse(result)
    const tokensUsed = completion.usage?.total_tokens || null

    // Save output
    const { data: output, error: outError } = await supabase
      .from('ai_studio_outputs')
      .insert({
        project_id: project.id,
        output_type: 'post_package',
        content: parsedResult,
        model: 'gpt-5.4',
        tokens_used: tokensUsed,
      })
      .select()
      .single()

    if (outError) {
      console.error('Output save error:', outError)
    }

    // Update project status
    await supabase.from('ai_studio_projects').update({ status: 'completed' }).eq('id', project.id)

    return NextResponse.json({ project: { ...project, status: 'completed' }, output: output || { content: parsedResult } })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
