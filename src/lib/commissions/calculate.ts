import type { MonthlyBonusTier, CommissionSettings, RewardTier } from '@/types/database'
import {
  REWARD_TIERS,
  TOP_SELLER_THRESHOLD_CENTS,
  TOP_SELLER_OVERFLOW_STEP_CENTS,
  TOP_SELLER_OVERFLOW_BONUS_CENTS,
} from './constants'

/**
 * Calculate commission amount from an order.
 */
export function calculateCommission(orderAmountCents: number, rate: number): number {
  return Math.round(orderAmountCents * rate)
}

/**
 * Calculate monthly bonus based on commission total and tier table.
 * Includes overflow rule: for commissions >= $10K, add $3000 per $5000 above $10K.
 */
export function calculateMonthlyBonus(
  monthlyCommissionCents: number,
  tiers: MonthlyBonusTier[]
): { bonusCents: number; tierLabel: string } {
  const sorted = [...tiers].sort((a, b) => a.sort_order - b.sort_order)

  let matchedTier = sorted[0]
  for (const tier of sorted) {
    if (monthlyCommissionCents >= tier.min_commission_cents) {
      matchedTier = tier
    }
  }

  let bonusCents = matchedTier.bonus_cents

  // Top-seller overflow: +$3000 per $5000 above $10K
  if (monthlyCommissionCents >= TOP_SELLER_THRESHOLD_CENTS) {
    const above = monthlyCommissionCents - TOP_SELLER_THRESHOLD_CENTS
    const overflowSteps = Math.floor(above / TOP_SELLER_OVERFLOW_STEP_CENTS)
    bonusCents += overflowSteps * TOP_SELLER_OVERFLOW_BONUS_CENTS
  }

  return { bonusCents, tierLabel: matchedTier.tier_label }
}

/**
 * Calculate new Glow Girl bonus (incremental, within 45-day window).
 * Total available is settings.new_creator_bonus_cents.
 * Returns the incremental amount still owed.
 */
export function calculateNewGlowGirlBonus(
  totalEarnedCents: number,
  alreadyPaidBonusCents: number,
  settings: CommissionSettings
): number {
  // New Glow Girl bonus matches earnings up to the cap
  const eligible = Math.min(totalEarnedCents, settings.new_creator_bonus_cents)
  const incremental = Math.max(0, eligible - alreadyPaidBonusCents)
  return incremental
}

/**
 * Calculate points for an order.
 */
export function calculatePoints(
  orderAmountCents: number,
  type: 'PERSONAL' | 'REFERRAL_MATCH',
  settings: CommissionSettings
): number {
  const dollarsRounded = Math.floor(orderAmountCents / 100)
  const multiplier = type === 'PERSONAL'
    ? settings.points_personal_multiplier
    : settings.points_referral_multiplier
  return dollarsRounded * multiplier
}

/**
 * Get the reward tier for a given point total.
 */
export function getRewardTier(totalPoints: number): { tier: RewardTier; label: string } | null {
  let matched: (typeof REWARD_TIERS)[number] | null = null
  for (const t of REWARD_TIERS) {
    if (totalPoints >= t.minPoints) {
      matched = t
    }
  }
  return matched ? { tier: matched.tier, label: matched.label } : null
}

/**
 * Detect which new tiers were crossed between previous and new point totals.
 */
export function getNewMilestones(
  prevPoints: number,
  newPoints: number
): { tier: RewardTier; minPoints: number; label: string }[] {
  return REWARD_TIERS.filter(t => prevPoints < t.minPoints && newPoints >= t.minPoints)
}

/**
 * Extract the 7 override rates from commission settings into an array.
 * Index 0 = Level 1 rate, Index 6 = Level 7 rate.
 */
export function getLevelOverrideRates(settings: CommissionSettings): number[] {
  return [
    settings.level1_override_rate,
    settings.level2_override_rate,
    settings.level3_override_rate,
    settings.level4_override_rate,
    settings.level5_override_rate,
    settings.level6_override_rate,
    settings.level7_override_rate,
  ]
}

/**
 * Compute how many override levels a Glow Girl has unlocked (0-7)
 * based on their personal recruit count and group volume.
 */
export function computeUnlockedLevels(
  recruits: number,
  gvCents: number,
  settings: CommissionSettings
): number {
  // L1: 1 personal recruit
  if (recruits < 1) return 0
  // L2: 3 personal recruits
  if (recruits < settings.rank_l2_min_recruits) return 1
  // L3: 5 recruits + $5K GV
  if (recruits < settings.rank_l3_min_recruits || gvCents < settings.rank_l3_min_gv_cents) return 2
  // L4: $25K GV
  if (gvCents < settings.rank_l4_min_gv_cents) return 3
  // L5: $75K GV
  if (gvCents < settings.rank_l5_min_gv_cents) return 4
  // L6: $200K GV
  if (gvCents < settings.rank_l6_min_gv_cents) return 5
  // L7: $500K GV
  if (gvCents < settings.rank_l7_min_gv_cents) return 6
  return 7
}

/**
 * Calculate override amount for a specific level.
 * Returns 0 if the level is not unlocked.
 */
export function calculateLevelOverride(
  orderAmountCents: number,
  level: number,
  unlockedLevels: number,
  rates: number[]
): number {
  if (level < 1 || level > 7) return 0
  if (level > unlockedLevels) return 0
  return Math.round(orderAmountCents * rates[level - 1])
}
