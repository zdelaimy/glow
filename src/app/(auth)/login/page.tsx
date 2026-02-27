'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { ReferralBanner } from '@/components/referral-banner'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')

  const supabase = createClient()

  useEffect(() => {
    if (refCode) {
      document.cookie = `glow_ref=${refCode};path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`
    }
  }, [refCode])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Brand Panel */}
      <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden items-center justify-center bg-[#0c0a14]">
        {/* Gradient orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', top: '-10%', left: '-10%' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px]"
            style={{ background: 'radial-gradient(circle, #e11d89 0%, transparent 70%)', bottom: '-5%', right: '-5%' }}
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full opacity-20 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #f472b6 0%, transparent 70%)', top: '40%', left: '50%' }}
            animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 px-16 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-16 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-rose-400 flex items-center justify-center">
                <span className="text-white font-bold text-base">G</span>
              </div>
              <span className="text-white/90 text-lg tracking-[0.2em] uppercase font-light group-hover:text-white transition-colors">Glow</span>
            </Link>

            {/* Headline */}
            <h1 className="text-white text-[2.75rem] leading-[1.1] font-light tracking-tight mb-6">
              Your skin,{' '}
              <span className="bg-gradient-to-r from-violet-300 to-rose-300 bg-clip-text text-transparent font-normal">
                reimagined
              </span>
            </h1>

            <p className="text-white/50 text-base leading-relaxed mb-12 max-w-sm">
              Custom serums crafted by the Glow Girls you trust. Personalized formulas, delivered to your door.
            </p>

            {/* Social proof dots */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  'from-violet-400 to-violet-600',
                  'from-rose-400 to-rose-600',
                  'from-fuchsia-400 to-fuchsia-600',
                  'from-pink-400 to-pink-600',
                ].map((gradient, i) => (
                  <motion.div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0c0a14]`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-white/40 text-sm">2,400+ serums created</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0a14] to-transparent" />
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-16 bg-white relative">
        {/* Subtle top-right accent for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04] blur-[80px] bg-violet-500 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none lg:hidden" />

        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-neutral-800 text-base tracking-[0.15em] uppercase font-light group-hover:text-neutral-600 transition-colors">Glow</span>
          </Link>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-[1.7rem] font-light text-neutral-900 tracking-tight leading-tight">
              {sent ? 'Check your inbox' : 'Welcome back'}
            </h2>
            <p className="text-neutral-400 text-[0.95rem] mt-2">
              {sent
                ? 'We sent you a link to sign in.'
                : 'Enter your email to receive a sign-in link.'
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
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Animated envelope */}
                <div className="relative w-20 h-20 mx-auto my-4">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-100 to-rose-50"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.svg
                      className="w-9 h-9 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      initial={{ y: 4, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </motion.svg>
                  </div>
                </div>

                <div className="text-center space-y-1.5">
                  <p className="text-neutral-900 font-medium text-[0.95rem]">{email}</p>
                  <p className="text-neutral-400 text-sm">
                    Click the link in the email to sign in.
                  </p>
                </div>

                <button
                  onClick={() => setSent(false)}
                  className="block mx-auto text-sm text-violet-600 hover:text-violet-700 transition-colors underline underline-offset-4 decoration-violet-200 hover:decoration-violet-400"
                >
                  Use a different email
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-600 tracking-wide">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-neutral-50/80 border-neutral-200 rounded-xl px-4 text-neutral-900 placeholder:text-neutral-300 focus-visible:ring-violet-400/40 focus-visible:border-violet-300 transition-all duration-200"
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
                  className="relative w-full h-12 rounded-xl text-[0.95rem] font-medium text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed group"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                >
                  {/* Button gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-rose-500 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-violet-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Sending link...
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

                <p className="text-xs text-center text-neutral-400 pt-1 leading-relaxed">
                  No password needed. We&apos;ll email you a secure link.
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Bottom */}
          <motion.div
            className="mt-12 pt-6 border-t border-neutral-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-neutral-300 text-center">
              By continuing, you agree to Glow&apos;s Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
