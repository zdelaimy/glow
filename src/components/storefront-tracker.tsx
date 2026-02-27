'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/actions/events'

export function StorefrontTracker({ creatorId }: { creatorId: string }) {
  useEffect(() => {
    trackEvent('storefront_view', creatorId)
  }, [creatorId])
  return null
}
