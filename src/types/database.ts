export type UserRole = 'ADMIN' | 'GLOW_GIRL' | 'CUSTOMER'
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface GlowGirl {
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
  selected_product_ids: string[]
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

export interface GlowGirlSignature {
  id: string
  glow_girl_id: string
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
  glow_girl?: GlowGirl
}

export interface AnalyticsEvent {
  id: string
  event_type: EventType
  glow_girl_id: string | null
  signature_id: string | null
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type EventType = 'storefront_view' | 'quiz_start' | 'quiz_complete' | 'add_to_cart' | 'purchase'

export type FulfillmentStatus = 'UNFULFILLED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'DENIED' | 'COMPLETED'
export type ReturnReason = 'DAMAGED' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'OTHER'

export interface Product {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  price_cents: number
  compare_at_price_cents: number | null
  image_url: string | null
  ingredients: string[]
  category: string | null
  sku: string | null
  weight_oz: number | null
  active: boolean
  sort_order: number
  stripe_price_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price_cents: number
  total_cents: number
  created_at: string
  // Joined
  product?: Product
}

export interface ReturnRequest {
  id: string
  order_id: string
  customer_email: string
  reason: ReturnReason
  reason_detail: string | null
  status: ReturnStatus
  refund_amount_cents: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  order?: Order
}

export interface Order {
  id: string
  customer_id: string | null
  glow_girl_id: string
  signature_id: string | null
  product_id: string | null
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
  fulfillment_status: FulfillmentStatus
  tracking_number: string | null
  tracking_carrier: string | null
  tracking_url: string | null
  shipped_at: string | null
  delivered_at: string | null
  customer_email: string | null
  created_at: string
  updated_at: string
  // Joined
  signature?: GlowGirlSignature
  glow_girl?: GlowGirl
  product?: Product
  order_items?: OrderItem[]
}

export interface Subscription {
  id: string
  customer_id: string | null
  glow_girl_id: string
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
export type CommissionType = 'PERSONAL' | 'REFERRAL_MATCH' | 'POD_OVERRIDE'
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'
export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
export type BonusType = 'MONTHLY_TIER' | 'NEW_GLOW_GIRL'
export type RewardTier = 'PEARL' | 'OPAL' | 'ROSE_QUARTZ' | 'AMETHYST' | 'SAPPHIRE' | 'DIAMOND'

export interface CommissionSettings {
  id: string
  commission_rate: number
  referral_match_rate: number
  level2_referral_match_rate: number
  new_creator_bonus_cents: number
  new_creator_bonus_window_days: number
  points_personal_multiplier: number
  points_referral_multiplier: number
  commission_hold_days: number
  pod_override_rate: number
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

export interface GlowGirlReferral {
  id: string
  referrer_id: string
  referred_id: string
  match_expires_at: string
  created_at: string
}

export interface Commission {
  id: string
  glow_girl_id: string
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
  glow_girl?: GlowGirl
}

export interface Bonus {
  id: string
  glow_girl_id: string
  bonus_type: BonusType
  amount_cents: number
  period: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RewardPointsEntry {
  id: string
  glow_girl_id: string
  order_id: string | null
  points: number
  source: CommissionType
  description: string | null
  created_at: string
}

export interface RewardPointsBalance {
  glow_girl_id: string
  total_points: number
  updated_at: string
}

export interface RewardMilestone {
  id: string
  glow_girl_id: string
  tier: RewardTier
  points_at_crossing: number
  created_at: string
}

export interface Payout {
  id: string
  glow_girl_id: string
  period: string
  commission_total_cents: number
  bonus_total_cents: number
  total_cents: number
  status: PayoutStatus
  paid_at: string | null
  created_at: string
}

// Applications
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface GlowGirlApplication {
  id: string
  user_id: string
  full_name: string
  phone: string
  date_of_birth: string
  city: string
  state: string
  social_platforms: string[]
  primary_handle: string | null
  follower_range: string
  creates_content: boolean
  heard_from: string
  interested_products: string[]
  why_glow: string
  previous_direct_sales: boolean
  previous_company: string | null
  agreed_to_terms: boolean
  status: ApplicationStatus
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

// Pods
export interface Pod {
  id: string
  name: string
  leader_id: string
  pod_code: string
  created_at: string
  updated_at: string
  // Joined
  leader?: GlowGirl
}

export type PodMemberRole = 'LEADER' | 'MEMBER'

export interface PodMembership {
  id: string
  pod_id: string
  glow_girl_id: string
  role: PodMemberRole
  joined_at: string
  left_at: string | null
  // Joined
  pod?: Pod
  glow_girl?: GlowGirl
}
