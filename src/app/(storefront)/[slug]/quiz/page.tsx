'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { quizQuestions, computeBlend, type BlendResult } from '@/lib/quiz'
import { trackEvent } from '@/lib/actions/events'
import type { BaseFormula, Booster, Texture, Scent, CompatibilityBaseBooster, CompatibilityBoosterPair, GlowGirl } from '@/types/database'

export default function QuizPage() {
  const params = useParams()
  const slug = (params.slug as string).replace(/^@/, '')
  const supabase = createClient()

  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<BlendResult | null>(null)
  const [computing, setComputing] = useState(false)
  const [glowGirl, setGlowGirl] = useState<GlowGirl | null>(null)
  const [catalogData, setCatalogData] = useState<{
    bases: BaseFormula[]
    boosters: Booster[]
    textures: Texture[]
    scents: Scent[]
    baseBoosterCompat: CompatibilityBaseBooster[]
    boosterPairCompat: CompatibilityBoosterPair[]
  } | null>(null)

  useEffect(() => {
    async function load() {
      const [glowGirlRes, basesRes, boostersRes, texturesRes, scentsRes, bbRes, bpRes] = await Promise.all([
        supabase.from('glow_girls').select('*').eq('slug', slug).single(),
        supabase.from('base_formulas').select('*').eq('active', true).order('sort_order'),
        supabase.from('boosters').select('*').eq('active', true).order('sort_order'),
        supabase.from('textures').select('*').eq('active', true).order('sort_order'),
        supabase.from('scents').select('*').eq('active', true).order('sort_order'),
        supabase.from('compatibility_base_booster').select('*'),
        supabase.from('compatibility_booster_pair').select('*'),
      ])
      setGlowGirl(glowGirlRes.data)
      setCatalogData({
        bases: basesRes.data || [],
        boosters: boostersRes.data || [],
        textures: texturesRes.data || [],
        scents: scentsRes.data || [],
        baseBoosterCompat: bbRes.data || [],
        boosterPairCompat: bpRes.data || [],
      })
      if (glowGirlRes.data) {
        trackEvent('quiz_start', glowGirlRes.data.id)
      }
    }
    load()
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((questionId: string, value: string) => {
    const updated = { ...answers, [questionId]: value }
    setAnswers(updated)

    if (currentQ < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQ(c => c + 1), 300)
    } else {
      // Compute result
      setComputing(true)
      setTimeout(() => {
        if (catalogData && glowGirl) {
          const blend = computeBlend(
            updated,
            catalogData.bases,
            catalogData.boosters,
            catalogData.textures,
            catalogData.scents,
            catalogData.baseBoosterCompat,
            catalogData.boosterPairCompat,
            glowGirl.brand_name || undefined
          )
          setResult(blend)
          trackEvent('quiz_complete', glowGirl.id, null, { blend_name: blend.blendName })
        }
        setComputing(false)
      }, 2000) // Dramatic pause for "computing your blend..."
    }
  }, [answers, currentQ, catalogData, glowGirl])

  const accentColor = glowGirl?.accent_color || '#8B5CF6'
  const progress = ((currentQ + 1) / quizQuestions.length) * 100

  if (!catalogData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Computing state
  if (computing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-rose-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)` }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
          />
          <div>
            <h2 className="text-2xl font-light">Computing your blend...</h2>
            <p className="text-muted-foreground mt-2">Analyzing your unique skin profile</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Result state
  if (result) {
    const blendId = `GBL-${Date.now().toString(36).toUpperCase().slice(-6)}`

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto space-y-8"
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Your Custom Blend</p>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight">{result.blendName}</h1>
            <p className="text-sm text-muted-foreground mt-2">Custom Blend ID: {blendId}</p>
          </div>

          <Card className="border-0 shadow-xl overflow-hidden">
            <div
              className="h-3"
              style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }}
            />
            <CardContent className="pt-6 space-y-6">
              {/* Components */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">What&apos;s Inside</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="px-3 py-1.5" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                    Base: {result.base.name}
                  </Badge>
                  <Badge className="px-3 py-1.5" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                    Boost: {result.primaryBooster.name}
                  </Badge>
                  {result.secondaryBooster && (
                    <Badge className="px-3 py-1.5" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                      Boost: {result.secondaryBooster.name}
                    </Badge>
                  )}
                  {result.texture && (
                    <Badge variant="outline" className="px-3 py-1.5">
                      Finish: {result.texture.name}
                    </Badge>
                  )}
                  {result.scent && (
                    <Badge variant="outline" className="px-3 py-1.5">
                      Scent: {result.scent.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">Your Benefits</h3>
                <ul className="space-y-2">
                  {result.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ritual */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">Your Mixing Ritual</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-gray-50 rounded-xl p-4">
                  {result.ritual}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 space-y-3">
                <CheckoutButton
                  slug={slug}
                  glowGirlId={glowGirl?.id || ''}
                  accentColor={accentColor}
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <button
              onClick={() => { setCurrentQ(0); setAnswers({}); setResult(null) }}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Retake Quiz
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Quiz questions
  const question = quizQuestions[currentQ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">
            {glowGirl?.brand_name || 'Glow'} Skin Quiz
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Question {currentQ + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-center mb-8">
              {question.question}
            </h2>

            <div className="grid gap-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all text-base ${
                    answers[question.id] === option.value
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {currentQ > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentQ(c => c - 1)}
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutButton({ slug, glowGirlId, accentColor }: { slug: string; glowGirlId: string; accentColor: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleCheckout(mode: 'subscription' | 'payment') {
    setLoading(true)

    // Find first published signature for this glow girl
    const { data: signatures } = await supabase
      .from('glow_girl_signatures')
      .select('id')
      .eq('glow_girl_id', glowGirlId)
      .eq('publish_status', 'PUBLISHED')
      .limit(1)

    if (!signatures || signatures.length === 0) {
      alert('No products available yet.')
      setLoading(false)
      return
    }

    trackEvent('add_to_cart', glowGirlId, signatures[0].id)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signatureId: signatures[0].id,
        mode,
        slug,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Checkout unavailable. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full h-14 text-base rounded-full"
        style={{ backgroundColor: accentColor }}
        onClick={() => handleCheckout('subscription')}
        disabled={loading}
      >
        Subscribe & Save — From $39/mo
      </Button>
      <Button
        variant="outline"
        className="w-full h-12 rounded-full"
        onClick={() => handleCheckout('payment')}
        disabled={loading}
      >
        One-Time Purchase — From $49
      </Button>
    </div>
  )
}
