'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <Button
      variant={approved ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : approved ? 'Revoke' : 'Approve'}
    </Button>
  )
}
