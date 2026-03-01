'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { FulfillmentStatus, ReturnStatus } from '@/types/database'

export async function updateFulfillmentStatus(
  orderId: string,
  status: FulfillmentStatus,
  tracking?: { number: string; carrier?: string; url?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Not authorized')

  const updateData: Record<string, unknown> = {
    fulfillment_status: status,
  }

  if (tracking) {
    updateData.tracking_number = tracking.number
    if (tracking.carrier) updateData.tracking_carrier = tracking.carrier
    if (tracking.url) updateData.tracking_url = tracking.url
  }

  if (status === 'SHIPPED') {
    updateData.shipped_at = new Date().toISOString()
  } else if (status === 'DELIVERED') {
    updateData.delivered_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function processReturnRequest(
  returnRequestId: string,
  status: Extract<ReturnStatus, 'APPROVED' | 'DENIED'>,
  adminNotes?: string,
  refundAmountCents?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Not authorized')

  const updateData: Record<string, unknown> = {
    status,
    admin_notes: adminNotes || null,
    updated_at: new Date().toISOString(),
  }

  if (status === 'APPROVED' && refundAmountCents !== undefined) {
    updateData.refund_amount_cents = refundAmountCents
  }

  const { error } = await supabase
    .from('return_requests')
    .update(updateData)
    .eq('id', returnRequestId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
