import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId, email, reason, reasonDetail } = await request.json()

    if (!orderId || !email || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validReasons = ['DAMAGED', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER']
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Find order and verify email matches
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_email, created_at, amount_cents')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.customer_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match order' }, { status: 403 })
    }

    // Check 30-day window
    const orderDate = new Date(order.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (orderDate < thirtyDaysAgo) {
      return NextResponse.json({ error: 'Return window has expired (30 days)' }, { status: 400 })
    }

    // Check for existing return request
    const { data: existingReturn } = await supabase
      .from('return_requests')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existingReturn) {
      return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 })
    }

    // Create return request
    const { data: returnRequest, error } = await supabase
      .from('return_requests')
      .insert({
        order_id: orderId,
        customer_email: email,
        reason,
        reason_detail: reasonDetail || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Return request error:', error)
      return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 })
    }

    return NextResponse.json({ returnRequest })
  } catch (err) {
    console.error('Returns API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
