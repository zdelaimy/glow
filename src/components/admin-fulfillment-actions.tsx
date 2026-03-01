'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateFulfillmentStatus } from '@/lib/actions/fulfillment'
import type { FulfillmentStatus } from '@/types/database'

interface Props {
  orderId: string
  currentStatus: string
}

export function AdminFulfillmentActions({ orderId, currentStatus }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingCarrier, setTrackingCarrier] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')

  async function handleUpdate(status: FulfillmentStatus) {
    setLoading(true)
    try {
      const tracking = trackingNumber
        ? { number: trackingNumber, carrier: trackingCarrier || undefined, url: trackingUrl || undefined }
        : undefined
      await updateFulfillmentStatus(orderId, status, tracking)
      setExpanded(false)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className="text-xs"
      >
        Fulfill
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <Input
        placeholder="Tracking #"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        className="h-8 text-xs"
      />
      <Input
        placeholder="Carrier (USPS, UPS...)"
        value={trackingCarrier}
        onChange={(e) => setTrackingCarrier(e.target.value)}
        className="h-8 text-xs"
      />
      <Input
        placeholder="Tracking URL"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        className="h-8 text-xs"
      />
      <div className="flex gap-1">
        {currentStatus !== 'SHIPPED' && (
          <Button size="sm" onClick={() => handleUpdate('SHIPPED')} disabled={loading} className="text-xs flex-1">
            Ship
          </Button>
        )}
        {currentStatus !== 'DELIVERED' && (
          <Button size="sm" variant="outline" onClick={() => handleUpdate('DELIVERED')} disabled={loading} className="text-xs flex-1">
            Delivered
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setExpanded(false)} className="text-xs">
          Cancel
        </Button>
      </div>
    </div>
  )
}
