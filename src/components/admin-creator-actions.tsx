'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { approveCreator } from '@/lib/actions/creator'

export function AdminCreatorActions({ creatorId, approved }: { creatorId: string; approved: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await approveCreator(creatorId, !approved)
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
