import type { FulfillmentStatus } from '@/types/database'

export interface FulfillmentOrder {
  orderId: string
  items: {
    sku: string
    quantity: number
    name: string
  }[]
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  customerEmail: string
}

export interface FulfillmentResult {
  success: boolean
  externalId?: string
  trackingNumber?: string
  trackingCarrier?: string
  trackingUrl?: string
  error?: string
}

export interface FulfillmentStatusUpdate {
  orderId: string
  status: FulfillmentStatus
  trackingNumber?: string
  trackingCarrier?: string
  trackingUrl?: string
}

export interface FulfillmentProvider {
  name: string
  submitOrder(order: FulfillmentOrder): Promise<FulfillmentResult>
  getOrderStatus(externalId: string): Promise<FulfillmentStatusUpdate | null>
  cancelOrder(externalId: string): Promise<{ success: boolean; error?: string }>
}
