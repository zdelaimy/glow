import type { Tone } from './types'

const SYSTEM_BASE = `You are a beauty and skincare content strategist for GLOW — a curated premium makeup and skincare brand with an ambassador (Glow Girl) creator program. You create ready-to-use content briefs for short-form vertical videos on TikTok and Instagram Reels.

Brand voice: Premium but approachable. Never pushy or salesy. Lead with the product experience, not recruitment.

Key rules:
- Never use the term "MLM" — this is an ambassador/creator partnership program
- Hook text must STOP THE SCROLL — under 8 words, punchy, curiosity-driven
- Body text should be benefit-driven, max 15 words
- CTA drives action (link in bio, comment, share, save)
- Captions should feel native to the platform, not like an ad
- Include step-by-step posting instructions so a non-technical person can follow along`

export interface VideoTextParams {
  templateCategory: string
  templateName: string
  platform: string
  tone?: Tone
  productName?: string
  productDescription?: string
  suggestedSound?: string
}

export function buildVideoTextPrompt(params: VideoTextParams) {
  const toneDescriptions: Record<Tone, string> = {
    clean_girl: 'Minimal, effortless, "I woke up like this" energy',
    luxury: 'High-end, premium feel. Aspirational',
    friendly: 'Warm, approachable, girl-next-door. Conversational',
    expert: 'Knowledgeable, educational, backed by science',
    aspirational: 'Dream life vibes, living your best life',
    funny: 'Humorous, trendy, meme-worthy, self-aware',
  }

  const templateInstructions: Record<string, string> = {
    grwm: 'This is a "Get Ready With Me" video. The hook should draw viewers into watching the full routine. Body text highlights the key product moment. CTA should encourage saves or follows.',
    before_after: 'This is a Before & After transformation video. The hook should tease the dramatic result. Body text reinforces the transformation. CTA should encourage comments or saves.',
    product_spotlight: 'This is a Product Spotlight video. The hook should create curiosity about the product. Body text highlights the key benefit. CTA should drive to link in bio.',
    testimonial: 'This is a Testimonial video. The hook should be a relatable pain point or surprising result. Body text is the key takeaway. CTA should encourage DMs or comments.',
  }

  const platformInstructions = params.platform === 'tiktok'
    ? 'Optimize for TikTok: use TikTok-native language, reference TikTok features (duet, stitch, sounds), trending hashtags'
    : params.platform === 'instagram'
    ? 'Optimize for Instagram Reels: polished aesthetic, strong caption game, strategic hashtags, encourage saves'
    : 'Create content that works on both TikTok and Instagram Reels'

  const userPrompt = `Generate a complete video content brief for a Glow Girl to post.

**Template:** ${params.templateName} — ${templateInstructions[params.templateCategory] || 'General beauty video.'}

**Platform:** ${params.platform}
${platformInstructions}

${params.tone ? `**Tone:** ${toneDescriptions[params.tone]}` : ''}

${params.productName ? `**Product:** ${params.productName}${params.productDescription ? ` — ${params.productDescription}` : ''}` : ''}

${params.suggestedSound ? `**Suggested sound to search for:** "${params.suggestedSound}"` : ''}

Generate:
1. hook_text — text to add as overlay in the first 1-2 seconds (max 8 words, scroll-stopping)
2. body_text — main text overlay during the video (max 15 words, benefit-driven)
3. cta_text — closing call-to-action text overlay (max 10 words)
4. caption — the post caption with emojis, natural tone (max 300 chars for TikTok, 2200 for IG)
5. hashtags — array of 10-15 relevant hashtags (mix of broad trending, niche beauty, and branded #GlowGirl)
6. posting_steps — array of 5-7 simple step-by-step instructions for posting (e.g. "Open Instagram and tap the + button", "Add the text overlay: [hook text]", etc.) — write these for someone who is NOT tech-savvy, be specific about where to tap and what to type`

  return { system: SYSTEM_BASE, user: userPrompt }
}

// JSON schema for OpenAI structured output — video content brief
export const videoTextJsonSchema = {
  name: 'video_content_brief',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      hook_text: { type: 'string' as const },
      body_text: { type: 'string' as const },
      cta_text: { type: 'string' as const },
      caption: { type: 'string' as const },
      hashtags: { type: 'array' as const, items: { type: 'string' as const } },
      posting_steps: { type: 'array' as const, items: { type: 'string' as const } },
    },
    required: ['hook_text', 'body_text', 'cta_text', 'caption', 'hashtags', 'posting_steps'],
    additionalProperties: false,
  },
}
