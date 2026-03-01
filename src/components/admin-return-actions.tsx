'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { processReturnRequest } from '@/lib/actions/fulfillment'

interface Props {
  returnRequestId: string
  orderAmountCents: number
}

export function AdminReturnActions({ returnRequestId, orderAmountCents }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleAction(status: 'APPROVED' | 'DENIED') {
    setLoading(true)
    try {
      await processReturnRequest(
        returnRequestId,
        status,
        undefined,
        status === 'APPROVED' ? orderAmountCents : undefined
      )
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        onClick={() => handleAction('APPROVED')}
        disabled={loading}
        className="text-xs bg-emerald-600 hover:bg-emerald-700"
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction('DENIED')}
        disabled={loading}
        className="text-xs"
      >
        Deny
      </Button>
    </div>
  )
}
