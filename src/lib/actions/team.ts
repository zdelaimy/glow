'use server'

import { createClient } from '@/lib/supabase/server'
import { getSlackChannelLink } from '@/lib/slack'

export interface TeamMember {
  id: string
  brandName: string
  level: number
  salesThisMonth: number
  joinedAt: string
}

export interface TeamData {
  upline: TeamMember[]
  downline: TeamMember[]
  personalSales: number
}

export interface PodMember {
  id: string
  brandName: string
  joinedAt: string
}

export interface PodData {
  recruiter: PodMember | null
  recruiterSlackLink: string | null
  directRecruits: PodMember[]
  mySlackLink: string | null
}

export async function getPodData(glowGirlId: string): Promise<PodData> {
  const supabase = await createClient()

  // Get my slack_channel_id
  const { data: me } = await supabase
    .from('glow_girls')
    .select('slack_channel_id')
    .eq('id', glowGirlId)
    .single()

  const mySlackLink = me?.slack_channel_id ? getSlackChannelLink(me.slack_channel_id) : null

  // Get recruiter (who referred me)
  let recruiter: PodMember | null = null
  let recruiterSlackLink: string | null = null

  const { data: referral } = await supabase
    .from('glow_girl_referrals')
    .select('referrer:glow_girls!glow_girl_referrals_referrer_id_fkey(id, brand_name, created_at, slack_channel_id)')
    .eq('referred_id', glowGirlId)
    .single()

  if (referral?.referrer) {
    const ref = referral.referrer as unknown as { id: string; brand_name: string | null; created_at: string; slack_channel_id: string | null }
    recruiter = {
      id: ref.id,
      brandName: ref.brand_name || 'Unknown',
      joinedAt: ref.created_at,
    }
    recruiterSlackLink = ref.slack_channel_id ? getSlackChannelLink(ref.slack_channel_id) : null
  }

  // Get direct recruits (people I referred)
  const { data: myReferrals } = await supabase
    .from('glow_girl_referrals')
    .select('referred:glow_girls!glow_girl_referrals_referred_id_fkey(id, brand_name, created_at)')
    .eq('referrer_id', glowGirlId)
    .order('created_at', { ascending: false })

  const directRecruits: PodMember[] = (myReferrals || []).map((r) => {
    const ref = r.referred as unknown as { id: string; brand_name: string | null; created_at: string }
    return {
      id: ref.id,
      brandName: ref.brand_name || 'Unknown',
      joinedAt: ref.created_at,
    }
  })

  return { recruiter, recruiterSlackLink, directRecruits, mySlackLink }
}

export async function getTeamNetwork(glowGirlId: string, period?: string): Promise<TeamData> {
  const supabase = await createClient()
  const currentPeriod = period || new Date().toISOString().slice(0, 7)

  // Get upline (who's above me) using recursive CTE
  const { data: uplineRows } = await supabase.rpc('get_upline', {
    p_glow_girl_id: glowGirlId,
    p_max_levels: 7,
  })

  let upline: TeamMember[] = []
  if (uplineRows && uplineRows.length > 0) {
    const uplineIds = uplineRows.map((r: { glow_girl_id: string }) => r.glow_girl_id)
    const { data: uplineGirls } = await supabase
      .from('glow_girls')
      .select('id, brand_name, created_at')
      .in('id', uplineIds)

    if (uplineGirls) {
      upline = uplineRows.map((r: { level: number; glow_girl_id: string }) => {
        const girl = uplineGirls.find(g => g.id === r.glow_girl_id)
        return {
          id: r.glow_girl_id,
          brandName: girl?.brand_name || 'Unknown',
          level: r.level,
          salesThisMonth: 0,
          joinedAt: girl?.created_at || '',
        }
      })
    }
  }

  // Get downline (who I recruited, and who they recruited, recursively up to 7 levels)
  const { data: downlineRows } = await supabase.rpc('get_downline', {
    p_glow_girl_id: glowGirlId,
    p_max_levels: 7,
  }).catch(() => ({ data: null }))

  let downline: TeamMember[] = []

  if (downlineRows && downlineRows.length > 0) {
    const downlineIds = downlineRows.map((r: { glow_girl_id: string }) => r.glow_girl_id)

    const { data: downlineGirls } = await supabase
      .from('glow_girls')
      .select('id, brand_name, created_at')
      .in('id', downlineIds)

    // Get sales for the selected period for each downline member
    const nextMonth = new Date(currentPeriod + '-01')
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextPeriod = nextMonth.toISOString().slice(0, 7)

    const { data: downlineSales } = await supabase
      .from('orders')
      .select('glow_girl_id, amount_cents')
      .in('glow_girl_id', downlineIds)
      .eq('status', 'paid')
      .gte('created_at', `${currentPeriod}-01`)
      .lt('created_at', `${nextPeriod}-01`)

    const salesByGirl: Record<string, number> = {}
    for (const sale of downlineSales || []) {
      salesByGirl[sale.glow_girl_id] = (salesByGirl[sale.glow_girl_id] || 0) + sale.amount_cents
    }

    if (downlineGirls) {
      downline = downlineRows.map((r: { level: number; glow_girl_id: string }) => {
        const girl = downlineGirls.find(g => g.id === r.glow_girl_id)
        return {
          id: r.glow_girl_id,
          brandName: girl?.brand_name || 'Unknown',
          level: r.level,
          salesThisMonth: salesByGirl[r.glow_girl_id] || 0,
          joinedAt: girl?.created_at || '',
        }
      })
    }
  }

  // Get personal sales for the selected period
  const periodEnd = new Date(currentPeriod + '-01')
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  const periodEndStr = periodEnd.toISOString().slice(0, 7)

  const { data: personalOrders } = await supabase
    .from('orders')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)
    .eq('status', 'paid')
    .gte('created_at', `${currentPeriod}-01`)
    .lt('created_at', `${periodEndStr}-01`)

  const personalSales = (personalOrders || []).reduce((s, o) => s + o.amount_cents, 0)

  return { upline, downline, personalSales }
}
