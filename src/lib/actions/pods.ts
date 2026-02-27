'use server'

import { requireGlowGirl } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPod(name: string) {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Check if already in a pod
  const { data: existing } = await supabase
    .from('pod_memberships')
    .select('id')
    .eq('glow_girl_id', glowGirl.id)
    .is('left_at', null)
    .single()

  if (existing) throw new Error('You are already in a pod. Leave your current pod first.')

  // Create pod
  const { data: pod, error } = await supabase
    .from('pods')
    .insert({ name, leader_id: glowGirl.id })
    .select()
    .single()

  if (error) throw new Error('Failed to create pod')

  // Add leader as member
  await supabase.from('pod_memberships').insert({
    pod_id: pod.id,
    glow_girl_id: glowGirl.id,
    role: 'LEADER',
  })

  revalidatePath('/glow-girl/dashboard')
  return pod
}

export async function joinPod(podCode: string) {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Check if already in a pod
  const { data: existing } = await supabase
    .from('pod_memberships')
    .select('id')
    .eq('glow_girl_id', glowGirl.id)
    .is('left_at', null)
    .single()

  if (existing) throw new Error('You are already in a pod. Leave your current pod first.')

  // Find pod by code
  const { data: pod } = await supabase
    .from('pods')
    .select('id')
    .eq('pod_code', podCode.toUpperCase())
    .is('disbanded_at', null)
    .single()

  if (!pod) throw new Error('Pod not found. Check your pod code and try again.')

  // Join
  const { error } = await supabase.from('pod_memberships').insert({
    pod_id: pod.id,
    glow_girl_id: glowGirl.id,
    role: 'MEMBER',
  })

  if (error) throw new Error('Failed to join pod')

  revalidatePath('/glow-girl/dashboard')
  return pod
}

export async function leavePod() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('pod_memberships')
    .select('id, role')
    .eq('glow_girl_id', glowGirl.id)
    .is('left_at', null)
    .single()

  if (!membership) throw new Error('You are not in a pod')
  if (membership.role === 'LEADER') throw new Error('Leaders must disband their pod instead of leaving')

  await supabase
    .from('pod_memberships')
    .update({ left_at: new Date().toISOString() })
    .eq('id', membership.id)

  revalidatePath('/glow-girl/dashboard')
}

export async function disbandPod(podId: string) {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Verify ownership
  const { data: pod } = await supabase
    .from('pods')
    .select('id, leader_id')
    .eq('id', podId)
    .single()

  if (!pod || pod.leader_id !== glowGirl.id) throw new Error('Not authorized')

  // Set all memberships as left
  await supabase
    .from('pod_memberships')
    .update({ left_at: new Date().toISOString() })
    .eq('pod_id', podId)
    .is('left_at', null)

  // Disband pod
  await supabase
    .from('pods')
    .update({ disbanded_at: new Date().toISOString() })
    .eq('id', podId)

  revalidatePath('/glow-girl/dashboard')
}

export async function getMyPod() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('pod_memberships')
    .select(`
      id, role, joined_at,
      pod:pods(
        id, name, pod_code, leader_id, created_at,
        leader:glow_girls!pods_leader_id_fkey(brand_name, slug)
      )
    `)
    .eq('glow_girl_id', glowGirl.id)
    .is('left_at', null)
    .single()

  if (!membership) return null

  // Get all active members of this pod
  const podRaw = membership.pod as unknown as { id: string; name: string; pod_code: string; leader_id: string; created_at: string; leader: { brand_name: string; slug: string }[] }
  const pod = { ...podRaw, leader: podRaw.leader[0] }
  const { data: members } = await supabase
    .from('pod_memberships')
    .select(`
      id, role, joined_at,
      glow_girl:glow_girls(id, brand_name, slug)
    `)
    .eq('pod_id', pod.id)
    .is('left_at', null)
    .order('joined_at')

  return {
    membership: { id: membership.id, role: membership.role, joined_at: membership.joined_at },
    pod,
    members: members || [],
    isLeader: membership.role === 'LEADER',
  }
}

export async function getPodStats(podId: string) {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Verify membership
  const { data: membership } = await supabase
    .from('pod_memberships')
    .select('role')
    .eq('pod_id', podId)
    .eq('glow_girl_id', glowGirl.id)
    .is('left_at', null)
    .single()

  if (!membership) throw new Error('Not a member of this pod')

  // Get all member IDs
  const { data: members } = await supabase
    .from('pod_memberships')
    .select('glow_girl_id')
    .eq('pod_id', podId)
    .is('left_at', null)

  const memberIds = (members || []).map(m => m.glow_girl_id)

  // Get total pod sales this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: orders } = await supabase
    .from('orders')
    .select('amount_cents')
    .in('glow_girl_id', memberIds)
    .gte('created_at', monthStart.toISOString())
    .eq('status', 'paid')

  const totalSalesCents = (orders || []).reduce((s, o) => s + o.amount_cents, 0)

  // Get pod override commissions earned by leader
  const { data: overrides } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('commission_type', 'POD_OVERRIDE')
    .gte('created_at', monthStart.toISOString())

  const overrideCents = (overrides || []).reduce((s, c) => s + c.amount_cents, 0)

  return {
    memberCount: memberIds.length,
    totalSalesCents,
    overrideCents,
  }
}
