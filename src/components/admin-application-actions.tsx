'use client'

import { useState } from 'react'
import { reviewApplication } from '@/lib/actions/glow-girl'

export function AdminApplicationActions({ applicationId, status }: { applicationId: string; status: string }) {
  const [loading, setLoading] = useState(false)

  if (status !== 'PENDING') {
    return (
      <span className={`text-xs font-medium ${status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-400'}`}>
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
      <button
        onClick={() => handleAction('APPROVED')}
        disabled={loading}
        className="rounded-full bg-[#6E6A62] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#5a5750] disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : 'Approve'}
      </button>
      <button
        onClick={() => handleAction('REJECTED')}
        disabled={loading}
        className="rounded-full border border-[#6E6A62]/30 px-4 py-1.5 text-xs font-medium text-[#6E6A62] hover:bg-[#f5f0eb] disabled:opacity-50 transition-colors"
      >
        Reject
      </button>
    </div>
  )
}
