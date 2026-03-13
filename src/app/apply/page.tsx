'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitApplication, getMyApplication } from '@/lib/actions/glow-girl'
import { createClient } from '@/lib/supabase/client'
import SquareCardForm from '@/components/square-card-form'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

type Billing = 'monthly' | 'annual'
type PlanTier = 'pro' | 'elite'

const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Glow Girl Starter',
    monthlyPrice: 200,
    description: 'Start selling and earning commissions.',
    planIds: {
      monthly: process.env.NEXT_PUBLIC_SQUARE_PLAN_PRO_MONTHLY!,
      annual: process.env.NEXT_PUBLIC_SQUARE_PLAN_PRO_ANNUAL!,
    },
    badge: 'Most Popular',
    features: [
      'Personal storefront & referral link',
      '25% commission on every sale',
      '2 free Glow products per month ($160 value)',
      '10% referral match bonus',
      '5% pod override earnings',
      'Full training library access',
      'Monthly bonus eligibility',
      'Social media growth coaching',
    ],
    missingFeatures: [
      '1-on-1 mentorship',
      'Exclusive events & galas',
      'Private sales consulting (2x/month)',
    ],
  },
  elite: {
    name: 'Glow Girl Pro',
    monthlyPrice: 450,
    description: 'Maximum earning potential & exclusive perks.',
    planIds: {
      monthly: process.env.NEXT_PUBLIC_SQUARE_PLAN_ELITE_MONTHLY!,
      annual: process.env.NEXT_PUBLIC_SQUARE_PLAN_ELITE_ANNUAL!,
    },
    badge: null as string | null,
    features: [
      'Everything in Starter',
      '1-on-1 mentorship',
      'Exclusive events & galas',
      'Private sales consulting (2x/month)',
    ],
    missingFeatures: [],
  },
} as const

const STEPS = ['Account', 'About You', 'Social', 'Interest', 'Choose Plan']

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'twitter', label: 'X / Twitter' },
]

const FOLLOWER_RANGES = [
  'Under 1K',
  '1K – 5K',
  '5K – 25K',
  '25K – 100K',
  '100K+',
]

const HEARD_FROM_OPTIONS = [
  'Friend or referral',
  'Social media',
  'Google search',
  'Event',
  'Other',
]

const PRODUCT_INTERESTS = [
  'Custom serums',
  'Moisturizers',
  'Cleansers',
  'SPF / Sun care',
  'Body care',
  'All products',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

export default function ApplyPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#6E6A62]/20 border-t-[#6E6A62] rounded-full animate-spin" />
      </div>
    }>
      <ApplyPage />
    </Suspense>
  )
}

function ApplyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)

  // Account step
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([])
  const [primaryHandle, setPrimaryHandle] = useState('')
  const [followerRange, setFollowerRange] = useState('')
  const [createsContent, setCreatesContent] = useState(false)
  const [heardFrom, setHeardFrom] = useState('')
  const [interestedProducts, setInterestedProducts] = useState<string[]>([])
  const [whyGlow, setWhyGlow] = useState('')
  const [previousDirectSales, setPreviousDirectSales] = useState(false)
  const [previousCompany, setPreviousCompany] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [billing, setBilling] = useState<Billing>('annual')
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [founderCode, setFounderCode] = useState('')
  const [founderCodeValid, setFounderCodeValid] = useState(false)
  const [founderCodeChecking, setFounderCodeChecking] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Already logged in — check profile role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'GLOW_GIRL') {
          router.push('/glow-girl/dashboard')
          return
        }
        // Check if they already applied but aren't activated yet
        const application = await getMyApplication()
        if (application) {
          router.push('/glow-girl/dashboard')
          return
        }
        // Skip account step — user likely came via OTP welcome flow
        setIsAuthenticated(true)
        setNeedsPassword(true)
        setStep(1)
      }
      setChecking(false)
    }
    check()
  }, [router])

  // Pre-fill referral code from URL ?ref= param
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
      setHeardFrom('Friend or referral')
    }
  }, [searchParams])

  function togglePlatform(id: string) {
    setSocialPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function toggleProduct(id: string) {
    setInterestedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!(email && password.length >= 8 && password === confirmPassword)
      case 1: {
        const baseValid = !!(fullName && phone && dob && city && state)
        if (needsPassword) {
          return baseValid && password.length >= 8 && password === confirmPassword
        }
        return baseValid
      }
      case 2: return !!(socialPlatforms.length > 0 && followerRange)
      case 3: return !!(heardFrom && interestedProducts.length > 0 && whyGlow.length >= 10)
      case 4: return selectedPlan !== null
      default: return false
    }
  }

  async function handleCreateAccount() {
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: referralCode ? {
        data: { referred_by_code: referralCode },
      } : undefined,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setIsAuthenticated(true)
    setStep(1)
    setLoading(false)
  }

  async function handleNext() {
    if (step === 0 && !isAuthenticated) {
      handleCreateAccount()
    } else if (step === 1 && needsPassword) {
      // Set password for OTP users before advancing
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setNeedsPassword(false)
      setStep(2)
      setLoading(false)
    } else if (step < STEPS.length - 1) {
      setError(null)
      setStep(s => s + 1)
    }
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

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      {/* Header */}
      <header className="border-b border-[#6E6A62]/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-inter text-lg tracking-tight text-[#6E6A62] font-medium">
            GLOW
          </Link>
          <span className="text-sm text-[#6E6A62]/50 font-inter">Glow Girl Application</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress bar (no labels) */}
        <div className="mb-10">
          <div className="h-0.5 bg-[#6E6A62]/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#6E6A62]"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Heading */}
        <motion.div
          className="mb-8"
          key={`heading-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-[1.75rem] font-light text-[#6E6A62] tracking-tight leading-tight">
            {step === 0 && 'Create your account'}
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Your social presence'}
            {step === 3 && "What brings you to Glow?"}
            {step === 4 && 'Choose your plan'}
          </h1>
          <p className="text-[#6E6A62]/50 text-sm mt-2">
            {step === 0 && "You'll use this to sign into your Glow account."}
            {step === 1 && "We'd love to get to know you."}
            {step === 2 && 'Where do you connect with your audience?'}
            {step === 3 && 'Help us understand what excites you.'}
            {step === 4 && 'Select a plan and subscribe to start your Glow business.'}
          </p>
        </motion.div>

        {/* Form steps */}
        <div className="bg-white rounded-2xl border border-[#6E6A62]/10 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Account */}
            {step === 0 && !isAuthenticated && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <FieldGroup label="Email address">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                </FieldGroup>

                <FieldGroup label="Create a password">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-xs text-rose-400 mt-1">Must be at least 8 characters</p>
                  )}
                </FieldGroup>

                <FieldGroup label="Confirm password">
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-rose-400 mt-1">Passwords don&apos;t match</p>
                  )}
                </FieldGroup>

                <p className="text-xs text-[#6E6A62]/40 pt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 1: About You */}
            {step === 1 && (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {needsPassword && (
                  <>
                    <div className="rounded-xl bg-[#f5f0eb]/60 px-4 py-3">
                      <p className="text-sm text-[#6E6A62]/70">
                        Create a password so you can sign in to your account later.
                      </p>
                    </div>

                    <FieldGroup label="Create a password">
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                      />
                      {password.length > 0 && password.length < 8 && (
                        <p className="text-xs text-rose-400 mt-1">Must be at least 8 characters</p>
                      )}
                    </FieldGroup>

                    <FieldGroup label="Confirm password">
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                      />
                      {confirmPassword.length > 0 && password !== confirmPassword && (
                        <p className="text-xs text-rose-400 mt-1">Passwords don&apos;t match</p>
                      )}
                    </FieldGroup>

                    <div className="border-b border-[#6E6A62]/10" />
                  </>
                )}

                <FieldGroup label="Full name">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                </FieldGroup>

                <FieldGroup label="Phone number">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                </FieldGroup>

                <FieldGroup label="Date of birth">
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                </FieldGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="City">
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Los Angeles"
                      className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                    />
                  </FieldGroup>
                  <FieldGroup label="State">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-12 w-full bg-[#f5f0eb]/50 border border-[#6E6A62]/15 rounded-xl text-[#6E6A62] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/20 focus:border-[#6E6A62]/40"
                    >
                      <option value="">Select</option>
                      {US_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
              </motion.div>
            )}

            {/* Step 2: Social Presence */}
            {step === 2 && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <FieldGroup label="Which platforms do you use?">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SOCIAL_PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          socialPlatforms.includes(p.id)
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Primary handle / username">
                  <Input
                    value={primaryHandle}
                    onChange={(e) => setPrimaryHandle(e.target.value)}
                    placeholder="@yourusername"
                    className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                  />
                  <p className="text-xs text-[#6E6A62]/40 mt-1">On your most active platform</p>
                </FieldGroup>

                <FieldGroup label="Approximate follower count">
                  <div className="flex flex-wrap gap-2">
                    {FOLLOWER_RANGES.map(range => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setFollowerRange(range)}
                        className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                          followerRange === range
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Do you currently create content?">
                  <div className="flex gap-3">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setCreatesContent(val)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                          createsContent === val
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </FieldGroup>
              </motion.div>
            )}

            {/* Step 3: Interest */}
            {step === 3 && (
              <motion.div
                key="interest"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <FieldGroup label="How did you hear about Glow?">
                  <div className="flex flex-wrap gap-2">
                    {HEARD_FROM_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHeardFrom(opt)}
                        className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                          heardFrom === opt
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                {heardFrom === 'Friend or referral' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FieldGroup label="Referral code">
                      <Input
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="e.g., GLOW1234"
                        maxLength={20}
                        className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                      />
                      <p className="text-xs text-[#6E6A62]/40 mt-1">Optional — enter if you have one</p>
                    </FieldGroup>
                  </motion.div>
                )}

                <FieldGroup label="What products interest you?">
                  <div className="grid grid-cols-2 gap-2.5">
                    {PRODUCT_INTERESTS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProduct(p)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          interestedProducts.includes(p)
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Why do you want to be a Glow Girl?">
                  <Textarea
                    value={whyGlow}
                    onChange={(e) => setWhyGlow(e.target.value)}
                    placeholder="Tell us what excites you about Glow..."
                    className="min-h-[120px] bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40 resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs transition-colors ${
                      whyGlow.length > 0 && whyGlow.length < 10
                        ? 'text-rose-400'
                        : whyGlow.length >= 10
                          ? 'text-emerald-500'
                          : 'text-[#6E6A62]/40'
                    }`}>
                      {whyGlow.length === 0
                        ? 'Minimum 10 characters'
                        : whyGlow.length < 10
                          ? `${10 - whyGlow.length} more character${10 - whyGlow.length === 1 ? '' : 's'} needed`
                          : 'Looks good!'}
                    </p>
                    <p className="text-xs text-[#6E6A62]/40">{whyGlow.length}/500</p>
                  </div>
                </FieldGroup>

                <FieldGroup label="Have you sold products through direct sales before?">
                  <div className="flex gap-3">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setPreviousDirectSales(val)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                          previousDirectSales === val
                            ? 'border-[#6E6A62] bg-[#6E6A62] text-white'
                            : 'border-[#6E6A62]/15 text-[#6E6A62]/70 hover:border-[#6E6A62]/40'
                        }`}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                {previousDirectSales && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FieldGroup label="Which company?">
                      <Input
                        value={previousCompany}
                        onChange={(e) => setPreviousCompany(e.target.value)}
                        placeholder="e.g., Mary Kay, Avon, etc."
                        className="h-12 bg-[#f5f0eb]/50 border-[#6E6A62]/15 rounded-xl text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus-visible:ring-[#6E6A62]/20 focus-visible:border-[#6E6A62]/40"
                      />
                    </FieldGroup>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Choose Plan */}
            {step === 4 && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Earnings headline */}
                <div className="text-center">
                  <p className="text-base font-medium text-[#6E6A62]">
                    Average Glow Girl is expected to earn $2,150/month after the Glow 10-week ramp up
                  </p>
                  <p className="text-[11px] text-[#6E6A62]/40 mt-1">
                    Individual results vary. This is not a guarantee of income.
                  </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setBilling('monthly')}
                    className={`px-4 py-2 rounded-full text-xs font-medium font-inter transition-all ${
                      billing === 'monthly'
                        ? 'bg-[#6E6A62] text-white'
                        : 'bg-[#f5f0eb]/60 text-[#6E6A62]/70 hover:bg-[#f5f0eb]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling('annual')}
                    className={`px-4 py-2 rounded-full text-xs font-medium font-inter transition-all flex items-center gap-1.5 ${
                      billing === 'annual'
                        ? 'bg-[#6E6A62] text-white'
                        : 'bg-[#f5f0eb]/60 text-[#6E6A62]/70 hover:bg-[#f5f0eb]'
                    }`}
                  >
                    Annual
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      billing === 'annual' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      Save 15%
                    </span>
                  </button>
                </div>

                {/* Plan cards */}
                <div className="grid gap-4">
                  {(['pro', 'elite'] as const).map((tier) => {
                    const plan = SUBSCRIPTION_PLANS[tier]
                    const annualTotal = plan.monthlyPrice * 12 * 0.85
                    const perMonth = billing === 'annual' ? annualTotal / 12 : plan.monthlyPrice
                    const isSelected = selectedPlan === tier

                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => { setSelectedPlan(tier); setError(null) }}
                        className={`relative text-left rounded-xl border-2 p-5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#6E6A62] bg-[#f5f0eb]/40'
                            : 'border-[#6E6A62]/10 hover:border-[#6E6A62]/30'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 right-4 bg-[#6E6A62] text-white text-[10px] uppercase tracking-[0.12em] font-medium font-inter px-2.5 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-4 pl-6">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-[#6E6A62]">{plan.name}</h4>
                            <p className="text-xs text-[#6E6A62]/50 mt-0.5">{plan.description}</p>
                            <ul className="mt-3 space-y-1.5">
                              {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-[#6E6A62]/70">
                                  <Check className="w-3 h-3 text-[#6E6A62] flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                              {plan.missingFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-xs text-[#6E6A62]/30">
                                  <X className="w-3 h-3 text-[#6E6A62]/25 flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {billing === 'annual' && (
                              <span className="text-sm font-light text-[#6E6A62]/40 line-through">
                                ${plan.monthlyPrice}
                              </span>
                            )}
                            <div>
                              <span className="text-2xl font-light text-[#6E6A62]">${Math.round(perMonth)}</span>
                              <span className="text-xs text-[#6E6A62]/50">/mo</span>
                            </div>
                            {billing === 'annual' && (
                              <p className="text-[10px] text-emerald-600 mt-0.5">
                                ${annualTotal.toFixed(0)}/yr — save 15%
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Radio indicator */}
                        <div className={`absolute top-5 left-5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-[#6E6A62]' : 'border-[#6E6A62]/20'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#6E6A62]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Cancel anytime note */}
                <p className="text-center text-xs text-[#6E6A62]/50 -mt-1">
                  Cancel anytime — no long-term commitment required.
                </p>

                {/* Founder code */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={founderCode}
                      onChange={(e) => { setFounderCode(e.target.value.toUpperCase()); setFounderCodeValid(false) }}
                      placeholder="Have a founder code?"
                      className="flex-1 h-10 bg-[#f5f0eb]/50 border border-[#6E6A62]/15 rounded-xl px-3 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40"
                    />
                    <button
                      type="button"
                      disabled={!founderCode.trim() || founderCodeChecking}
                      onClick={async () => {
                        setFounderCodeChecking(true)
                        setError(null)
                        try {
                          const res = await fetch('/api/validate-founder-code', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: founderCode.trim() }),
                          })
                          const result = await res.json()
                          if (result.valid) {
                            setFounderCodeValid(true)
                          } else {
                            setError(result.message || 'Invalid founder code.')
                            setFounderCodeValid(false)
                          }
                        } catch {
                          setError('Failed to validate code.')
                        }
                        setFounderCodeChecking(false)
                      }}
                      className="h-10 px-4 rounded-xl text-xs font-medium font-inter bg-[#6E6A62] text-white hover:bg-[#5E5A52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {founderCodeChecking ? '...' : 'Apply'}
                    </button>
                  </div>
                  {founderCodeValid && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Founder code applied — no payment required!
                    </p>
                  )}
                </div>

                {/* Agreement checkbox */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-[#6E6A62]/30 text-[#6E6A62] focus:ring-[#6E6A62]/20 cursor-pointer accent-[#6E6A62]"
                    />
                    <span className="text-xs text-[#6E6A62]/60 group-hover:text-[#6E6A62]/80 transition-colors">
                      I agree to the{' '}
                      <Link href="/terms" className="underline underline-offset-2 text-[#6E6A62]" target="_blank">Terms</Link>
                      {' '}&{' '}
                      <Link href="/privacy" className="underline underline-offset-2 text-[#6E6A62]" target="_blank">Privacy Policy</Link>.
                    </span>
                  </label>
                </div>

                {/* Founder code: skip payment button */}
                {selectedPlan && founderCodeValid && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    disabled={subscribing}
                    onClick={async () => {
                      if (!agreedToTerms) {
                        setError('Please agree to the Terms & Privacy Policy to continue.')
                        return
                      }
                      setSubscribing(true)
                      setError(null)
                      try {
                        await submitApplication({
                          full_name: fullName,
                          phone,
                          date_of_birth: dob,
                          city,
                          state,
                          social_platforms: socialPlatforms,
                          primary_handle: primaryHandle || null,
                          follower_range: followerRange,
                          creates_content: createsContent,
                          heard_from: heardFrom,
                          interested_products: interestedProducts,
                          why_glow: whyGlow,
                          previous_direct_sales: previousDirectSales,
                          previous_company: previousDirectSales ? previousCompany || null : null,
                          referral_code: referralCode || null,
                          agreed_to_terms: true,
                        })

                        const res = await fetch('/api/activate-founder', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            founderCode: founderCode.trim(),
                            plan: selectedPlan,
                            billing: 'founder',
                            fullName,
                          }),
                        })
                        const result = await res.json()
                        if (result.success) {
                          router.push('/glow-girl/dashboard')
                        } else {
                          setError(result.error || 'Failed to activate. Please contact support.')
                        }
                      } catch {
                        setError('Something went wrong. Please contact support.')
                      }
                      setSubscribing(false)
                    }}
                    className="w-full h-12 rounded-xl text-sm font-medium font-inter bg-[#6E6A62] text-white hover:bg-[#5E5A52] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {subscribing ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Activating...
                      </>
                    ) : (
                      `Join as ${SUBSCRIPTION_PLANS[selectedPlan].name}`
                    )}
                  </motion.button>
                )}

                {/* Square card form (only when no valid founder code) */}
                {selectedPlan && !founderCodeValid && (
                  <SquareCardForm
                    key={`square-${selectedPlan}-${billing}`}
                    disabled={subscribing}
                    buttonLabel={`Subscribe — $${Math.round(
                      billing === 'annual'
                        ? (SUBSCRIPTION_PLANS[selectedPlan].monthlyPrice * 12 * 0.85) / 12
                        : SUBSCRIPTION_PLANS[selectedPlan].monthlyPrice
                    )}/mo`}
                    onTokenize={async (token) => {
                      if (!agreedToTerms) {
                        setError('Please agree to the Terms & Privacy Policy to continue.')
                        return
                      }
                      setSubscribing(true)
                      setError(null)
                      try {
                        await submitApplication({
                          full_name: fullName,
                          phone,
                          date_of_birth: dob,
                          city,
                          state,
                          social_platforms: socialPlatforms,
                          primary_handle: primaryHandle || null,
                          follower_range: followerRange,
                          creates_content: createsContent,
                          heard_from: heardFrom,
                          interested_products: interestedProducts,
                          why_glow: whyGlow,
                          previous_direct_sales: previousDirectSales,
                          previous_company: previousDirectSales ? previousCompany || null : null,
                          referral_code: referralCode || null,
                          agreed_to_terms: true,
                        })

                        const res = await fetch('/api/square/create-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            token,
                            plan: selectedPlan,
                            billing,
                            fullName,
                            email,
                          }),
                        })
                        const result = await res.json()
                        if (result.success) {
                          router.push('/glow-girl/dashboard')
                        } else {
                          setError(result.error || 'Failed to activate. Please contact support.')
                        }
                      } catch (err) {
                        console.error('Subscription error:', err)
                        setError(err instanceof Error ? err.message : 'Something went wrong. Please contact support.')
                      }
                      setSubscribing(false)
                    }}
                  />
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-rose-500 mt-4 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#6E6A62]/10">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0 || (isAuthenticated && step === 1)}
              className="px-5 py-2.5 text-sm text-[#6E6A62] hover:text-[#5E5A52] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {step < STEPS.length - 1 && (
              <motion.button
                onClick={handleNext}
                disabled={!canAdvance() || loading}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#6E6A62] hover:bg-[#5E5A52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                whileHover={{ scale: canAdvance() && !loading ? 1.02 : 1 }}
                whileTap={{ scale: canAdvance() && !loading ? 0.98 : 1 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    {step === 0 ? 'Creating account...' : 'Saving...'}
                  </>
                ) : (
                  'Continue'
                )}
              </motion.button>
            )}

            {step === STEPS.length - 1 && subscribing && (
              <div className="flex items-center gap-2 text-sm text-[#6E6A62]/60">
                <motion.div
                  className="w-4 h-4 border-2 border-[#6E6A62]/20 border-t-[#6E6A62] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Activating...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[#6E6A62]/70 uppercase tracking-[0.12em] font-inter">
        {label}
      </label>
      {children}
    </div>
  )
}

