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

export default function SquareCardForm({ onTokenize, disabled, buttonLabel = 'Subscribe' }: SquareCardFormProps) {
  const cardRef = useRef<Awaited<ReturnType<Awaited<ReturnType<NonNullable<typeof window.Square>['payments']>>['card']>> | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    if (existing) {
      initCard()
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => initCard()
    script.onerror = () => setError('Failed to load payment form.')
    document.head.appendChild(script)

    async function initCard() {
      try {
        if (!window.Square) {
          setError('Payment form unavailable.')
          return
        }
        const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID)
        const card = await payments.card()
        await card.attach('#square-card-container')
        cardRef.current = card
        setReady(true)
      } catch {
        setError('Failed to initialize payment form.')
      }
    }

    return () => {
      cardRef.current?.destroy().catch(() => {})
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
        id="square-card-container"
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
