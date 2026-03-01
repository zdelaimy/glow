'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function AffiliateLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const affiliateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://glowlabs.nyc'}/shop?ref=${slug}`

  function handleCopy() {
    navigator.clipboard.writeText(affiliateUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <h2 className="text-xl font-light text-[#6E6A62] mb-1">Your Affiliate Link</h2>
      <p className="text-sm text-[#6E6A62]/50 mb-4">
        Share this link with your audience. Any purchase made through it earns you commission.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={affiliateUrl}
          readOnly
          className="flex-1 rounded-full border border-[#6E6A62]/20 bg-[#f5f0eb]/50 px-4 py-2.5 text-sm font-mono text-[#6E6A62] focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-[#6E6A62] text-white hover:bg-[#5a5650]'
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Copy className="w-4 h-4" /> Copy Link
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
