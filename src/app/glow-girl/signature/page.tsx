'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createSignature, updateSignature } from '@/lib/actions/glow-girl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BaseFormula, Booster, Texture, Scent, CompatibilityBaseBooster, CompatibilityBoosterPair } from '@/types/database'

export default function CreateSignature() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [bases, setBases] = useState<BaseFormula[]>([])
  const [boosters, setBoosters] = useState<Booster[]>([])
  const [textures, setTextures] = useState<Texture[]>([])
  const [scents, setScents] = useState<Scent[]>([])
  const [baseBoosterCompat, setBaseBoosterCompat] = useState<CompatibilityBaseBooster[]>([])
  const [boosterPairCompat, setBoosterPairCompat] = useState<CompatibilityBoosterPair[]>([])
  const [glowGirlId, setGlowGirlId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [baseId, setBaseId] = useState('')
  const [primaryBoosterId, setPrimaryBoosterId] = useState('')
  const [secondaryBoosterId, setSecondaryBoosterId] = useState('')
  const [textureId, setTextureId] = useState('')
  const [scentId, setScentId] = useState('')
  const [oneTimePrice, setOneTimePrice] = useState('49.00')
  const [subPrice, setSubPrice] = useState('39.00')
  const [description, setDescription] = useState('')
  const [benefitBullets, setBenefitBullets] = useState(['', '', ''])
  const [ritualInstructions, setRitualInstructions] = useState('')

  useEffect(() => {
    async function load() {
      const [basesRes, boostersRes, texturesRes, scentsRes, bbRes, bpRes, glowGirlRes] = await Promise.all([
        supabase.from('base_formulas').select('*').eq('active', true).order('sort_order'),
        supabase.from('boosters').select('*').eq('active', true).order('sort_order'),
        supabase.from('textures').select('*').eq('active', true).order('sort_order'),
        supabase.from('scents').select('*').eq('active', true).order('sort_order'),
        supabase.from('compatibility_base_booster').select('*'),
        supabase.from('compatibility_booster_pair').select('*'),
        supabase.from('glow_girls').select('id').limit(1).single(),
      ])
      setBases(basesRes.data || [])
      setBoosters(boostersRes.data || [])
      setTextures(texturesRes.data || [])
      setScents(scentsRes.data || [])
      setBaseBoosterCompat(bbRes.data || [])
      setBoosterPairCompat(bpRes.data || [])
      if (glowGirlRes.data) setGlowGirlId(glowGirlRes.data.id)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const compatibleBoosterIds = new Set(
    baseBoosterCompat.filter(c => c.base_id === baseId).map(c => c.booster_id)
  )
  const availableBoosters = boosters.filter(b => compatibleBoosterIds.has(b.id))

  const compatiblePairIds = new Set(
    boosterPairCompat
      .filter(p => p.booster_a_id === primaryBoosterId || p.booster_b_id === primaryBoosterId)
      .map(p => p.booster_a_id === primaryBoosterId ? p.booster_b_id : p.booster_a_id)
  )
  const availableSecondaryBoosters = availableBoosters.filter(
    b => b.id !== primaryBoosterId && compatiblePairIds.has(b.id)
  )

  async function handleSubmit() {
    if (!glowGirlId) return
    setLoading(true)
    setError(null)
    try {
      const sig = await createSignature(glowGirlId, {
        signature_name: name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        base_id: baseId,
        booster_primary_id: primaryBoosterId,
        booster_secondary_id: secondaryBoosterId || null,
        texture_id: textureId || null,
        scent_id: scentId || null,
        one_time_price_cents: Math.round(parseFloat(oneTimePrice) * 100),
        subscription_price_cents: Math.round(parseFloat(subPrice) * 100),
        description: description || null,
        benefit_bullets: benefitBullets.filter(Boolean),
        ritual_instructions: ritualInstructions || null,
      })

      await updateSignature(sig.id, { publish_status: 'PUBLISHED' })
      router.push('/glow-girl/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Create Signature Serum</h1>
          <p className="text-muted-foreground">Design your custom serum product.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serum Name</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }} placeholder="Glow Ritual" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="glow-ritual" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your signature serum..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Formula</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base Formula</Label>
              <Select value={baseId} onValueChange={(v) => { setBaseId(v); setPrimaryBoosterId(''); setSecondaryBoosterId('') }}>
                <SelectTrigger><SelectValue placeholder="Select base" /></SelectTrigger>
                <SelectContent>
                  {bases.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.benefit_summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Booster</Label>
              <Select value={primaryBoosterId} onValueChange={(v) => { setPrimaryBoosterId(v); setSecondaryBoosterId('') }} disabled={!baseId}>
                <SelectTrigger><SelectValue placeholder="Select primary booster" /></SelectTrigger>
                <SelectContent>
                  {availableBoosters.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.benefit_summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secondary Booster (optional)</Label>
              <Select value={secondaryBoosterId} onValueChange={setSecondaryBoosterId} disabled={!primaryBoosterId}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableSecondaryBoosters.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.benefit_summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texture (optional)</Label>
                <Select value={textureId} onValueChange={setTextureId}>
                  <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    {textures.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scent (optional)</Label>
                <Select value={scentId} onValueChange={setScentId}>
                  <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    {scents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>One-time price ($)</Label>
                <Input type="number" step="0.01" value={oneTimePrice} onChange={(e) => setOneTimePrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subscription price ($/mo)</Label>
                <Input type="number" step="0.01" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Benefit bullets (up to 3)</Label>
              {benefitBullets.map((b, i) => (
                <Input
                  key={i}
                  value={b}
                  onChange={(e) => {
                    const updated = [...benefitBullets]
                    updated[i] = e.target.value
                    setBenefitBullets(updated)
                  }}
                  placeholder={['Supports healthy skin barrier', 'Visibly smoother complexion', 'Your skin, your ritual'][i]}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Label>Ritual instructions (optional)</Label>
              <Textarea
                value={ritualInstructions}
                onChange={(e) => setRitualInstructions(e.target.value)}
                placeholder="Describe the mixing ritual for your customers..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.push('/glow-girl/dashboard')}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !baseId || !primaryBoosterId || !name}
            className="bg-gradient-to-r from-violet-600 to-violet-500"
          >
            {loading ? 'Creating...' : 'Create & Publish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
