'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitTaxId(glowGirlId: string, ssn: string) {
  if (!/^\d{9}$/.test(ssn)) {
    return { error: 'Please enter a valid 9-digit Social Security Number.' }
  }

  const supabase = await createClient()
  const last4 = ssn.slice(-4)

  const { error } = await supabase
    .from('glow_girls')
    .update({
      tax_id_last4: last4,
      tax_id_submitted_at: new Date().toISOString(),
    })
    .eq('id', glowGirlId)

  if (error) {
    console.error('Failed to save tax ID:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true, last4 }
}

export async function requestWithdrawal(glowGirlId: string, amountCents: number) {
  if (amountCents <= 0) {
    return { error: 'Invalid withdrawal amount.' }
  }

  const supabase = await createClient()

  // Verify the glow girl has submitted their SSN
  const { data: gg } = await supabase
    .from('glow_girls')
    .select('tax_id_last4, tax_id_submitted_at')
    .eq('id', glowGirlId)
    .single()

  if (!gg?.tax_id_last4) {
    return { error: 'You must submit your Social Security Number before withdrawing.' }
  }

  // Calculate available balance (approved commissions + bonuses - already paid/pending withdrawals)
  const { data: approvedCommissions } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)
    .eq('status', 'APPROVED')

  const { data: approvedBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)

  const totalEarned = (approvedCommissions || []).reduce((s, c) => s + c.amount_cents, 0) +
    (approvedBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  // Subtract already withdrawn/pending withdrawals
  const { data: existingWithdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)
    .in('status', ['PENDING', 'APPROVED', 'PAID'])

  const totalWithdrawn = (existingWithdrawals || []).reduce((s, w) => s + w.amount_cents, 0)
  const availableBalance = totalEarned - totalWithdrawn

  if (amountCents > availableBalance) {
    return { error: `Insufficient balance. Available: $${(availableBalance / 100).toFixed(2)}` }
  }

  const { error } = await supabase
    .from('withdrawal_requests')
    .insert({
      glow_girl_id: glowGirlId,
      amount_cents: amountCents,
    })

  if (error) {
    console.error('Failed to create withdrawal request:', error)
    return { error: 'Failed to submit withdrawal request.' }
  }

  return { success: true }
}

export async function getWalletData(glowGirlId: string) {
  const supabase = await createClient()

  // Approved commissions (available to withdraw)
  const { data: approvedCommissions } = await supabase
    .from('commissions')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)
    .eq('status', 'APPROVED')

  const { data: approvedBonuses } = await supabase
    .from('bonuses')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirlId)

  const totalEarned = (approvedCommissions || []).reduce((s, c) => s + c.amount_cents, 0) +
    (approvedBonuses || []).reduce((s, b) => s + b.amount_cents, 0)

  // Subtract withdrawals
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount_cents, status')
    .eq('glow_girl_id', glowGirlId)
    .in('status', ['PENDING', 'APPROVED', 'PAID'])

  const totalWithdrawn = (withdrawals || []).reduce((s, w) => s + w.amount_cents, 0)
  const pendingWithdrawals = (withdrawals || [])
    .filter(w => w.status === 'PENDING')
    .reduce((s, w) => s + w.amount_cents, 0)

  const availableBalance = totalEarned - totalWithdrawn

  // Check if SSN is on file
  const { data: gg } = await supabase
    .from('glow_girls')
    .select('tax_id_last4, tax_id_submitted_at')
    .eq('id', glowGirlId)
    .single()

  // Recent withdrawal requests
  const { data: recentWithdrawals } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('glow_girl_id', glowGirlId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    availableBalanceCents: availableBalance,
    pendingWithdrawalCents: pendingWithdrawals,
    totalEarnedCents: totalEarned,
    hasTaxId: !!gg?.tax_id_last4,
    taxIdLast4: gg?.tax_id_last4 || null,
    recentWithdrawals: recentWithdrawals || [],
  }
}
