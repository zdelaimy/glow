import { SupabaseClient } from '@supabase/supabase-js'
import {
  calculateCommission,
  calculatePoints,
  calculateLevelOverride,
  getLevelOverrideRates,
  getNewMilestones,
} from './calculate'
import { recomputeRanksForUpline } from './rank-update'
import type { CommissionSettings } from '@/types/database'

export async function processOrderCommission(
  supabase: SupabaseClient,
  orderId: string,
  glowGirlId: string,
  orderAmountCents: number
) {
  const { data: settings } = await supabase
    .from('commission_settings')
    .select('*')
    .single()

  if (!settings) {
    console.error('Commission settings not found')
    return
  }

  const period = new Date().toISOString().slice(0, 7)

  // 1. PERSONAL commission (25% default)
  const personalAmount = calculateCommission(orderAmountCents, settings.commission_rate)
  await supabase.from('commissions').insert({
    glow_girl_id: glowGirlId,
    order_id: orderId,
    commission_type: 'PERSONAL',
    amount_cents: personalAmount,
    rate: settings.commission_rate,
    status: 'PENDING',
    period,
  })

  // 2. Personal points
  const personalPoints = calculatePoints(orderAmountCents, 'PERSONAL', settings as CommissionSettings)
  await insertPointsAndCheckMilestones(supabase, glowGirlId, orderId, personalPoints, 'PERSONAL', 'Personal sale commission')

  // 3. Walk 7 levels up via get_upline RPC
  const { data: upline } = await supabase.rpc('get_upline', {
    p_glow_girl_id: glowGirlId,
    p_max_levels: 7,
  })

  if (upline && upline.length > 0) {
    // Batch-fetch all upline ranks
    const uplineIds = upline.map((u: { glow_girl_id: string }) => u.glow_girl_id)
    const { data: ranks } = await supabase
      .from('glow_girl_ranks')
      .select('glow_girl_id, unlocked_levels')
      .in('glow_girl_id', uplineIds)

    const rankMap = new Map<string, number>()
    for (const r of ranks || []) {
      rankMap.set(r.glow_girl_id, r.unlocked_levels)
    }

    const overrideRates = getLevelOverrideRates(settings as CommissionSettings)

    // Calculate and insert LEVEL_OVERRIDE commissions
    for (const { level, glow_girl_id: uplineId } of upline as { level: number; glow_girl_id: string }[]) {
      const unlockedLevels = rankMap.get(uplineId) || 0
      const overrideAmount = calculateLevelOverride(orderAmountCents, level, unlockedLevels, overrideRates)

      if (overrideAmount > 0) {
        await supabase.from('commissions').insert({
          glow_girl_id: uplineId,
          order_id: orderId,
          commission_type: 'LEVEL_OVERRIDE',
          amount_cents: overrideAmount,
          rate: overrideRates[level - 1],
          override_level: level,
          status: 'PENDING',
          period,
        })

        // Points for override earners (using referral multiplier)
        const overridePoints = calculatePoints(orderAmountCents, 'REFERRAL_MATCH', settings as CommissionSettings)
        await insertPointsAndCheckMilestones(
          supabase, uplineId, orderId, overridePoints, 'REFERRAL_MATCH',
          `L${level} override commission`
        )
      }
    }

    // Increment GV for seller + all upline members
    await supabase.rpc('increment_gv', { p_glow_girl_id: glowGirlId, p_amount_cents: orderAmountCents })
    for (const uplineMember of upline as { glow_girl_id: string }[]) {
      await supabase.rpc('increment_gv', { p_glow_girl_id: uplineMember.glow_girl_id, p_amount_cents: orderAmountCents })
    }

    // Recompute ranks for all upline members after GV changes
    await recomputeRanksForUpline(supabase, uplineIds, settings as CommissionSettings)
  } else {
    // No upline — still increment seller's own GV
    await supabase.rpc('increment_gv', { p_glow_girl_id: glowGirlId, p_amount_cents: orderAmountCents })
  }
}

async function insertPointsAndCheckMilestones(
  supabase: SupabaseClient,
  glowGirlId: string,
  orderId: string,
  points: number,
  source: 'PERSONAL' | 'REFERRAL_MATCH',
  description: string
) {
  if (points <= 0) return

  const { data: balance } = await supabase
    .from('reward_points_balance')
    .select('total_points')
    .eq('glow_girl_id', glowGirlId)
    .single()

  const prevPoints = balance?.total_points || 0

  await supabase.from('reward_points_ledger').insert({
    glow_girl_id: glowGirlId,
    order_id: orderId,
    points,
    source,
    description,
  })

  const newPoints = prevPoints + points
  const milestones = getNewMilestones(prevPoints, newPoints)
  for (const m of milestones) {
    await supabase.from('reward_milestones').insert({
      glow_girl_id: glowGirlId,
      tier: m.tier,
      points_at_crossing: newPoints,
    })
  }
}
