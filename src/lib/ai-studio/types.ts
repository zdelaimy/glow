export interface AIStudioProject {
  id: string
  glow_girl_id: string
  title: string
  type: 'generate' | 'analyze'
  platform: 'tiktok' | 'instagram' | 'both' | null
  goal: string | null
  product_id: string | null
  tone: string | null
  audience: string | null
  status: 'draft' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  // Joined
  product?: { id: string; name: string; image_url: string | null }
  outputs?: AIStudioOutput[]
  assets?: AIStudioAsset[]
}

export interface AIStudioAsset {
  id: string
  project_id: string
  glow_girl_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
}

export interface AIStudioOutput {
  id: string
  project_id: string
  output_type: 'post_package' | 'analysis'
  content: PostPackageResult | AnalysisResult
  model: string
  tokens_used: number | null
  created_at: string
}

// Generate output shape
export interface PostPackageResult {
  hooks: { text: string; style: string }[]
  scripts: { section: string; timestamp: string; content: string }[]
  captions: { platform: string; text: string; char_count: number }[]
  ctas: string[]
  hashtags: string[]
  viral_score: {
    overall: number
    hook_strength: number
    relatability: number
    shareability: number
    trend_alignment: number
  }
  edit_recommendations: string[]
  thumbnail_suggestion: string
  best_posting_time: string
}

// Analyze output shape
export interface AnalysisResult {
  overall_score: number
  hook_analysis: {
    score: number
    current: string
    rewrite: string
    feedback: string
  }
  pacing: {
    score: number
    feedback: string
  }
  visual_quality: {
    lighting: number
    framing: number
    background: number
    feedback: string
  }
  script_rewrite: {
    original_summary: string
    improved: string
  }
  platform_fit: { platform: string; score: number; feedback: string }[]
  improvements: { priority: number; title: string; description: string }[]
}

export type Platform = 'tiktok' | 'instagram' | 'both'
export type Goal = 'sell_product' | 'lifestyle' | 'before_after' | 'testimonial' | 'recruitment'
export type Tone = 'clean_girl' | 'luxury' | 'friendly' | 'expert' | 'aspirational' | 'funny'

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'both', label: 'Both' },
]

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'sell_product', label: 'Sell Product' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'before_after', label: 'Before & After' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'recruitment', label: 'Recruitment' },
]

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'clean_girl', label: 'Clean Girl' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'expert', label: 'Expert' },
  { value: 'aspirational', label: 'Aspirational' },
  { value: 'funny', label: 'Funny' },
]
