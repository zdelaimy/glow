'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'

export function ReferralShare({ referralCode }: { referralCode: string | null }) {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  if (!referralCode) return null

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://glowlabs.nyc'}/glow-girls?ref=${referralCode}`

  function copyToClipboard(text: string, type: 'link' | 'code') {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60">
      <div className="px-6 py-4 border-b border-neutral-200/60">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Your Referral Link</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-[#6E6A62]/60">Share this link</label>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <button
              onClick={() => copyToClipboard(referralLink, 'link')}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[#6E6A62]/30 text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
            >
              {copied === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#6E6A62]/60">Your code</label>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono text-sm tracking-widest" />
            <button
              onClick={() => copyToClipboard(referralCode, 'code')}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[#6E6A62]/30 text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
            >
              {copied === 'code' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
