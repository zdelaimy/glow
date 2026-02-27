'use server'

import { createClient } from '@/lib/supabase/server'
import type { EventType } from '@/types/database'

export async function trackEvent(
  eventType: EventType,
  creatorId: string | null,
  signatureId?: string | null,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('events').insert({
    event_type: eventType,
    creator_id: creatorId,
    signature_id: signatureId || null,
    user_id: user?.id || null,
    metadata: metadata || {},
  })
}
