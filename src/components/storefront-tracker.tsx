'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/actions/events'

export function StorefrontTracker({ glowGirlId }: { glowGirlId: string }) {
  useEffect(() => {
    trackEvent('storefront_view', glowGirlId)
  }, [glowGirlId])
  return null
}
