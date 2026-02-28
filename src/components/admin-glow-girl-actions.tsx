'use client'

import { useState } from 'react'
import { approveGlowGirl } from '@/lib/actions/glow-girl'

export function AdminGlowGirlActions({ glowGirlId, approved }: { glowGirlId: string; approved: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await approveGlowGirl(glowGirlId, !approved)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        approved
          ? 'border border-[#6E6A62]/30 text-[#6E6A62] hover:bg-[#f5f0eb]'
          : 'bg-[#6E6A62] text-white hover:bg-[#5a5750]'
      }`}
    >
      {loading ? '...' : approved ? 'Revoke' : 'Approve'}
    </button>
  )
}
