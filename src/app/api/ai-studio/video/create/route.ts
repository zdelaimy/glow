import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/ai-studio/openai'
import { buildVideoTextPrompt, videoTextJsonSchema } from '@/lib/ai-studio/video-prompts'
import { videoCreateRequestSchema } from '@/lib/ai-studio/schemas'
import { checkVideoDailyLimit } from '@/lib/ai-studio/rate-limit'

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

    // Rate limit: 10 video briefs per day
    const rateCheck = await checkVideoDailyLimit(glowGirl.id)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Daily video limit reached (${rateCheck.limit}/day). Try again tomorrow.` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = videoCreateRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { templateId, platform, tone, productId, title } = parsed.data

    // Fetch template
    const { data: template } = await supabase
      .from('ai_studio_templates')
      .select('*')
      .eq('id', templateId)
      .eq('active', true)
      .single()
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

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
        type: 'video',
        platform,
        product_id: productId || null,
        tone: tone || null,
        status: 'processing',
      })
      .select()
      .single()

    if (projError || !project) {
      console.error('Project create error:', projError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Generate content brief with OpenAI
    const { system, user: userPrompt } = buildVideoTextPrompt({
      templateCategory: template.category,
      templateName: template.name,
      platform,
      tone: tone || undefined,
      productName,
      productDescription,
      suggestedSound: template.suggested_sound || undefined,
    })

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4',
      temperature: 0.8,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_schema', json_schema: videoTextJsonSchema },
    })

    const aiResult = completion.choices[0]?.message?.content
    if (!aiResult) {
      await supabase.from('ai_studio_projects').update({ status: 'failed' }).eq('id', project.id)
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const parsedResult = JSON.parse(aiResult)
    const tokensUsed = completion.usage?.total_tokens || null

    // Save output
    const { data: output } = await supabase
      .from('ai_studio_outputs')
      .insert({
        project_id: project.id,
        output_type: 'video_package',
        content: parsedResult,
        model: 'gpt-5.4',
        tokens_used: tokensUsed,
      })
      .select()
      .single()

    // Update project status
    await supabase.from('ai_studio_projects').update({ status: 'completed' }).eq('id', project.id)

    return NextResponse.json({
      project: { ...project, status: 'completed', outputs: [output] },
      output: output || { content: parsedResult },
      template,
    })
  } catch (err) {
    console.error('Video create error:', err)
    return NextResponse.json({ error: 'Video brief generation failed' }, { status: 500 })
  }
}
