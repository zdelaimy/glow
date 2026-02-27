import type { NeedKey, NeedScores, BaseFormula, Booster, Texture, Scent, CompatibilityBaseBooster, CompatibilityBoosterPair } from '@/types/database'

export interface QuizQuestion {
  id: string
  question: string
  options: { label: string; value: string; scores: Partial<NeedScores> }[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'skin_type',
    question: 'How would you describe your skin type?',
    options: [
      { label: 'Oily', value: 'oily', scores: { CLARIFY: 3, PREP: 1 } },
      { label: 'Combination', value: 'combination', scores: { CLARIFY: 1, HYDRATE: 1, BARRIER: 1 } },
      { label: 'Dry', value: 'dry', scores: { HYDRATE: 3, BARRIER: 2 } },
      { label: 'Normal', value: 'normal', scores: { HYDRATE: 1 } },
    ],
  },
  {
    id: 'sensitivity',
    question: 'How sensitive is your skin?',
    options: [
      { label: 'Very sensitive', value: 'high', scores: { BARRIER: 3 } },
      { label: 'Somewhat sensitive', value: 'medium', scores: { BARRIER: 1 } },
      { label: 'Not sensitive', value: 'low', scores: {} },
    ],
  },
  {
    id: 'primary_concern',
    question: 'What\'s your #1 skin goal?',
    options: [
      { label: 'Calm & comfort my skin', value: 'calm', scores: { BARRIER: 4 } },
      { label: 'Minimize pores & control oil', value: 'pore', scores: { CLARIFY: 4 } },
      { label: 'Get a dewy, hydrated glow', value: 'hydrate', scores: { HYDRATE: 4 } },
      { label: 'Even out my skin tone', value: 'brighten', scores: { BRIGHTEN: 4 } },
      { label: 'Smooth texture & fine lines', value: 'smooth', scores: { SMOOTH: 4 } },
      { label: 'Perfect my makeup base', value: 'prep', scores: { PREP: 4 } },
    ],
  },
  {
    id: 'secondary_concern',
    question: 'What else would you love to improve?',
    options: [
      { label: 'Redness & irritation', value: 'calm', scores: { BARRIER: 2 } },
      { label: 'Large-looking pores', value: 'pore', scores: { CLARIFY: 2 } },
      { label: 'Dryness & dullness', value: 'hydrate', scores: { HYDRATE: 2, BRIGHTEN: 1 } },
      { label: 'Dark spots & uneven tone', value: 'brighten', scores: { BRIGHTEN: 2 } },
      { label: 'Rough or bumpy texture', value: 'smooth', scores: { SMOOTH: 2 } },
      { label: 'Makeup doesn\'t last', value: 'prep', scores: { PREP: 2 } },
    ],
  },
  {
    id: 'climate',
    question: 'What\'s your climate like?',
    options: [
      { label: 'Dry & cold', value: 'dry', scores: { HYDRATE: 2, BARRIER: 1 } },
      { label: 'Humid & warm', value: 'humid', scores: { CLARIFY: 1, PREP: 1 } },
      { label: 'Seasonal / it varies', value: 'seasonal', scores: { BARRIER: 1, HYDRATE: 1 } },
    ],
  },
  {
    id: 'makeup',
    question: 'How often do you wear makeup?',
    options: [
      { label: 'Daily', value: 'daily', scores: { PREP: 2, SMOOTH: 1 } },
      { label: 'A few times a week', value: 'sometimes', scores: { PREP: 1 } },
      { label: 'Rarely or never', value: 'rarely', scores: { HYDRATE: 1 } },
    ],
  },
  {
    id: 'finish',
    question: 'What finish do you love?',
    options: [
      { label: 'Dewy & glowy', value: 'dewy', scores: { HYDRATE: 2, BRIGHTEN: 1 } },
      { label: 'Natural & balanced', value: 'natural', scores: { BARRIER: 1 } },
      { label: 'Matte & smooth', value: 'matte', scores: { CLARIFY: 1, PREP: 1 } },
    ],
  },
  {
    id: 'lifestyle',
    question: 'What best describes your lifestyle?',
    options: [
      { label: 'Always on the go / travel a lot', value: 'travel', scores: { BARRIER: 1, HYDRATE: 1 } },
      { label: 'Outdoors & active', value: 'outdoors', scores: { BARRIER: 2, BRIGHTEN: 1 } },
      { label: 'Mostly indoors / office', value: 'indoor', scores: { HYDRATE: 1, SMOOTH: 1 } },
    ],
  },
]

// Base selection: maps top need to base
const needToBase: Record<NeedKey, string> = {
  BARRIER: 'barrier-silk',
  CLARIFY: 'clear-gel',
  BRIGHTEN: 'glow-milk',
  HYDRATE: 'glow-milk',
  SMOOTH: 'barrier-silk',
  PREP: 'clear-gel',
}

