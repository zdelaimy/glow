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
  creatorId: string,
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

  // 1. Insert PERSONAL commission for selling creator
  const personalAmount = calculateCommission(orderAmountCents, settings.commission_rate)
  await supabase.from('commissions').insert({
    creator_id: creatorId,
    order_id: orderId,
    commission_type: 'PERSONAL',
    amount_cents: personalAmount,
    rate: settings.commission_rate,
    status: 'PENDING',
    period,
  })

  // 2. Insert personal points
  const personalPoints = calculatePoints(orderAmountCents, 'PERSONAL', settings as CommissionSettings)
  await insertPointsAndCheckMilestones(supabase, creatorId, orderId, personalPoints, 'PERSONAL', 'Personal sale commission')

  // 3. Check for active referrer → insert REFERRAL_MATCH commission
  const { data: referral } = await supabase
    .from('creator_referrals')
    .select('referrer_id')
    .eq('referred_id', creatorId)
    .gt('match_expires_at', new Date().toISOString())
    .single()

  if (referral) {
    const matchAmount = calculateCommission(personalAmount, settings.referral_match_rate)
    if (matchAmount > 0) {
      await supabase.from('commissions').insert({
        creator_id: referral.referrer_id,
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
  }
}

async function insertPointsAndCheckMilestones(
  supabase: SupabaseClient,
  creatorId: string,
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
    .eq('creator_id', creatorId)
    .single()

  const prevPoints = balance?.total_points || 0

  // Insert ledger entry (trigger auto-updates balance)
  await supabase.from('reward_points_ledger').insert({
    creator_id: creatorId,
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
      creator_id: creatorId,
      tier: m.tier,
      points_at_crossing: newPoints,
    })
  }
}
