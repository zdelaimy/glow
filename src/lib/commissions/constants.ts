import type { RewardTier } from '@/types/database'

export const REWARD_TIERS: { tier: RewardTier; minPoints: number; label: string; description: string }[] = [
  { tier: 'PEARL', minPoints: 1000, label: 'Pearl', description: 'Welcome gift box + exclusive badge' },
  { tier: 'OPAL', minPoints: 5000, label: 'Opal', description: 'Branded merch pack + early access to new launches' },
  { tier: 'ROSE_QUARTZ', minPoints: 15000, label: 'Rose Quartz', description: 'Annual serum supply + VIP community access' },
  { tier: 'AMETHYST', minPoints: 35000, label: 'Amethyst', description: 'Spa retreat weekend + custom packaging designs' },
  { tier: 'SAPPHIRE', minPoints: 75000, label: 'Sapphire', description: 'All-expenses-paid Glow Girl summit + 1-on-1 mentorship' },
  { tier: 'DIAMOND', minPoints: 150000, label: 'Diamond', description: 'Luxury trip for two + co-branded product line' },
]

// Top-seller overflow rule: for commissions above $10K/month, add $3000 per $5000 above $10K
export const TOP_SELLER_THRESHOLD_CENTS = 1000000 // $10,000
export const TOP_SELLER_OVERFLOW_STEP_CENTS = 500000 // $5,000 increments
export const TOP_SELLER_OVERFLOW_BONUS_CENTS = 300000 // $3,000 per increment