// Texture selection based on finish preference
const finishToTexture: Record<string, string> = {
  dewy: 'milky',
  natural: 'silky',
  matte: 'gel',
}

// Scent selection based on sensitivity
const sensitivityToScent: Record<string, string> = {
  high: 'fragrance-free',
  medium: 'fragrance-free',
  low: 'citrus',
}

export function computeScores(answers: Record<string, string>): NeedScores {
  const scores: NeedScores = { BARRIER: 0, CLARIFY: 0, BRIGHTEN: 0, HYDRATE: 0, SMOOTH: 0, PREP: 0 }

  for (const q of quizQuestions) {
    const answer = answers[q.id]
    if (!answer) continue
    const option = q.options.find(o => o.value === answer)
    if (!option) continue
    for (const [need, pts] of Object.entries(option.scores)) {
      scores[need as NeedKey] += pts
    }
  }

  return scores
}

export function rankNeeds(scores: NeedScores): NeedKey[] {
  return (Object.entries(scores) as [NeedKey, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
}

export interface BlendResult {
  base: BaseFormula
  primaryBooster: Booster
  secondaryBooster: Booster | null
  texture: Texture | null
  scent: Scent | null
  scores: NeedScores
  blendName: string
  benefits: string[]
  ritual: string
}

export function computeBlend(
  answers: Record<string, string>,
  bases: BaseFormula[],
  boosters: Booster[],
  textures: Texture[],
  scents: Scent[],
  baseBoosterCompat: CompatibilityBaseBooster[],
  boosterPairCompat: CompatibilityBoosterPair[],
  brandName?: string
): BlendResult {
  const scores = computeScores(answers)
  const ranked = rankNeeds(scores)

  // Pick base from top need
  const baseSlug = needToBase[ranked[0]]
  const base = bases.find(b => b.slug === baseSlug) || bases[0]

  // Get compatible boosters for this base
  const compatBoosterIds = new Set(
    baseBoosterCompat.filter(c => c.base_id === base.id).map(c => c.booster_id)
  )
  const availableBoosters = boosters.filter(b => compatBoosterIds.has(b.id))

  // Pick primary booster from top need
  const primaryBooster = availableBoosters.find(b => b.need_key === ranked[0])
    || availableBoosters.find(b => b.need_key === ranked[1])
    || availableBoosters[0]

  // Pick secondary booster from next need
  let secondaryBooster: Booster | null = null
  for (let i = 1; i < ranked.length; i++) {
    const candidate = availableBoosters.find(
      b => b.need_key === ranked[i] && b.id !== primaryBooster.id
    )
    if (!candidate) continue

    // Check pair compatibility
    const pairAllowed = boosterPairCompat.some(p =>
      (p.booster_a_id === primaryBooster.id && p.booster_b_id === candidate.id) ||
      (p.booster_a_id === candidate.id && p.booster_b_id === primaryBooster.id)
    )
    if (pairAllowed) {
      secondaryBooster = candidate
      break
    }
  }

  // Texture from finish answer
  const finishAnswer = answers.finish || 'natural'
  const textureSlug = finishToTexture[finishAnswer] || 'silky'
  const texture = textures.find(t => t.slug === textureSlug) || null

  // Scent from sensitivity
  const sensitivityAnswer = answers.sensitivity || 'medium'
  const scentSlug = sensitivityToScent[sensitivityAnswer] || 'fragrance-free'
  const scent = scents.find(s => s.slug === scentSlug) || null

  // Generate blend name
  const prefix = brandName || 'Glow'
  const blendName = `${prefix} ${primaryBooster.name}${secondaryBooster ? ` + ${secondaryBooster.name}` : ''} Serum`

  // Generate benefit bullets (cosmetic language only)
  const benefits = [
    base.benefit_summary || `${base.name} base for healthy-looking skin`,
    primaryBooster.benefit_summary || `${primaryBooster.name} booster for visible results`,
    secondaryBooster?.benefit_summary || 'Custom-blended for your unique skin needs',
  ].filter(Boolean)

  const ritual = `1. Start with clean, dry skin.\n2. Dispense ${base.name} base into your palm.\n3. Add your ${primaryBooster.name} booster pod${secondaryBooster ? ` and ${secondaryBooster.name} booster pod` : ''}.\n4. Mix gently with fingertips for 5 seconds.\n5. Press into skin using upward motions.\n6. Let absorb for 60 seconds before layering other products.\n\nYour custom blend ritual — a moment of self-care, designed just for you.`

  return { base, primaryBooster, secondaryBooster, texture, scent, scores, blendName, benefits, ritual }
}
