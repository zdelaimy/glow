'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ReferralBanner({ refCode }: { refCode: string }) {
  const [creatorName, setCreatorName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCreator() {
      const supabase = createClient()
      const { data } = await supabase
        .from('creators')
        .select('brand_name')
        .eq('referral_code', refCode)
        .single()
      if (data?.brand_name) setCreatorName(data.brand_name)
    }
    if (refCode) fetchCreator()
  }, [refCode])

  if (!creatorName) return null

  return (
    <div className="bg-gradient-to-r from-violet-100 to-rose-100 border border-violet-200 rounded-xl p-3 mb-4 text-center text-sm">
      <span className="text-violet-700">
        Referred by <strong>{creatorName}</strong>
      </span>
    </div>
  )
}
