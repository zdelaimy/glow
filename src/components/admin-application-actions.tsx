'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { reviewApplication } from '@/lib/actions/glow-girl'

export function AdminApplicationActions({ applicationId, status }: { applicationId: string; status: string }) {
  const [loading, setLoading] = useState(false)

  if (status !== 'PENDING') {
    return (
      <span className={`text-xs font-medium ${status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-500'}`}>
        {status === 'APPROVED' ? 'Approved' : 'Rejected'}
      </span>
    )
  }

  async function handleAction(action: 'APPROVED' | 'REJECTED') {
    setLoading(true)
    try {
      await reviewApplication(applicationId, action)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleAction('APPROVED')}
        disabled={loading}
      >
        {loading ? '...' : 'Approve'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction('REJECTED')}
        disabled={loading}
        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
      >
        Reject
      </Button>
    </div>
  )
}
