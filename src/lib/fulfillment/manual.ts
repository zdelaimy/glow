import type { FulfillmentProvider, FulfillmentOrder, FulfillmentResult, FulfillmentStatusUpdate } from './types'

/**
 * Manual fulfillment provider — no-op default until a real 3PL
 * (ShipBob, ShipStation, etc.) is connected.
 *
 * All fulfillment is managed via the admin dashboard.
 */
export class ManualFulfillmentProvider implements FulfillmentProvider {
  name = 'manual'

  async submitOrder(order: FulfillmentOrder): Promise<FulfillmentResult> {
    // No-op: admin manually fulfills orders
    console.log(`[Manual Fulfillment] Order ${order.orderId} received — fulfill via admin dashboard`)
    return {
      success: true,
      externalId: `manual-${order.orderId}`,
    }
  }

  async getOrderStatus(_externalId: string): Promise<FulfillmentStatusUpdate | null> {
    // Manual provider doesn't track status externally
    return null
  }

  async cancelOrder(_externalId: string): Promise<{ success: boolean }> {
    // No-op: admin handles cancellation manually
    return { success: true }
  }
}

export const fulfillmentProvider = new ManualFulfillmentProvider()
