import type { Goal, Tone, Platform } from './types'

const SYSTEM_BASE = `You are a beauty and skincare content strategist for GLOW — a curated premium makeup and skincare brand with an ambassador (Glow Girl) creator program. You help Glow Girls create scroll-stopping social media content that feels authentic, aspirational, and drives sales.

Brand voice: Premium but approachable. Never pushy or salesy. Lead with the product experience, not recruitment. Think "your cool friend who has the best skincare routine."

Key rules:
- Never use the term "MLM" — this is an ambassador/creator partnership program
- Focus on genuine product experience and results
- Prioritize hooks that stop the scroll in the first 1-2 seconds
- Content should feel native to the platform, not like an ad
- All scores are 1-100`

export function buildGeneratePrompt(params: {
  platform: Platform
  goal: Goal
  tone: Tone
  productName?: string
  productDescription?: string
  audience?: string
  hasImage: boolean
}) {
  const goalDescriptions: Record<Goal, string> = {
    sell_product: 'Drive product sales through compelling content that highlights benefits and results',
    lifestyle: 'Showcase the product as part of an aspirational lifestyle and daily routine',
    before_after: 'Create before/after transformation content showing real results',
    testimonial: 'Share an authentic personal experience and testimonial about the product',
    recruitment: 'Attract potential Glow Girls to join the ambassador program (lead with the brand and opportunity, never say MLM)',
  }

  const toneDescriptions: Record<Tone, string> = {
    clean_girl: 'Minimal, effortless, "I woke up like this" energy. Soft lighting, neutral tones, less is more',
    luxury: 'High-end, premium feel. Think marble countertops, silk robes, golden hour lighting',
    friendly: 'Warm, approachable, girl-next-door. Conversational and relatable',
    expert: 'Knowledgeable, educational, ingredient-focused. Backed by science and results',
    aspirational: 'Dream life vibes. Travel, self-care Sunday, living your best life',
    funny: 'Humorous, trendy, meme-worthy. Uses current sounds and trends. Self-aware',
  }

  const platformNotes = params.platform === 'tiktok'
    ? 'Optimize for TikTok: vertical video (9:16), trending sounds, fast-paced, hook in first 1s, 15-60s ideal length'
    : params.platform === 'instagram'
    ? 'Optimize for Instagram: Reels (9:16) or carousel posts, polished aesthetic, strong caption game, strategic hashtags'
    : 'Create content that works on both TikTok and Instagram. Provide platform-specific captions for each'

  const userPrompt = `Create a complete content package for a Glow Girl creator.

**Platform:** ${params.platform}
${platformNotes}

**Goal:** ${goalDescriptions[params.goal]}

**Tone:** ${toneDescriptions[params.tone]}

${params.productName ? `**Product:** ${params.productName}${params.productDescription ? `\n${params.productDescription}` : ''}` : ''}

${params.audience ? `**Target Audience:** ${params.audience}` : ''}

${params.hasImage ? 'An image has been provided for visual context. Reference it in your recommendations.' : ''}

Generate:
1. 3-5 scroll-stopping hooks (varied styles: question, bold claim, relatable moment, trend reference)
2. A full script concept broken into timed sections (hook → problem → solution → results → CTA)
3. Platform-specific captions with character counts
4. 3-4 strong CTAs
5. 15-20 relevant hashtags (mix of broad, niche, and branded)
6. Viral score with subscores (hook_strength, relatability, shareability, trend_alignment)
7. 3-5 edit/filming recommendations
8. A thumbnail/cover image suggestion
9. Best time to post recommendation`

  return { system: SYSTEM_BASE, user: userPrompt }
}

export function buildAnalyzePrompt(params: {
  platform?: Platform
  hasImage: boolean
  fileName: string
}) {
  const userPrompt = `Analyze this content from a Glow Girl creator and provide detailed, actionable feedback.

${params.platform ? `**Target Platform:** ${params.platform}` : 'Analyze for both TikTok and Instagram'}

**File:** ${params.fileName}
${params.hasImage ? 'An image has been provided. Analyze the visual elements in detail.' : 'This is a video file. Since video analysis is limited in V1, focus on general best practices and provide feedback based on the filename/context.'}

Provide:
1. Overall score (1-100)
2. Hook analysis: identify the current hook (or lack thereof), score it, rewrite it better, explain why
3. Pacing score and feedback
4. Visual quality assessment: score lighting (1-100), framing (1-100), background (1-100), with specific feedback
5. Script rewrite: summarize what's there and provide an improved version
6. Platform fit: how well does this content suit each platform? Score and explain
7. Prioritized improvements: ranked list of the most impactful changes to make`

  return { system: SYSTEM_BASE, user: userPrompt }
}
