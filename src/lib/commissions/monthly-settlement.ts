import { SupabaseClient } from '@supabase/supabase-js'
import { calculateMonthlyBonus, calculateNewCreatorBonus } from './calculate'
import type { CommissionSettings, MonthlyBonusTier } from '@/types/database'

/**
 * Run monthly settlement for a given period ('YYYY-MM').
 * Aggregates approved commissions, calculates bonuses, creates payout records.
 */
export async function runMonthlySettlement(supabase: SupabaseClient, period: string) {
  // Fetch settings and tiers
  const { data: settings } = await supabase
    .from('commission_settings')
    .select('*')
    .single()

  const { data: tiers } = await supabase
    .from('monthly_bonus_tiers')
    .select('*')
    .order('sort_order')

  if (!settings || !tiers) {
    console.error('Missing commission settings or tiers')
    return
  }

  // Get all creators who have approved commissions for this period
  const { data: commissionSums } = await supabase
    .rpc('aggregate_commissions_by_creator', { target_period: period })

  // Fallback: manual aggregation if RPC doesn't exist
  const creatorTotals = commissionSums || await getCreatorCommissionTotals(supabase, period)

  for (const { creator_id, total_cents } of creatorTotals) {
    // Calculate monthly bonus tier
    const { bonusCents, tierLabel } = calculateMonthlyBonus(
      total_cents,
      tiers as MonthlyBonusTier[]
    )

    if (bonusCents > 0) {
      await supabase.from('bonuses').insert({
        creator_id,
        bonus_type: 'MONTHLY_TIER',
        amount_cents: bonusCents,
        period,
        metadata: { tier_label: tierLabel },
      })
    }

    // Check new creator bonus eligibility (within 45-day window)
    const { data: creator } = await supabase
      .from('creators')
      .select('created_at')
      .eq('id', creator_id)
      .single()

    if (creator) {
      const createdAt = new Date(creator.created_at)
      const windowEnd = new Date(createdAt)
      windowEnd.setDate(windowEnd.getDate() + (settings as CommissionSettings).new_creator_bonus_window_days)

      if (new Date() <= windowEnd) {
        // Get total already-paid new creator bonuses
        const { data: existingBonuses } = await supabase
          .from('bonuses')
          .select('amount_cents')
          .eq('creator_id', creator_id)
          .eq('bonus_type', 'NEW_CREATOR')

        const alreadyPaid = (existingBonuses || []).reduce((s, b) => s + b.amount_cents, 0)
        const newCreatorBonus = calculateNewCreatorBonus(total_cents, alreadyPaid, settings as CommissionSettings)

        if (newCreatorBonus > 0) {
          await supabase.from('bonuses').insert({
            creator_id,
            bonus_type: 'NEW_CREATOR',
            amount_cents: newCreatorBonus,
            period,
          })
        }
      }
    }

    // Get total bonuses for this period
    const { data: periodBonuses } = await supabase
      .from('bonuses')
      .select('amount_cents')
      .eq('creator_id', creator_id)
      .eq('period', period)

    const bonusTotal = (periodBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

    // Create or update payout record
    await supabase.from('payouts').upsert({
      creator_id,
      period,
      commission_total_cents: total_cents,
      bonus_total_cents: bonusTotal,
      total_cents: total_cents + bonusTotal,
      status: 'PENDING',
    }, { onConflict: 'creator_id,period' })
  }
}

async function getCreatorCommissionTotals(
  supabase: SupabaseClient,
  period: string
): Promise<{ creator_id: string; total_cents: number }[]> {
  const { data: commissions } = await supabase
    .from('commissions')
    .select('creator_id, amount_cents')
    .eq('period', period)
    .eq('status', 'APPROVED')

  if (!commissions) return []

  const totals = new Map<string, number>()
  for (const c of commissions) {
    totals.set(c.creator_id, (totals.get(c.creator_id) || 0) + c.amount_cents)
  }

  return Array.from(totals.entries()).map(([creator_id, total_cents]) => ({
    creator_id,
    total_cents,
  }))
}
