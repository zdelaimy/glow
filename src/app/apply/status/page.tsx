'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getMyApplication } from '@/lib/actions/glow-girl'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { GlowGirlApplication } from '@/types/database'

export default function ApplicationStatusPage() {
  const router = useRouter()
  const [application, setApplication] = useState<GlowGirlApplication | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const app = await getMyApplication()
      if (!app) {
        router.push('/apply')
        return
      }

      // If approved, redirect to onboarding
      if (app.status === 'APPROVED') {
        router.push('/glow-girl/onboarding')
        return
      }

      setApplication(app)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
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

  const isPending = application?.status === 'PENDING'
  const isRejected = application?.status === 'REJECTED'

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#6E6A62]/10 bg-white/60 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-inter text-lg tracking-tight text-[#6E6A62] font-medium">
            GLOW
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isPending && (
            <>
              {/* Animated check circle */}
              <motion.div
                className="w-20 h-20 mx-auto mb-8 rounded-full bg-white border-2 border-[#6E6A62]/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <svg className="w-10 h-10 text-[#6E6A62]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>

              <h1 className="text-[1.75rem] font-light text-[#6E6A62] tracking-tight mb-3">
                Application submitted
              </h1>
              <p className="text-[#6E6A62]/60 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Thanks, {application?.full_name?.split(' ')[0]}! We&apos;re reviewing your application
                and will be in touch soon. This usually takes 1–2 business days.
              </p>

              <div className="bg-white rounded-xl border border-[#6E6A62]/10 p-5 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6E6A62]/50">Status</span>
                  <span className="text-[#6E6A62] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Under review
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A62]/50">Submitted</span>
                  <span className="text-[#6E6A62]">
                    {new Date(application!.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </>
          )}

          {isRejected && (
            <>
              <motion.div
                className="w-20 h-20 mx-auto mb-8 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>

              <h1 className="text-[1.75rem] font-light text-[#6E6A62] tracking-tight mb-3">
                Application not approved
              </h1>
              <p className="text-[#6E6A62]/60 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Unfortunately, we weren&apos;t able to approve your application at this time.
                If you have questions, feel free to reach out to our support team.
              </p>

              <Link
                href="/"
                className="inline-block px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] transition-colors"
              >
                Back to home
              </Link>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
