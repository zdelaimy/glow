'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createGlowGirlProfile, updateGlowGirlBrand } from '@/lib/actions/glow-girl'
import { createClient } from '@/lib/supabase/client'

const LABEL_TEMPLATES = [
  { id: 'A', name: 'Minimal', desc: 'Clean lines, bold typography' },
  { id: 'B', name: 'Luxe', desc: 'Elegant serifs, gold accents' },
  { id: 'C', name: 'Fresh', desc: 'Playful, modern rounded type' },
]

const ACCENT_COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#1F2937', '#D946EF',
]

const STEPS = ['Brand', 'Story', 'Style', 'Preview']

export default function GlowGirlOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brandName, setBrandName] = useState('')
  const [slug, setSlug] = useState('')
  const [heroHeadline, setHeroHeadline] = useState('')
  const [benefits, setBenefits] = useState(['', '', ''])
  const [story, setStory] = useState('')
  const [labelTemplate, setLabelTemplate] = useState('A')
  const [accentColor, setAccentColor] = useState('#8B5CF6')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const glowGirl = await createGlowGirlProfile({
        brand_name: brandName,
        slug,
        hero_headline: heroHeadline,
        benefits: benefits.filter(Boolean),
        story,
        label_template: labelTemplate as 'A' | 'B' | 'C',
        accent_color: accentColor,
      })

      // Upload images if provided
      const supabase = createClient()
      const updates: Record<string, string> = {}

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `glow-girls/${glowGirl.id}/logo.${ext}`
        const { error: uploadErr } = await supabase.storage.from('brand-assets').upload(path, logoFile, { upsert: true })
        if (!uploadErr) {
          const { data } = supabase.storage.from('brand-assets').getPublicUrl(path)
          updates.logo_url = data.publicUrl
        }
      }

      if (heroFile) {
        const ext = heroFile.name.split('.').pop()
        const path = `glow-girls/${glowGirl.id}/hero.${ext}`
        const { error: uploadErr } = await supabase.storage.from('brand-assets').upload(path, heroFile, { upsert: true })
        if (!uploadErr) {
          const { data } = supabase.storage.from('brand-assets').getPublicUrl(path)
          updates.hero_image_url = data.publicUrl
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateGlowGirlBrand(glowGirl.id, updates)
      }

      router.push('/glow-girl/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight">
            Create your <span className="font-semibold">brand</span>
          </h1>
          <p className="text-muted-foreground mt-2">Set up your Glow Girl storefront in a few steps.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? 'text-violet-600 font-medium' : ''}>{s}</span>
            ))}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="brand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brand name</Label>
                    <Input
                      value={brandName}
                      onChange={(e) => { setBrandName(e.target.value); setSlug(autoSlug(e.target.value)) }}
                      placeholder="e.g., Luna Skin"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Handle (URL slug)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">glow.co/@</span>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="luna-skin"
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hero headline</Label>
                    <Input
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="Skincare that feels like self-care"
                      className="h-12"
                    />
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="story" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>3 key benefits of your brand</Label>
                    {benefits.map((b, i) => (
                      <Input
                        key={i}
                        value={b}
                        onChange={(e) => {
                          const updated = [...benefits]
                          updated[i] = e.target.value
                          setBenefits(updated)
                        }}
                        placeholder={['Clean, effective ingredients', 'Customized for your skin', 'Designed with love'][i]}
                        className="h-11"
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Your story</Label>
                    <Textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Tell your customers why you created this brand..."
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">{story.length}/500 characters</p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="style" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-3">
                    <Label>Label template</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {LABEL_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setLabelTemplate(t.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            labelTemplate === t.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Accent color</Label>
                    <div className="flex gap-2">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAccentColor(c)}
                          className={`w-10 h-10 rounded-full transition-all ${
                            accentColor === c ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Logo (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Hero image (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="rounded-2xl overflow-hidden border">
                    <div
                      className="h-48 flex items-end p-6"
                      style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }}
                    >
                      <div>
                        <h2 className="text-2xl font-semibold">{brandName || 'Your Brand'}</h2>
                        <p className="text-muted-foreground">{heroHeadline || 'Your headline here'}</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {benefits.filter(Boolean).map((b, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                            {b}
                          </span>
                        ))}
                      </div>
                      {story && <p className="text-sm text-muted-foreground">{story}</p>}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <span>Template: {LABEL_TEMPLATES.find(t => t.id === labelTemplate)?.name}</span>
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Your storefront will be at <strong>glow.co/@{slug}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(s => s + 1)} className="bg-gradient-to-r from-violet-600 to-violet-500">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-violet-600 to-violet-500">
                  {loading ? 'Creating...' : 'Launch my brand'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
