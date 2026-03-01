import { SupabaseClient } from '@supabase/supabase-js'
import { calculateCommission, calculatePoints, getNewMilestones } from './calculate'
import type { CommissionSettings } from '@/types/database'

/**
 * Process commissions and points for a completed order.
 * Called from the Stripe webhook after order insert.
 */
export async function processOrderCommission(
  supabase: SupabaseClient,
  orderId: string,
  glowGirlId: string,
  orderAmountCents: number
) {
  // Fetch commission settings
  const { data: settings } = await supabase
    .from('commission_settings')
    .select('*')
    .single()

  if (!settings) {
    console.error('Commission settings not found')
    return
  }

  const period = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // 1. Insert PERSONAL commission for selling glow girl
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

  // 2. Insert personal points
  const personalPoints = calculatePoints(orderAmountCents, 'PERSONAL', settings as CommissionSettings)
  await insertPointsAndCheckMilestones(supabase, glowGirlId, orderId, personalPoints, 'PERSONAL', 'Personal sale commission')

  // 3. Check for active referrer → insert REFERRAL_MATCH commission
  const { data: referral } = await supabase
    .from('glow_girl_referrals')
    .select('referrer_id')
    .eq('referred_id', glowGirlId)
    .gt('match_expires_at', new Date().toISOString())
    .single()

  if (referral) {
    // Level 1 referral match (10%)
    const matchAmount = calculateCommission(personalAmount, settings.referral_match_rate)
    if (matchAmount > 0) {
      await supabase.from('commissions').insert({
        glow_girl_id: referral.referrer_id,
        order_id: orderId,
        commission_type: 'REFERRAL_MATCH',
        amount_cents: matchAmount,
        rate: settings.referral_match_rate,
        status: 'PENDING',
        period,
      })

      // Referral points for the referrer
      const referralPoints = calculatePoints(orderAmountCents, 'REFERRAL_MATCH', settings as CommissionSettings)
      await insertPointsAndCheckMilestones(
        supabase, referral.referrer_id, orderId, referralPoints, 'REFERRAL_MATCH', 'Referral match points'
      )
    }

    // Level 2 referral match (5%) — referrer's referrer
    const level2Rate = settings.level2_referral_match_rate || 0.05
    const { data: level2Referral } = await supabase
      .from('glow_girl_referrals')
      .select('referrer_id')
      .eq('referred_id', referral.referrer_id)
      .gt('match_expires_at', new Date().toISOString())
      .single()

    if (level2Referral) {
      const level2Amount = calculateCommission(personalAmount, level2Rate)
      if (level2Amount > 0) {
        await supabase.from('commissions').insert({
          glow_girl_id: level2Referral.referrer_id,
          order_id: orderId,
          commission_type: 'REFERRAL_MATCH',
          amount_cents: level2Amount,
          rate: level2Rate,
          status: 'PENDING',
          period,
        })

        const level2Points = calculatePoints(orderAmountCents, 'REFERRAL_MATCH', settings as CommissionSettings)
        await insertPointsAndCheckMilestones(
          supabase, level2Referral.referrer_id, orderId, level2Points, 'REFERRAL_MATCH', 'Level 2 referral match points'
        )
      }
    }
  }

  // 4. Check for pod membership → insert POD_OVERRIDE commission for pod leader
  const { data: membership } = await supabase
    .from('pod_memberships')
    .select('pod_id, pod:pods!inner(leader_id)')
    .eq('glow_girl_id', glowGirlId)
    .is('left_at', null)
    .single()

  if (membership) {
    const pod = membership.pod as unknown as { leader_id: string }
    // Pod override only applies if the seller is NOT the pod leader
    if (pod.leader_id !== glowGirlId) {
      const podOverrideRate = settings.pod_override_rate || 0.05
      const podOverrideAmount = calculateCommission(orderAmountCents, podOverrideRate)
      if (podOverrideAmount > 0) {
        await supabase.from('commissions').insert({
          glow_girl_id: pod.leader_id,
          order_id: orderId,
          commission_type: 'POD_OVERRIDE',
          amount_cents: podOverrideAmount,
          rate: podOverrideRate,
          status: 'PENDING',
          period,
        })
      }
    }
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

  // Get current balance before insert
  const { data: balance } = await supabase
    .from('reward_points_balance')
    .select('total_points')
    .eq('glow_girl_id', glowGirlId)
    .single()

  const prevPoints = balance?.total_points || 0

  // Insert ledger entry (trigger auto-updates balance)
  await supabase.from('reward_points_ledger').insert({
    glow_girl_id: glowGirlId,
    order_id: orderId,
    points,
    source,
    description,
  })

  const newPoints = prevPoints + points

  // Check for new milestones
  const milestones = getNewMilestones(prevPoints, newPoints)
  for (const m of milestones) {
    await supabase.from('reward_milestones').insert({
      glow_girl_id: glowGirlId,
      tier: m.tier,
      points_at_crossing: newPoints,
    })
  }
}
