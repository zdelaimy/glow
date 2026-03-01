import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { FulfillmentStatus } from '@/types/database'

/**
 * Webhook endpoint for 3PL tracking updates.
 * Accepts tracking updates and updates order fulfillment_status.
 *
 * Expected payload:
 * {
 *   orderId: string,
 *   status: FulfillmentStatus,
 *   trackingNumber?: string,
 *   trackingCarrier?: string,
 *   trackingUrl?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, status, trackingNumber, trackingCarrier, trackingUrl } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    const validStatuses: FulfillmentStatus[] = ['UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const updateData: Record<string, unknown> = {
      fulfillment_status: status,
    }

    if (trackingNumber) updateData.tracking_number = trackingNumber
    if (trackingCarrier) updateData.tracking_carrier = trackingCarrier
    if (trackingUrl) updateData.tracking_url = trackingUrl

    if (status === 'SHIPPED') {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === 'DELIVERED') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error('Fulfillment webhook error:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Fulfillment webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
