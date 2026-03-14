import { z } from 'zod'

export const generateRequestSchema = z.object({
  platform: z.enum(['tiktok', 'instagram', 'both']),
  goal: z.enum(['sell_product', 'lifestyle', 'before_after', 'testimonial', 'recruitment']),
  productId: z.string().uuid().optional(),
  tone: z.enum(['clean_girl', 'luxury', 'friendly', 'expert', 'aspirational', 'funny']),
  audience: z.string().max(500).optional(),
  assetId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
})

export const analyzeRequestSchema = z.object({
  platform: z.enum(['tiktok', 'instagram', 'both']).optional(),
  assetId: z.string().uuid(),
  title: z.string().min(1).max(200),
})

export const videoCreateRequestSchema = z.object({
  templateId: z.string().uuid(),
  platform: z.enum(['tiktok', 'instagram', 'both']),
  tone: z.enum(['clean_girl', 'luxury', 'friendly', 'expert', 'aspirational', 'funny']).optional(),
  productId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
})

// JSON schema for OpenAI structured output — post package
export const postPackageJsonSchema = {
  name: 'post_package',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      hooks: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            text: { type: 'string' as const },
            style: { type: 'string' as const },
          },
          required: ['text', 'style'],
          additionalProperties: false,
        },
      },
      scripts: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            section: { type: 'string' as const },
            timestamp: { type: 'string' as const },
            content: { type: 'string' as const },
          },
          required: ['section', 'timestamp', 'content'],
          additionalProperties: false,
        },
      },
      captions: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            platform: { type: 'string' as const },
            text: { type: 'string' as const },
            char_count: { type: 'number' as const },
          },
          required: ['platform', 'text', 'char_count'],
          additionalProperties: false,
        },
      },
      ctas: { type: 'array' as const, items: { type: 'string' as const } },
      hashtags: { type: 'array' as const, items: { type: 'string' as const } },
      viral_score: {
        type: 'object' as const,
        properties: {
          overall: { type: 'number' as const },
          hook_strength: { type: 'number' as const },
          relatability: { type: 'number' as const },
          shareability: { type: 'number' as const },
          trend_alignment: { type: 'number' as const },
        },
        required: ['overall', 'hook_strength', 'relatability', 'shareability', 'trend_alignment'],
        additionalProperties: false,
      },
      edit_recommendations: { type: 'array' as const, items: { type: 'string' as const } },
      thumbnail_suggestion: { type: 'string' as const },
      best_posting_time: { type: 'string' as const },
    },
    required: ['hooks', 'scripts', 'captions', 'ctas', 'hashtags', 'viral_score', 'edit_recommendations', 'thumbnail_suggestion', 'best_posting_time'],
    additionalProperties: false,
  },
}

// JSON schema for OpenAI structured output — analysis
export const analysisJsonSchema = {
  name: 'content_analysis',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      overall_score: { type: 'number' as const },
      hook_analysis: {
        type: 'object' as const,
        properties: {
          score: { type: 'number' as const },
          current: { type: 'string' as const },
          rewrite: { type: 'string' as const },
          feedback: { type: 'string' as const },
        },
        required: ['score', 'current', 'rewrite', 'feedback'],
        additionalProperties: false,
      },
      pacing: {
        type: 'object' as const,
        properties: {
          score: { type: 'number' as const },
          feedback: { type: 'string' as const },
        },
        required: ['score', 'feedback'],
        additionalProperties: false,
      },
      visual_quality: {
        type: 'object' as const,
        properties: {
          lighting: { type: 'number' as const },
          framing: { type: 'number' as const },
          background: { type: 'number' as const },
          feedback: { type: 'string' as const },
        },
        required: ['lighting', 'framing', 'background', 'feedback'],
        additionalProperties: false,
      },
      script_rewrite: {
        type: 'object' as const,
        properties: {
          original_summary: { type: 'string' as const },
          improved: { type: 'string' as const },
        },
        required: ['original_summary', 'improved'],
        additionalProperties: false,
      },
      platform_fit: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            platform: { type: 'string' as const },
            score: { type: 'number' as const },
            feedback: { type: 'string' as const },
          },
          required: ['platform', 'score', 'feedback'],
          additionalProperties: false,
        },
      },
      improvements: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            priority: { type: 'number' as const },
            title: { type: 'string' as const },
            description: { type: 'string' as const },
          },
          required: ['priority', 'title', 'description'],
          additionalProperties: false,
        },
      },
    },
    required: ['overall_score', 'hook_analysis', 'pacing', 'visual_quality', 'script_rewrite', 'platform_fit', 'improvements'],
    additionalProperties: false,
  },
}
