'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6E6A62] leading-relaxed">
        Join us on the road to an effortless glow.
      </p>
      <p className="text-xs text-[#6E6A62]/60 leading-relaxed">
        Get tips, tricks and exclusive content from Glow and stay up to date.
      </p>

      {status === 'success' ? (
        <div className="border border-[#6E6A62]/30 px-4 py-3 animate-in fade-in duration-300">
          <p className="text-xs text-[#6E6A62] font-medium">
            You&apos;re in! Thanks for subscribing.
          </p>
          <p className="text-[10px] text-[#6E6A62]/50 mt-1">
            We&apos;ll keep you updated with the latest from Glow.
          </p>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex border border-[#6E6A62]/30 rounded-none overflow-hidden"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="Email Address"
              required
              className="flex-1 px-3 py-2.5 text-xs bg-transparent text-[#6E6A62] placeholder:text-[#6E6A62]/40 outline-none font-inter"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-medium text-[#6E6A62] border-l border-[#6E6A62]/30 hover:bg-[#6E6A62] hover:text-white transition-colors cursor-pointer font-inter disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Subscribe'}
            </button>
          </form>

          {status === 'error' && (
            <p className="text-[10px] text-red-500">{errorMsg}</p>
          )}
        </>
      )}

      <p className="text-[10px] text-[#6E6A62]/40">
        By signing up, you agree to our{' '}
        <Link href="/privacy" className="underline hover:text-[#6E6A62]/60">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
