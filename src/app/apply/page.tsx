'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitApplication, getMyApplication } from '@/lib/actions/glow-girl'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const STEPS = ['Account', 'About You', 'Social', 'Interest', 'Agreement']

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
  'Social media',
  'Friend or referral',
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

export default function ApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToCompPlan, setAgreedToCompPlan] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Already logged in — check if they already applied
        const application = await getMyApplication()
        if (application) {
          router.push('/apply/status')
          return
        }
        // Skip account step
        setIsAuthenticated(true)
        setStep(1)
      }
      setChecking(false)
    }
    check()
  }, [router])

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
      case 1: return !!(fullName && phone && dob && city && state)
      case 2: return !!(socialPlatforms.length > 0 && followerRange)
      case 3: return !!(heardFrom && interestedProducts.length > 0 && whyGlow.length >= 10)
      case 4: return agreedToTerms && agreedToCompPlan
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

  async function handleSubmit() {
    setLoading(true)
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
        agreed_to_terms: true,
      })
      router.push('/apply/status')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setLoading(false)
  }

  function handleNext() {
    if (step === 0 && !isAuthenticated) {
      handleCreateAccount()
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
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => {
              // If already authenticated, hide "Account" label
              if (i === 0 && isAuthenticated) return <span key={s} />
              return (
                <button
                  key={s}
                  onClick={() => i < step && (!isAuthenticated || i > 0) && setStep(i)}
                  className={`text-xs font-inter uppercase tracking-[0.15em] transition-colors ${
                    i <= step ? 'text-[#6E6A62]' : 'text-[#6E6A62]/30'
                  } ${i < step && (!isAuthenticated || i > 0) ? 'cursor-pointer hover:text-[#5E5A52]' : 'cursor-default'}`}
                >
                  {s}
                </button>
              )
            })}
          </div>
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
            {step === 4 && 'Almost there'}
          </h1>
          <p className="text-[#6E6A62]/50 text-sm mt-2">
            {step === 0 && "You'll use this to sign into your Glow account."}
            {step === 1 && "We'd love to get to know you."}
            {step === 2 && 'Where do you connect with your audience?'}
            {step === 3 && 'Help us understand what excites you.'}
            {step === 4 && 'Review and submit your application.'}
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
                  <p className="text-xs text-[#6E6A62]/40 mt-1">{whyGlow.length}/500</p>
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

            {/* Step 4: Agreement */}
            {step === 4 && (
              <motion.div
                key="agreement"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="rounded-xl bg-[#f5f0eb]/60 p-5 space-y-3">
                  <h3 className="text-sm font-medium text-[#6E6A62] uppercase tracking-[0.1em] font-inter">Your Application</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <SummaryItem label="Name" value={fullName} />
                    <SummaryItem label="Location" value={`${city}, ${state}`} />
                    <SummaryItem label="Platforms" value={socialPlatforms.join(', ')} />
                    <SummaryItem label="Followers" value={followerRange} />
                    <SummaryItem label="Heard from" value={heardFrom} />
                    <SummaryItem label="Products" value={interestedProducts.join(', ')} />
                  </div>
                  {whyGlow && (
                    <div className="pt-2 border-t border-[#6E6A62]/10">
                      <p className="text-xs text-[#6E6A62]/50 mb-1">Why Glow?</p>
                      <p className="text-sm text-[#6E6A62]">{whyGlow}</p>
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToCompPlan}
                      onChange={(e) => setAgreedToCompPlan(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-[#6E6A62]/30 text-[#6E6A62] focus:ring-[#6E6A62]/20 cursor-pointer accent-[#6E6A62]"
                    />
                    <span className="text-sm text-[#6E6A62]/70 group-hover:text-[#6E6A62] transition-colors">
                      I have reviewed the{' '}
                      <Link href="/glow-girls" className="underline underline-offset-2 text-[#6E6A62]" target="_blank">
                        compensation plan
                      </Link>
                      {' '}and understand how Glow Girl earnings work.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-[#6E6A62]/30 text-[#6E6A62] focus:ring-[#6E6A62]/20 cursor-pointer accent-[#6E6A62]"
                    />
                    <span className="text-sm text-[#6E6A62]/70 group-hover:text-[#6E6A62] transition-colors">
                      I agree to the{' '}
                      <Link href="/terms" className="underline underline-offset-2 text-[#6E6A62]" target="_blank">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="underline underline-offset-2 text-[#6E6A62]" target="_blank">
                        Privacy Policy
                      </Link>
                      , and I understand I will be an independent contractor.
                    </span>
                  </label>
                </div>
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

            {step < STEPS.length - 1 ? (
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
                    Creating account...
                  </>
                ) : (
                  'Continue'
                )}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={loading || !canAdvance()}
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
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </motion.button>
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[#6E6A62]/50">{label}:</span>{' '}
      <span className="text-[#6E6A62]">{value}</span>
    </div>
  )
}
