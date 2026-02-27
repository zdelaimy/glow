import { z } from 'zod'

export const creatorBrandSchema = z.object({
  brand_name: z.string().min(2).max(50),
  slug: z.string().min(3).max(32).regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, 'Slug must be lowercase alphanumeric with hyphens'),
  hero_headline: z.string().min(5).max(120),
  benefits: z.array(z.string().min(3).max(80)).min(1).max(3),
  story: z.string().min(20).max(500),
  label_template: z.enum(['A', 'B', 'C']),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})

export const creatorSignatureSchema = z.object({
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

export type CreatorBrandInput = z.infer<typeof creatorBrandSchema>
export type CreatorSignatureInput = z.infer<typeof creatorSignatureSchema>
