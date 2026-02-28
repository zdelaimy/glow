'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { ReferralBanner } from '@/components/referral-banner'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const refCode = searchParams.get('ref')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (refCode) {
      document.cookie = `glow_ref=${refCode};path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`
    }
  }, [refCode])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('code')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    setLoading(false)
  }

  async function handleVerifyCode(code: string) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } else {
      // Store referral code if present
      if (refCode) {
        await supabase.auth.updateUser({
          data: { referred_by_code: refCode },
        })
      }

      // Role-based redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'ADMIN') {
          router.push('/admin')
        } else if (profile?.role === 'GLOW_GIRL') {
          router.push('/glow-girl/dashboard')
        } else {
          // Check if they have a pending application
          const { data: application } = await supabase
            .from('glow_girl_applications')
            .select('status')
            .eq('user_id', user.id)
            .single()

          if (application) {
            if (application.status === 'APPROVED') {
              router.push('/glow-girl/onboarding')
            } else {
              router.push('/apply/status')
            }
          } else {
            router.push('/apply')
          }
        }
      } else {
        router.push('/')
      }
    }
    setLoading(false)
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    const code = newOtp.join('')
    if (code.length === 6) {
      handleVerifyCode(code)
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 0) return

    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || ''
    }
    setOtp(newOtp)

    if (pasted.length === 6) {
      handleVerifyCode(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  async function handleResendCode() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setOtp(['', '', '', '', '', ''])
      setError(null)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f0eb]">
      {/* Left — Brand Panel */}
      <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden items-center justify-center bg-white">
        {/* Subtle decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #6E6A62 0%, transparent 70%)', top: '-15%', right: '-10%' }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #6E6A62 0%, transparent 70%)', bottom: '-10%', left: '-5%' }}
          />
        </div>

        {/* Brand content */}
        <div className="relative z-10 px-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo */}
            <Link href="/" className="block mb-16 group">
              <span className="font-inter text-[2rem] tracking-tight text-[#6E6A62] font-medium group-hover:text-[#5E5A52] transition-colors leading-none">
                GLOW
              </span>
            </Link>

            {/* Headline */}
            <h1 className="text-[#6E6A62] text-[2.75rem] leading-[1.1] font-light tracking-tight mb-6">
              Your beauty business,{' '}
              <span className="italic">
                your way
              </span>
            </h1>

            <p className="text-[#6E6A62]/60 text-base leading-relaxed mb-12 max-w-sm">
              Open your storefront, share products you love, and earn commissions on every sale.
            </p>

            {/* Glow Girl headshots */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  '/hero/headshot1.jpg',
                  '/hero/headshot2.jpg',
                  '/hero/headshot3.jpg',
                ].map((src, i) => (
                  <motion.img
                    key={i}
                    src={src}
                    alt="Glow Girl"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-[#6E6A62]/50 text-sm font-inter">Join 50+ Glow Girls</span>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-14 pt-10 border-t border-neutral-200/60">
              {[
                { stat: '25%', label: 'Commission' },
                { stat: '$0', label: 'To start' },
                { stat: 'Weekly', label: 'Payouts' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="text-2xl text-[#6E6A62] font-light">{item.stat}</div>
                  <div className="text-xs text-[#6E6A62]/50 mt-1 uppercase tracking-[0.15em] font-inter">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-16 relative">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="block mb-10 lg:hidden group">
            <span className="font-inter text-[2rem] tracking-tight text-[#6E6A62] font-medium group-hover:text-[#5E5A52] transition-colors leading-none">
              GLOW
            </span>
          </Link>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight">
              {step === 'code' ? 'Enter your code' : 'Welcome back'}
            </h2>
            <p className="text-[#6E6A62]/50 text-[0.95rem] mt-2">
              {step === 'code'
                ? <>We sent a 6-digit code to <span className="text-[#6E6A62] font-medium">{email}</span></>
                : 'Enter your email to receive a sign-in code.'
              }
            </p>
          </motion.div>

          {refCode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ReferralBanner refCode={refCode} />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 'code' ? (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* 6-digit OTP input */}
                <div className="flex justify-center gap-2.5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      disabled={loading}
                      className="w-12 h-14 text-center text-xl font-medium text-[#6E6A62] bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/20 focus:border-[#6E6A62]/40 transition-all duration-200 disabled:opacity-50"
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-rose-500 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-[#6E6A62]/50 text-sm">
                    <motion.div
                      className="w-4 h-4 border-2 border-[#6E6A62]/20 border-t-[#6E6A62] rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Verifying...
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-sm">
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-[#6E6A62] hover:text-[#5E5A52] transition-colors underline underline-offset-4 decoration-[#6E6A62]/30 hover:decoration-[#6E6A62]/60 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                  <span className="text-[#6E6A62]/20">|</span>
                  <button
                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(null) }}
                    disabled={loading}
                    className="text-[#6E6A62] hover:text-[#5E5A52] transition-colors underline underline-offset-4 decoration-[#6E6A62]/30 hover:decoration-[#6E6A62]/60 disabled:opacity-50"
                  >
                    Use a different email
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSendCode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white border-neutral-200 rounded-xl px-4 text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40 transition-all duration-200"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-rose-500 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-12 rounded-full text-[0.95rem] font-medium text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed group bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors cursor-pointer"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Continue
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>

                <p className="text-xs text-center text-[#6E6A62]/40 pt-1 leading-relaxed">
                  No password needed. We&apos;ll email you a 6-digit code.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Mobile headshots */}
          <motion.div
            className="mt-10 flex items-center justify-center gap-3 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex -space-x-2.5">
              {[
                '/hero/headshot1.jpg',
                '/hero/headshot2.jpg',
                '/hero/headshot3.jpg',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Glow Girl"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#f5f0eb]"
                />
              ))}
            </div>
            <span className="text-[#6E6A62]/50 text-xs font-inter">Join 50+ Glow Girls</span>
          </motion.div>

          {/* Bottom */}
          <motion.div
            className="mt-12 pt-6 border-t border-[#6E6A62]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-[#6E6A62]/40 text-center">
              By continuing, you agree to Glow&apos;s{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-[#6E6A62]/60 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[#6E6A62]/60 transition-colors">Privacy Policy</Link>.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
