'use client'

import { useState } from 'react'
import { Copy, Check, Link2 } from 'lucide-react'

export function ConnectLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const connectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://joinglowlabs.com'}/${slug}/connect`

  function handleCopy() {
    navigator.clipboard.writeText(connectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-4 h-4 text-[#6E6A62]/50" />
        <h2 className="text-xl font-light text-[#6E6A62]">Your Connect Form</h2>
      </div>
      <p className="text-sm text-[#6E6A62]/50 mb-4">
        Share this link in your bio. Interested people can reach out and schedule a call with you.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={connectUrl}
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
