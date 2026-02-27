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
 * Calculate new creator bonus (incremental, within 45-day window).
 * Total available is settings.new_creator_bonus_cents.
 * Returns the incremental amount still owed.
 */
export function calculateNewCreatorBonus(
  totalEarnedCents: number,
  alreadyPaidBonusCents: number,
  settings: CommissionSettings
): number {
  // New creator bonus matches earnings up to the cap
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
