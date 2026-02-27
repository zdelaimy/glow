export type UserRole = 'ADMIN' | 'CREATOR' | 'CUSTOMER'
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Creator {
  id: string
  user_id: string
  slug: string
  approved: boolean
  brand_name: string | null
  hero_headline: string | null
  benefits: string[]
  story: string | null
  logo_url: string | null
  hero_image_url: string | null
  label_template: string
  accent_color: string
  referral_code: string | null
  referred_by_code: string | null
  created_at: string
  updated_at: string
}

export interface BaseFormula {
  id: string
  name: string
  slug: string
  description: string | null
  benefit_summary: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Booster {
  id: string
  name: string
  slug: string
  need_key: NeedKey
  description: string | null
  benefit_summary: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Texture {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Scent {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface CompatibilityBaseBooster {
  id: string
  base_id: string
  booster_id: string
}

export interface CompatibilityBoosterPair {
  id: string
  booster_a_id: string
  booster_b_id: string
}

export interface CreatorSignature {
  id: string
  creator_id: string
  signature_name: string
  slug: string
  base_id: string
  booster_primary_id: string
  booster_secondary_id: string | null
  texture_id: string | null
  scent_id: string | null
  one_time_price_cents: number
  subscription_price_cents: number
  description: string | null
  benefit_bullets: string[]
  ritual_instructions: string | null
  publish_status: PublishStatus
  stripe_price_id_onetime: string | null
  stripe_price_id_subscription: string | null
  created_at: string
  updated_at: string
  // Joined relations
  base?: BaseFormula
  booster_primary?: Booster
  booster_secondary?: Booster
  texture?: Texture
  scent?: Scent
  creator?: Creator
}

export interface AnalyticsEvent {
  id: string
  event_type: EventType
  creator_id: string | null
  signature_id: string | null
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type EventType = 'storefront_view' | 'quiz_start' | 'quiz_complete' | 'add_to_cart' | 'purchase'

export interface Order {
  id: string
  customer_id: string | null
  creator_id: string
  signature_id: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  status: string
  is_subscription: boolean
  amount_cents: number
  currency: string
  shipping_name: string | null
  shipping_address: Record<string, unknown> | null
  line_items: Record<string, unknown>[]
  blend_components: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  signature?: CreatorSignature
  creator?: Creator
}

export interface Subscription {
  id: string
  customer_id: string | null
  creator_id: string
  signature_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type NeedKey = 'BARRIER' | 'CLARIFY' | 'BRIGHTEN' | 'HYDRATE' | 'SMOOTH' | 'PREP'

export type NeedScores = Record<NeedKey, number>

// Compensation enums
export type CommissionType = 'PERSONAL' | 'REFERRAL_MATCH'
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
export type BonusType = 'MONTHLY_TIER' | 'NEW_CREATOR'
export type RewardTier = 'PEARL' | 'OPAL' | 'ROSE_QUARTZ' | 'AMETHYST' | 'SAPPHIRE' | 'DIAMOND'

export interface CommissionSettings {
  id: string
  commission_rate: number
  referral_match_rate: number
  new_creator_bonus_cents: number
  new_creator_bonus_window_days: number
  points_personal_multiplier: number
  points_referral_multiplier: number
  commission_hold_days: number
  created_at: string
  updated_at: string
}

export interface MonthlyBonusTier {
  id: string
  min_commission_cents: number
  max_commission_cents: number | null
  bonus_cents: number
  tier_label: string
  sort_order: number
}

export interface CreatorReferral {
  id: string
  referrer_id: string
  referred_id: string
  match_expires_at: string
  created_at: string
}

export interface Commission {
  id: string
  creator_id: string
  order_id: string
  commission_type: CommissionType
  amount_cents: number
  rate: number
  status: CommissionStatus
  approved_at: string | null
  paid_at: string | null
  period: string | null
  created_at: string
  // Joined
  order?: Order
  creator?: Creator
}

export interface Bonus {
  id: string
  creator_id: string
  bonus_type: BonusType
  amount_cents: number
  period: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RewardPointsEntry {
  id: string
  creator_id: string
  order_id: string | null
  points: number
  source: CommissionType
  description: string | null
  created_at: string
}

export interface RewardPointsBalance {
  creator_id: string
  total_points: number
  updated_at: string
}

export interface RewardMilestone {
  id: string
  creator_id: string
  tier: RewardTier
  points_at_crossing: number
  created_at: string
}

export interface Payout {
  id: string
  creator_id: string
  period: string
  commission_total_cents: number
  bonus_total_cents: number
  total_cents: number
  status: PayoutStatus
  paid_at: string | null
  created_at: string
}
