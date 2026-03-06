'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { ReferralBanner } from '@/components/referral-banner'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const refCode = searchParams.get('ref')

  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Role-based redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Store referral code if present
      if (refCode) {
        await supabase.auth.updateUser({
          data: { referred_by_code: refCode },
        })
      }

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
            router.push('/glow-girl/dashboard')
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
              Welcome back
            </h2>
            <p className="text-[#6E6A62]/50 text-[0.95rem] mt-2">
              Sign in to your Glow account.
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

          <motion.form
            onSubmit={handleSignIn}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <button
              type="button"
              onClick={async () => {
                const origin = window.location.origin
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${origin}/auth/callback` },
                })
              }}
              className="w-full h-12 rounded-full border border-neutral-200 bg-white text-[#6E6A62] text-[0.95rem] font-medium flex items-center justify-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.43l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#6E6A62]/10" />
              <span className="text-xs text-[#6E6A62]/50 font-inter">or</span>
              <div className="flex-1 h-px bg-[#6E6A62]/10" />
            </div>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#6E6A62]/50 hover:text-[#6E6A62] underline underline-offset-2 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </span>
            </motion.button>

            <p className="text-sm text-center text-[#6E6A62]/50 pt-1">
              Don&apos;t have an account?{' '}
              <Link href="/apply" className="text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors font-medium">
                Apply to be a Glow Girl
              </Link>
            </p>
          </motion.form>

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
