import { SupabaseClient } from '@supabase/supabase-js'
import { calculateMonthlyBonus, calculateNewGlowGirlBonus } from './calculate'
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

  // Get all glow girls who have approved commissions for this period
  const { data: commissionSums } = await supabase
    .rpc('aggregate_commissions_by_glow_girl', { target_period: period })

  // Fallback: manual aggregation if RPC doesn't exist
  const glowGirlTotals = commissionSums || await getGlowGirlCommissionTotals(supabase, period)

  for (const { glow_girl_id, total_cents } of glowGirlTotals) {
    // Calculate monthly bonus tier
    const { bonusCents, tierLabel } = calculateMonthlyBonus(
      total_cents,
      tiers as MonthlyBonusTier[]
    )

    if (bonusCents > 0) {
      await supabase.from('bonuses').insert({
        glow_girl_id,
        bonus_type: 'MONTHLY_TIER',
        amount_cents: bonusCents,
        period,
        metadata: { tier_label: tierLabel },
      })
    }

    // Check new glow girl bonus eligibility (within 45-day window)
    const { data: glowGirl } = await supabase
      .from('glow_girls')
      .select('created_at')
      .eq('id', glow_girl_id)
      .single()

    if (glowGirl) {
      const createdAt = new Date(glowGirl.created_at)
      const windowEnd = new Date(createdAt)
      windowEnd.setDate(windowEnd.getDate() + (settings as CommissionSettings).new_creator_bonus_window_days)

      if (new Date() <= windowEnd) {
        // Get total already-paid new glow girl bonuses
        const { data: existingBonuses } = await supabase
          .from('bonuses')
          .select('amount_cents')
          .eq('glow_girl_id', glow_girl_id)
          .eq('bonus_type', 'NEW_GLOW_GIRL')

        const alreadyPaid = (existingBonuses || []).reduce((s, b) => s + b.amount_cents, 0)
        const newGlowGirlBonus = calculateNewGlowGirlBonus(total_cents, alreadyPaid, settings as CommissionSettings)

        if (newGlowGirlBonus > 0) {
          await supabase.from('bonuses').insert({
            glow_girl_id,
            bonus_type: 'NEW_GLOW_GIRL',
            amount_cents: newGlowGirlBonus,
            period,
          })
        }
      }
    }

    // Get total bonuses for this period
    const { data: periodBonuses } = await supabase
      .from('bonuses')
      .select('amount_cents')
      .eq('glow_girl_id', glow_girl_id)
      .eq('period', period)

    const bonusTotal = (periodBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

    // Create or update payout record
    await supabase.from('payouts').upsert({
      glow_girl_id,
      period,
      commission_total_cents: total_cents,
      bonus_total_cents: bonusTotal,
      total_cents: total_cents + bonusTotal,
      status: 'PENDING',
    }, { onConflict: 'glow_girl_id,period' })
  }
}

async function getGlowGirlCommissionTotals(
  supabase: SupabaseClient,
  period: string
): Promise<{ glow_girl_id: string; total_cents: number }[]> {
  const { data: commissions } = await supabase
    .from('commissions')
    .select('glow_girl_id, amount_cents')
    .eq('period', period)
    .eq('status', 'APPROVED')

  if (!commissions) return []

  const totals = new Map<string, number>()
  for (const c of commissions) {
    totals.set(c.glow_girl_id, (totals.get(c.glow_girl_id) || 0) + c.amount_cents)
  }

  return Array.from(totals.entries()).map(([glow_girl_id, total_cents]) => ({
    glow_girl_id,
    total_cents,
  }))
}
