'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const REASONS = [
  { value: 'too_expensive', label: 'Too expensive for me right now' },
  { value: 'not_enough_sales', label: "I'm not making enough sales" },
  { value: 'time_commitment', label: "I don't have enough time" },
  { value: 'switching_companies', label: 'Switching to another company' },
  { value: 'other', label: 'Other' },
] as const

type Step = 'survey' | 'sponsor' | 'confirm' | 'cooling' | 'done'

export default function CancelPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('survey')
  const [reason, setReason] = useState('')
  const [reasonDetail, setReasonDetail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sponsor, setSponsor] = useState<{ name: string; email: string } | null>(null)
  const [coolingEndsAt, setCoolingEndsAt] = useState<string | null>(null)
  const [, setExistingRequest] = useState<{
    status: string
    cooling_off_ends_at: string
    reason: string
  } | null>(null)

  // Check for existing cancellation request on load
  useEffect(() => {
    async function check() {
      const res = await fetch('/api/cancellation-status')
      if (res.ok) {
        const data = await res.json()
        if (data.request) {
          setExistingRequest(data.request)
          setCoolingEndsAt(data.request.cooling_off_ends_at)
          if (data.request.status === 'pending') {
            setStep('cooling')
          } else if (data.request.status === 'cancelled') {
            setStep('done')
          }
        }
        if (data.sponsor) {
          setSponsor(data.sponsor)
        }
      }
    }
    check()
  }, [])

  const submitRequest = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/request-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, reasonDetail }),
      })
      const data = await res.json()
      if (data.success) {
        setCoolingEndsAt(data.coolingOffEndsAt)
        setStep('cooling')
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const confirmCancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/square/cancel-subscription', {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setStep('done')
      } else {
        setError(data.error || 'Failed to cancel. Please contact support.')
      }
    } catch {
      setError('Something went wrong. Please contact support.')
    }
    setLoading(false)
  }

  const coolingDaysLeft = coolingEndsAt
    ? Math.max(0, Math.ceil((new Date(coolingEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const coolingPassed = coolingEndsAt ? new Date(coolingEndsAt) <= new Date() : false

  return (
    <div className="min-h-screen bg-[#f5f0eb] font-inter flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link href="/glow-girl/dashboard" className="text-sm text-[#6E6A62]/50 hover:text-[#6E6A62] transition-colors mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-neutral-200/60">
            <h1 className="text-xl font-light text-[#6E6A62]">Cancel Subscription</h1>
            <p className="text-sm text-[#6E6A62]/50 mt-1">
              {step === 'survey' && "We're sorry to see you thinking about leaving."}
              {step === 'sponsor' && 'Have you talked to your sponsor?'}
              {step === 'confirm' && 'Are you sure you want to cancel?'}
              {step === 'cooling' && 'Your cancellation request has been submitted.'}
              {step === 'done' && 'Your subscription has been cancelled.'}
            </p>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Survey */}
              {step === 'survey' && (
                <motion.div
                  key="survey"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-sm font-medium text-[#6E6A62] mb-3">
                      What&apos;s your main reason for cancelling?
                    </p>
                    <div className="space-y-2">
                      {REASONS.map((r) => (
                        <label
                          key={r.value}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            reason === r.value
                              ? 'border-[#6E6A62] bg-[#f5f0eb]/40'
                              : 'border-[#6E6A62]/10 hover:border-[#6E6A62]/25'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={r.value}
                            checked={reason === r.value}
                            onChange={() => setReason(r.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            reason === r.value ? 'border-[#6E6A62]' : 'border-[#6E6A62]/20'
                          }`}>
                            {reason === r.value && <div className="w-2 h-2 rounded-full bg-[#6E6A62]" />}
                          </div>
                          <span className="text-sm text-[#6E6A62]">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {reason && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <p className="text-sm font-medium text-[#6E6A62] mb-2">
                        Anything else you&apos;d like us to know? <span className="text-[#6E6A62]/40 font-normal">(optional)</span>
                      </p>
                      <textarea
                        value={reasonDetail}
                        onChange={(e) => setReasonDetail(e.target.value)}
                        placeholder="Tell us more..."
                        rows={3}
                        className="w-full bg-[#f5f0eb]/50 border border-[#6E6A62]/15 rounded-xl px-4 py-3 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40 resize-none"
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/glow-girl/dashboard"
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-[#6E6A62] border border-[#6E6A62]/20 hover:bg-[#f5f0eb] transition-colors flex items-center justify-center"
                    >
                      Never mind
                    </Link>
                    <button
                      disabled={!reason}
                      onClick={() => setStep('sponsor')}
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Talk to sponsor */}
              {step === 'sponsor' && (
                <motion.div
                  key="sponsor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-[#f5f0eb]/60 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#6E6A62]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                      <h3 className="text-sm font-medium text-[#6E6A62]">Before you go — talk to your sponsor</h3>
                    </div>
                    <p className="text-sm text-[#6E6A62]/70">
                      Your sponsor may be able to help with the challenges you&apos;re facing. Many Glow Girls find that a quick chat can make a big difference.
                    </p>
                    {sponsor ? (
                      <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#6E6A62]">{sponsor.name}</p>
                          <p className="text-xs text-[#6E6A62]/50">Your sponsor</p>
                        </div>
                        <a
                          href={`mailto:${sponsor.email}?subject=Thinking%20about%20my%20Glow%20subscription&body=Hi%20${encodeURIComponent(sponsor.name)}%2C%0A%0AI%27m%20thinking%20about%20cancelling%20my%20Glow%20subscription.%20Would%20love%20to%20chat%20about%20it%20first.`}
                          className="h-9 px-4 rounded-lg text-xs font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors flex items-center"
                        >
                          Email Sponsor
                        </a>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-[#6E6A62]/50">
                          Reach out to the Glow Girl who invited you, or email{' '}
                          <a href="mailto:support@glowbeauty.com" className="underline text-[#6E6A62]">support@glowbeauty.com</a>
                        </p>
                      </div>
                    )}
                  </div>

                  {(reason === 'too_expensive' || reason === 'not_enough_sales') && (
                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4">
                      <p className="text-sm text-amber-800">
                        {reason === 'too_expensive'
                          ? "Did you know? You can downgrade to the Pro plan instead of cancelling entirely. Talk to your sponsor about finding the right fit."
                          : "Many Glow Girls see a breakthrough in their first 90 days. Your sponsor can help you refine your strategy and reach more customers."}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep('survey')}
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-[#6E6A62] border border-[#6E6A62]/20 hover:bg-[#f5f0eb] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-[#6E6A62]/60 border border-[#6E6A62]/10 hover:border-[#6E6A62]/20 transition-colors"
                    >
                      I still want to cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Final confirm */}
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <p className="text-sm text-[#6E6A62]/70">
                      If you cancel, here&apos;s what happens:
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        'Your storefront will be deactivated',
                        'You will stop earning commissions on new sales',
                        'Your team overrides will be paused',
                        'Your referral links will stop working',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-[#6E6A62]">
                          <svg className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#f5f0eb]/60 rounded-xl p-4">
                    <p className="text-sm text-[#6E6A62]/70">
                      After you submit, there&apos;s a <strong className="text-[#6E6A62]">7-day cooling-off period</strong> before your subscription is actually cancelled. You can change your mind at any time during this period.
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-rose-500 flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/glow-girl/dashboard"
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors flex items-center justify-center"
                    >
                      Keep my subscription
                    </Link>
                    <button
                      onClick={submitRequest}
                      disabled={loading}
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          Submitting...
                        </>
                      ) : (
                        'Submit cancellation'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Cooling-off period */}
              {step === 'cooling' && (
                <motion.div
                  key="cooling"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3 py-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-light text-[#6E6A62]">Cooling-off period</h3>
                    <p className="text-sm text-[#6E6A62]/60">
                      {coolingPassed
                        ? 'Your cooling-off period has ended. You can now finalize your cancellation.'
                        : `You have ${coolingDaysLeft} day${coolingDaysLeft !== 1 ? 's' : ''} to change your mind. Your subscription is still active during this time.`}
                    </p>
                    {coolingEndsAt && (
                      <p className="text-xs text-[#6E6A62]/40">
                        Cancellation available after {new Date(coolingEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm text-rose-500 text-center">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        setLoading(true)
                        try {
                          const res = await fetch('/api/request-cancellation', {
                            method: 'DELETE',
                          })
                          const data = await res.json()
                          if (data.success) {
                            router.push('/glow-girl/dashboard')
                          }
                        } catch {
                          setError('Failed to withdraw request.')
                        }
                        setLoading(false)
                      }}
                      disabled={loading}
                      className="flex-1 h-11 rounded-xl text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] disabled:opacity-50 transition-colors"
                    >
                      I changed my mind
                    </button>
                    {coolingPassed && (
                      <button
                        onClick={confirmCancel}
                        disabled={loading}
                        className="flex-1 h-11 rounded-xl text-sm font-medium text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                            Cancelling...
                          </>
                        ) : (
                          'Finalize cancellation'
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Done */}
              {step === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4 py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#f5f0eb] flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-[#6E6A62]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-light text-[#6E6A62]">Subscription cancelled</h3>
                  <p className="text-sm text-[#6E6A62]/60">
                    Your subscription has been cancelled. You&apos;ll retain access until the end of your current billing period. We hope to see you back someday.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-4 h-11 px-6 rounded-xl text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors leading-[2.75rem]"
                  >
                    Go home
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
