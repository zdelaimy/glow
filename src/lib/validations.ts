import { z } from 'zod'

export const glowGirlBrandSchema = z.object({
  brand_name: z.string().min(2).max(50),
  slug: z.string().min(3).max(32).regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, 'Slug must be lowercase alphanumeric with hyphens'),
  hero_headline: z.string().min(5).max(120),
  benefits: z.array(z.string().min(3).max(80)).min(1).max(3),
  story: z.string().min(20).max(500),
  label_template: z.enum(['A', 'B', 'C']),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})

export const glowGirlSignatureSchema = z.object({
  signature_name: z.string().min(2).max(60),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  base_id: z.string().uuid(),
  booster_primary_id: z.string().uuid(),
  booster_secondary_id: z.string().uuid().nullable(),
  texture_id: z.string().uuid().nullable(),
  scent_id: z.string().uuid().nullable(),
  one_time_price_cents: z.number().int().min(100).max(99900),
  subscription_price_cents: z.number().int().min(100).max(99900),
  description: z.string().max(500).nullable(),
  benefit_bullets: z.array(z.string().max(120)).max(5),
  ritual_instructions: z.string().max(1000).nullable(),
})

export const glowGirlApplicationSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  social_platforms: z.array(z.string()).min(1),
  primary_handle: z.string().max(100).nullable(),
  follower_range: z.string().min(1),
  creates_content: z.boolean(),
  heard_from: z.string().min(1),
  interested_products: z.array(z.string()).min(1),
  why_glow: z.string().min(10).max(500),
  previous_direct_sales: z.boolean(),
  previous_company: z.string().max(100).nullable(),
  referral_code: z.string().max(20).nullable(),
  agreed_to_terms: z.literal(true, { message: 'You must agree to the terms' }),
})

export type GlowGirlBrandInput = z.infer<typeof glowGirlBrandSchema>
export type GlowGirlSignatureInput = z.infer<typeof glowGirlSignatureSchema>
export type GlowGirlApplicationInput = z.infer<typeof glowGirlApplicationSchema>
