'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireCreator, requireAdmin } from '@/lib/auth'

// ─── Creator-facing actions ───

export async function getMyEarningsSummary() {
  const { creator } = await requireCreator()
  const supabase = await createClient()

  const currentPeriod = new Date().toISOString().slice(0, 7)

  // Current month commissions
  const { data: monthCommissions } = await supabase
    .from('commissions')
    .select('amount_cents, status')
    .eq('creator_id', creator.id)
    .eq('period', currentPeriod)

  const monthTotal = (monthCommissions || [])
    .filter(c => c.status !== 'CANCELLED')
    .reduce((s, c) => s + c.amount_cents, 0)

  const monthPending = (monthCommissions || [])
    .filter(c => c.status === 'PENDING')
    .reduce((s, c) => s + c.amount_cents, 0)

  // Current month bonuses
  const { data: monthBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('creator_id', creator.id)
    .eq('period', currentPeriod)

  const bonusTotal = (monthBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  // Lifetime earnings (all approved/paid commissions + bonuses)
  const { data: allCommissions } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('creator_id', creator.id)
    .in('status', ['APPROVED', 'PAID'])

  const { data: allBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('creator_id', creator.id)

  const lifetimeCommissions = (allCommissions || []).reduce((s, c) => s + c.amount_cents, 0)
  const lifetimeBonuses = (allBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  // Pending payout
  const { data: pendingPayout } = await supabase
    .from('payouts')
    .select('total_cents')
    .eq('creator_id', creator.id)
    .eq('status', 'PENDING')

  const pendingPayoutTotal = (pendingPayout || []).reduce((s, p) => s + p.total_cents, 0)

  return {
    currentMonth: {
      commissions: monthTotal,
      pending: monthPending,
      bonuses: bonusTotal,
      total: monthTotal + bonusTotal,
    },
    lifetime: lifetimeCommissions + lifetimeBonuses,
    pendingPayout: pendingPayoutTotal,
  }
}

export async function getMyCommissions(period?: string) {
  const { creator } = await requireCreator()
  const supabase = await createClient()

  let query = supabase
    .from('commissions')
    .select('*, order:orders(amount_cents, created_at, shipping_name)')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })

  if (period) {
    query = query.eq('period', period)
  }

  const { data } = await query.limit(50)
  return data || []
}

export async function getMyRewardPoints() {
  const { creator } = await requireCreator()
  const supabase = await createClient()

  const { data: balance } = await supabase
    .from('reward_points_balance')
    .select('total_points')
    .eq('creator_id', creator.id)
    .single()

  const { data: milestones } = await supabase
    .from('reward_milestones')
    .select('*')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })

  const { data: recentActivity } = await supabase
    .from('reward_points_ledger')
    .select('*')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    totalPoints: balance?.total_points || 0,
    milestones: milestones || [],
    recentActivity: recentActivity || [],
  }
}

export async function getMyReferrals() {
  const { creator } = await requireCreator()
  const supabase = await createClient()

  const currentPeriod = new Date().toISOString().slice(0, 7)

  const { data: referrals } = await supabase
    .from('creator_referrals')
    .select('*, referred:creators!creator_referrals_referred_id_fkey(id, brand_name, created_at, approved)')
    .eq('referrer_id', creator.id)
    .order('created_at', { ascending: false })

  // Referral earnings this month
  const { data: refEarnings } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('creator_id', creator.id)
    .eq('commission_type', 'REFERRAL_MATCH')
    .eq('period', currentPeriod)
    .in('status', ['PENDING', 'APPROVED', 'PAID'])

  const monthlyRefEarnings = (refEarnings || []).reduce((s, c) => s + c.amount_cents, 0)

  return {
    referralCode: creator.referral_code,
    referrals: referrals || [],
    totalReferred: (referrals || []).length,
    activeReferred: (referrals || []).filter(r => {
      const ref = r.referred as { approved?: boolean } | null
      return ref?.approved
    }).length,
    monthlyEarnings: monthlyRefEarnings,
  }
}

// ─── Admin-facing actions ───

export async function getCommissionOverview(period: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: commissions } = await supabase
    .from('commissions')
    .select('*, creator:creators(brand_name)')
    .eq('period', period)
    .order('created_at', { ascending: false })

  const { data: bonuses } = await supabase
    .from('bonuses')
    .select('*, creator:creators(brand_name)')
    .eq('period', period)

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, creator:creators(brand_name)')
    .eq('period', period)

  return { commissions: commissions || [], bonuses: bonuses || [], payouts: payouts || [] }
}

export async function approveCommissions(ids: string[]) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('commissions')
    .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
    .in('id', ids)
    .eq('status', 'PENDING')

  if (error) throw new Error(error.message)
}

export async function updateCommissionSettings(updates: Record<string, unknown>) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('commission_settings')
    .select('id')
    .single()

  if (!existing) throw new Error('Settings not found')

  const { error } = await supabase
    .from('commission_settings')
    .update(updates)
    .eq('id', existing.id)

  if (error) throw new Error(error.message)
}

export async function triggerMonthlySettlement(period: string) {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { runMonthlySettlement } = await import('@/lib/commissions/monthly-settlement')
  await runMonthlySettlement(supabase, period)
}
