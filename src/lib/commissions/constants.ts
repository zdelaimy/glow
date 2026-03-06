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

// 7-Level Override Definitions (shared by dashboard and public page)
export const LEVEL_OVERRIDE_DEFINITIONS = [
  { level: 1, rate: 0.10, rateLabel: '10%', requirement: '1 personal recruit' },
  { level: 2, rate: 0.05, rateLabel: '5%', requirement: '3 personal recruits' },
  { level: 3, rate: 0.04, rateLabel: '4%', requirement: '5 recruits + $5K GV' },
  { level: 4, rate: 0.03, rateLabel: '3%', requirement: '$25K GV' },
  { level: 5, rate: 0.02, rateLabel: '2%', requirement: '$75K GV' },
  { level: 6, rate: 0.01, rateLabel: '1%', requirement: '$200K GV' },
  { level: 7, rate: 0.01, rateLabel: '1%', requirement: '$500K GV' },
] as const

export const RANK_LABELS = [
  'Starter',          // 0 levels unlocked
  'Starter',          // L1 unlocked
  'Builder',          // L2 unlocked
  'Leader',           // L3 unlocked
  'Director',         // L4 unlocked
  'Senior Director',  // L5 unlocked
  'VP',               // L6 unlocked
  "Founder's Circle", // L7 unlocked
] as const
