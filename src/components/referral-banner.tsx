'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ReferralBanner({ refCode }: { refCode: string }) {
  const [glowGirlName, setGlowGirlName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGlowGirl() {
      const supabase = createClient()
      const { data } = await supabase
        .from('glow_girls')
        .select('brand_name')
        .eq('referral_code', refCode)
        .single()
      if (data?.brand_name) setGlowGirlName(data.brand_name)
    }
    if (refCode) fetchGlowGirl()
  }, [refCode])

  if (!glowGirlName) return null

  return (
    <div className="bg-gradient-to-r from-violet-100 to-rose-100 border border-violet-200 rounded-xl p-3 mb-4 text-center text-sm">
      <span className="text-violet-700">
        Referred by <strong>{glowGirlName}</strong>
      </span>
    </div>
  )
}
