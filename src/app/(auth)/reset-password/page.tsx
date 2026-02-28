'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setHasSession(true)
      }
      setChecking(false)
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true)
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <motion.div
          className="w-5 h-5 border-2 border-[#6E6A62]/20 border-t-[#6E6A62] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb] px-6">
        <motion.div
          className="w-full max-w-[380px] text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight mb-4">
            Invalid or expired link
          </h2>
          <p className="text-[#6E6A62]/60 text-sm mb-6">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block h-12 px-8 rounded-full bg-[#6E6A62] text-white text-sm font-medium hover:bg-[#5E5A52] transition-colors leading-[3rem]"
          >
            Request New Link
          </Link>
        </motion.div>
      </div>
    )
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

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight">
              Password updated
            </h2>
            <p className="text-[#6E6A62]/60 text-sm">
              Your password has been reset. Redirecting you to sign in...
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[1.7rem] font-light text-[#6E6A62] tracking-tight leading-tight">
                Set a new password
              </h2>
              <p className="text-[#6E6A62]/50 text-[0.95rem] mt-2">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-neutral-200 rounded-xl px-4 text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40 transition-all duration-200"
                />
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-rose-400 mt-1">Must be at least 8 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm" className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.15em] font-inter">
                  Confirm password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-neutral-200 rounded-xl px-4 text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40 transition-all duration-200"
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-rose-400 mt-1">Passwords don&apos;t match</p>
                )}
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
                disabled={loading || !password || !confirmPassword}
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
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
