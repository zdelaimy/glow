'use client'

import { useState } from 'react'
import type { LeadInterest } from '@/types/database'

interface ConnectFormProps {
  glowGirlId: string
  brandName: string | null
}

const INTEREST_OPTIONS: { value: LeadInterest; label: string; description: string }[] = [
  {
    value: 'become_glow_girl',
    label: 'Become a Glow Girl',
    description: 'Join the team & start earning',
  },
  {
    value: 'products',
    label: 'Shop Products',
    description: 'Learn about our premium line',
  },
  {
    value: 'general',
    label: 'Just Curious',
    description: 'I want to learn more first',
  },
]

const INCOME_GOALS: { value: string; label: string; hours: string }[] = [
  { value: '$500-$1k/mo', label: '$500 – $1K / month', hours: '~5–10 hrs/week' },
  { value: '$1k-$2k/mo', label: '$1K – $2K / month', hours: '~10–15 hrs/week' },
  { value: '$2k-$5k/mo', label: '$2K – $5K / month', hours: '~15–25 hrs/week' },
  { value: '$5k+/mo', label: '$5K+ / month', hours: '~25+ hrs/week' },
]

const inputClass = 'w-full px-4 py-3 text-sm bg-transparent border border-[#6E6A62]/20 rounded-xl text-[#4a4740] placeholder:text-[#6E6A62]/35 outline-none focus:border-[#6E6A62]/50 transition-colors'
const labelClass = 'text-[11px] uppercase tracking-[0.12em] text-[#4a4740]/70 font-medium block mb-1.5'

export function ConnectForm({ glowGirlId, brandName }: ConnectFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interest, setInterest] = useState<LeadInterest>('become_glow_girl')
  const [incomeGoal, setIncomeGoal] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          glow_girl_id: glowGirlId,
          full_name: formData.get('full_name'),
          email: formData.get('email'),
          phone: formData.get('phone') || null,
          instagram_handle: formData.get('instagram_handle') || null,
          location: formData.get('location') || null,
          income_goal: incomeGoal || null,
          message: formData.get('message') || null,
          interest,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#3d3a35] mb-2">You&apos;re all set!</h3>
        <p className="text-sm text-[#4a4740]/70 leading-relaxed max-w-xs mx-auto">
          {brandName || 'Your Glow Girl'} will be in touch soon.
          {' '}Looking forward to connecting with you!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Interest selector */}
      <div className="space-y-2">
        <label className={labelClass}>
          I&apos;m interested in
        </label>
        <div className="grid gap-2">
          {INTEREST_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setInterest(option.value)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                interest === option.value
                  ? 'border-[#6E6A62] bg-[#6E6A62]/5'
                  : 'border-[#6E6A62]/15 hover:border-[#6E6A62]/30'
              }`}
            >
              <span className={`text-sm font-medium block ${
                interest === option.value ? 'text-[#3d3a35]' : 'text-[#4a4740]/80'
              }`}>
                {option.label}
              </span>
              <span className="text-[11px] text-[#6E6A62]/50">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="full_name" className={labelClass}>Full name</label>
        <input id="full_name" name="full_name" type="text" required placeholder="Jane Doe" className={inputClass} />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required placeholder="jane@example.com" className={inputClass} />
      </div>

      {/* Phone + Instagram — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagram_handle" className={labelClass}>Instagram</label>
          <input id="instagram_handle" name="instagram_handle" type="text" placeholder="@yourhandle" className={inputClass} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className={labelClass}>Where are you based?</label>
        <input id="location" name="location" type="text" placeholder="City, State" className={inputClass} />
      </div>

      {/* Income Goal — only show for become_glow_girl interest */}
      {interest === 'become_glow_girl' && (
        <div className="space-y-2">
          <label className={labelClass}>Monthly income goal</label>
          <div className="grid grid-cols-2 gap-2">
            {INCOME_GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setIncomeGoal(goal.value)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  incomeGoal === goal.value
                    ? 'border-[#6E6A62] bg-[#6E6A62]/5'
                    : 'border-[#6E6A62]/15 hover:border-[#6E6A62]/30'
                }`}
              >
                <span className={`text-sm font-medium block ${
                  incomeGoal === goal.value ? 'text-[#3d3a35]' : 'text-[#4a4740]/80'
                }`}>
                  {goal.label}
                </span>
                <span className="text-[11px] text-[#6E6A62]/50">{goal.hours}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#6E6A62]/45 leading-relaxed">
            Higher goals require more time selling and building your network — we&apos;ll help you create a plan that fits your schedule.
          </p>
        </div>
      )}

      {/* Message — contextual placeholder based on interest */}
      <div>
        <label htmlFor="message" className={labelClass}>
          {interest === 'become_glow_girl' ? 'Why are you interested in Glow?' : 'Message'}
          {' '}<span className="normal-case tracking-normal font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder={
            interest === 'become_glow_girl'
              ? 'Tell me what excites you about the opportunity...'
              : interest === 'products'
              ? 'Any products or skin concerns you want to know about?'
              : 'Tell me a bit about yourself...'
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-rose-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full py-3.5 text-sm uppercase tracking-[0.15em] font-medium text-white bg-[#4a4740] hover:bg-[#3d3a35] disabled:opacity-50 transition-colors rounded-xl cursor-pointer"
      >
        {sending ? 'Sending...' : "Let's Connect"}
      </button>
    </form>
  )
}
