'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb] px-6">
      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="block mb-10 group">
          <span className="font-inter text-[2rem] tracking-tight text-[#6E6A62] font-medium group-hover:text-[#5E5A52] transition-colors leading-none">
            GLOW
          </span>
        </Link>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight">
              Check your email
            </h2>
            <p className="text-[#6E6A62]/60 text-sm leading-relaxed">
              We sent a password reset link to <span className="text-[#6E6A62] font-medium">{email}</span>. Click the link in the email to reset your password.
            </p>
            <p className="text-[#6E6A62]/40 text-xs">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                className="text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors"
              >
                try again
              </button>
              .
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="text-sm text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors font-medium"
              >
                Back to sign in
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight">
                Reset your password
              </h2>
              <p className="text-[#6E6A62]/50 text-[0.95rem] mt-2">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={loading || !email}
                className="w-full h-12 rounded-full text-[0.95rem] font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>

              <p className="text-sm text-center text-[#6E6A62]/50 pt-1">
                Remember your password?{' '}
                <Link href="/login" className="text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
