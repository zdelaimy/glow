'use server'

import { createClient } from '@/lib/supabase/server'
import type { PayoutMethod } from '@/types/database'

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

export async function submitPayoutMethod(
  glowGirlId: string,
  data:
    | { method: 'paypal'; handle: string }
    | { method: 'venmo'; handle: string }
    | { method: 'zelle'; handle: string }
    | { method: 'direct_deposit'; accountHolderName: string; routingNumber: string; accountNumber: string; accountType: 'checking' | 'savings' }
) {
  if (data.method === 'direct_deposit') {
    if (!/^\d{9}$/.test(data.routingNumber)) {
      return { error: 'Please enter a valid 9-digit routing number.' }
    }
    if (data.accountNumber.length < 4 || data.accountNumber.length > 17) {
      return { error: 'Please enter a valid account number.' }
    }
    if (!data.accountHolderName.trim()) {
      return { error: 'Please enter the account holder name.' }
    }
  } else {
    if (!data.handle.trim()) {
      return { error: `Please enter your ${data.method === 'paypal' ? 'PayPal email' : data.method === 'venmo' ? 'Venmo username' : 'Zelle email or phone'}.` }
    }
  }

  const supabase = await createClient()

  const row: Record<string, unknown> = {
    glow_girl_id: glowGirlId,
    method: data.method,
    handle: null,
    account_holder_name: null,
    routing_number: null,
    account_number_last4: null,
    account_type: null,
    updated_at: new Date().toISOString(),
  }

  if (data.method === 'direct_deposit') {
    row.account_holder_name = data.accountHolderName.trim()
    row.routing_number = data.routingNumber
    row.account_number_last4 = data.accountNumber.slice(-4)
    row.account_type = data.accountType
  } else {
    row.handle = data.handle.trim()
  }

  const { error } = await supabase
    .from('glow_girl_payout_methods')
    .upsert(row, { onConflict: 'glow_girl_id' })

  if (error) {
    console.error('Failed to save payout method:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}

export async function getPayoutData(glowGirlId: string) {
  const supabase = await createClient()

  // Check if SSN is on file
  const { data: gg } = await supabase
    .from('glow_girls')
    .select('tax_id_last4, tax_id_submitted_at')
    .eq('id', glowGirlId)
    .single()

  // Check payout method
  const { data: payoutMethod } = await supabase
    .from('glow_girl_payout_methods')
    .select('*')
    .eq('glow_girl_id', glowGirlId)
    .single()

  // Current month's accrued commissions
  const currentPeriod = new Date().toISOString().slice(0, 7)
  const { data: monthCommissions } = await supabase
    .from('commissions')
    .select('amount_cents, status')
    .eq('glow_girl_id', glowGirlId)
    .eq('period', currentPeriod)
    .neq('status', 'CANCELLED')

  const approvedThisMonth = (monthCommissions || [])
    .filter(c => c.status === 'APPROVED')
    .reduce((s, c) => s + c.amount_cents, 0)

  const pendingThisMonth = (monthCommissions || [])
    .filter(c => c.status === 'PENDING')
    .reduce((s, c) => s + c.amount_cents, 0)

  // Past payouts
  const { data: payoutHistory } = await supabase
    .from('payouts')
    .select('*')
    .eq('glow_girl_id', glowGirlId)
    .order('period', { ascending: false })
    .limit(12)

  // Next payout date: 1st of next month
  const now = new Date()
  const nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    hasTaxId: !!gg?.tax_id_last4,
    taxIdLast4: gg?.tax_id_last4 || null,
    payoutMethod: payoutMethod as {
      method: PayoutMethod
      handle: string | null
      account_holder_name: string | null
      account_number_last4: string | null
      account_type: string | null
    } | null,
    estimatedPayoutCents: approvedThisMonth + pendingThisMonth,
    approvedCents: approvedThisMonth,
    pendingCents: pendingThisMonth,
    nextPayoutDate: nextPayoutDate.toISOString(),
    payoutHistory: payoutHistory || [],
  }
}
