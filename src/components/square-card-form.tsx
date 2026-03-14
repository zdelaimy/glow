'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: (verificationDetails?: Record<string, unknown>) => Promise<{
            status: string
            token?: string
            errors?: Array<{ message: string }>
          }>
          destroy: () => Promise<void>
        }>
      }>
    }
  }
}

type SquareCard = Awaited<ReturnType<Awaited<ReturnType<NonNullable<typeof window.Square>['payments']>>['card']>>

interface SquareCardFormProps {
  onTokenize: (token: string) => Promise<void>
  disabled?: boolean
  buttonLabel?: string
}

const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID!
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
const SQUARE_ENV = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox'

const SCRIPT_URL =
  SQUARE_ENV === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'

function loadSquareScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`) as HTMLScriptElement | null
    if (existing) {
      // Script tag exists but may still be loading
      if (window.Square) {
        resolve()
      } else {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error('Failed to load Square')), { once: true })
      }
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Failed to load Square')), { once: true })
    document.head.appendChild(script)
  })
}

// Counter to generate unique IDs without useId (avoids hydration issues)
let instanceCounter = 0

export default function SquareCardForm({ onTokenize, disabled, buttonLabel = 'Subscribe' }: SquareCardFormProps) {
  const cardRef = useRef<SquareCard | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerIdRef = useRef(`sq-card-${++instanceCounter}`)

  useEffect(() => {
    let destroyed = false

    async function init() {
      try {
        await loadSquareScript()
        if (destroyed) return
        if (!window.Square) {
          setError('Payment form unavailable.')
          return
        }
        const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID)
        const card = await payments.card()
        if (destroyed) {
          card.destroy().catch(() => {})
          return
        }
        await card.attach(`#${containerIdRef.current}`)
        if (destroyed) {
          card.destroy().catch(() => {})
          return
        }
        cardRef.current = card
        setReady(true)
      } catch {
        if (!destroyed) setError('Failed to initialize payment form.')
      }
    }

    init()

    return () => {
      destroyed = true
      cardRef.current?.destroy().catch(() => {})
      cardRef.current = null
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!cardRef.current || loading || disabled) return
    setLoading(true)
    setError(null)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status === 'OK' && result.token) {
        await onTokenize(result.token)
      } else {
        setError(result.errors?.[0]?.message || 'Payment failed. Please check your card details.')
      }
    } catch {
      setError('Payment failed. Please try again.')
    }
    setLoading(false)
  }, [loading, disabled, onTokenize])

  return (
    <div className="space-y-4">
      <div
        id={containerIdRef.current}
        className="min-h-[44px] rounded-xl overflow-hidden"
      />

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={!ready || loading || disabled}
        className="w-full h-12 rounded-xl text-sm font-medium font-inter bg-[#6E6A62] text-white hover:bg-[#5E5A52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: ready && !loading && !disabled ? 1.01 : 1 }}
        whileTap={{ scale: ready && !loading && !disabled ? 0.99 : 1 }}
      >
        {loading ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            Processing...
          </>
        ) : !ready ? (
          'Loading payment form...'
        ) : (
          buttonLabel
        )}
      </motion.button>
    </div>
  )
}
