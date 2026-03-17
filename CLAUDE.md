# Glow Beauty — Project Guide for Claude

## What This Is

Glow Beauty is a B2B2C e-commerce platform for curated premium makeup & skincare. Independent ambassadors ("Glow Girls") sell products through personalized storefronts and earn multi-level commissions.

**Do NOT call this an MLM.** Use "ambassador program" or "creator partnership." Lead with product, not recruitment.

## Domain

- **Production URL:** `https://joinglowlabs.com`
- **Email:** `team@joinglowlabs.com`
- **Old domain:** `glowlabs.nyc` — **deprecated**, do NOT use in new code

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Language:** TypeScript 5, React 18
- **Database:** Supabase (PostgreSQL + Auth + RLS + Storage)
- **Styling:** Tailwind CSS 3.4 + Shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion
- **Validation:** Zod
- **AI:** OpenAI (GPT) for AI Studio content generation

## Payment Processors

| Processor | Status | Usage |
|-----------|--------|-------|
| **Square** | Primary | Checkout, Glow Girl membership subscriptions |
| **Braintree** | Backup | Drop-in UI, webhooks |
| **PayPal** | Legacy | `/shop` direct checkout, subscriptions |
| **Stripe** | **Deprecated** | Schema fields remain for historical orders. Do NOT add new Stripe code. |

Why multiple processors: MLM-adjacent models can get flagged by a single processor.

## Product Model — IMPORTANT

**The app has pivoted.** The old custom serum builder (base formulas, boosters, textures, scents, `creator_signatures`) is **deprecated**. The database tables still exist but are NOT used in the current product model.

**Current model:** A small, curated catalog of fixed products in the `products` table (e.g., Glow Serum $80, Shine Shampoo $42, Beauty Gummies $44). Glow Girls select which products to feature on their storefront via `selected_product_ids`.

**Do NOT:**
- Reference or build features around `base_formulas`, `boosters`, `textures`, `scents`, or `creator_signatures`
- Refer to "custom serums," "blends," or "quiz-to-blend" flows
- These are legacy remnants from a previous business model

## User Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Full system access, manages everything |
| `GLOW_GIRL` | Ambassador with storefront, commissions, team features |
| `CUSTOMER` | Shops and places orders |

## Auth

- **Provider:** Supabase Auth (magic link, email/password, Google OAuth)
- **Middleware** (`src/middleware.ts`): session refresh, OAuth code exchange (Vercel-compatible), referral cookie tracking, role-based route protection
- **Helpers** (`src/lib/auth.ts`): `getUser()`, `requireAuth()`, `requireRole()`, `requireGlowGirl()`, `requireAdmin()`
- Protected routes: `/admin/*`, `/glow-girl/*`

## Commission & Compensation System

**7-Level Override Structure:**
- Personal sale: 25% commission
- Level 1-7 overrides: 10%, 5%, 4%, 3%, 2%, 1%, 1%
- Referral match: 10% of referred Glow Girl's first-month commission (12-month window)
- Pod override: 5% from team members
- Monthly tier bonuses: 15 tiers from Starter to Top Seller

**Key flows:**
- Commissions start PENDING, held 14 days, then APPROVED
- Monthly settlement aggregates into payouts
- Ranks based on personal recruits + group volume (GV)
- Recursive RPC functions: `get_upline()`, `get_downline()`, `increment_gv()`

## Directory Structure

```
src/
  app/
    (auth)/           # Login, signup, OAuth callback
    (storefront)/     # Dynamic Glow Girl storefronts: /[slug], /[slug]/product/[productSlug]
    admin/            # Admin dashboard
    api/              # REST endpoints (payments, webhooks, cron, AI studio)
    glow-girl/        # Dashboard, AI Studio
    apply/            # Application workflow
    shop/             # Direct-to-consumer shop
  components/
    ui/               # Shadcn primitives
    [feature].tsx     # Feature components
  lib/
    actions/          # Server actions (auth, commissions, team, products, etc.)
    ai-studio/        # AI content generation (OpenAI)
    commissions/      # Commission calculation, rank updates, settlement
    fulfillment/      # Order fulfillment tracking
    supabase/         # Client/server factories, middleware
  types/
    database.ts       # All TypeScript types matching DB schema
  hooks/              # React hooks
  middleware.ts       # Next.js middleware

supabase/
  migrations/         # 19+ SQL migrations (schema, RLS, functions)
  seed.sql            # Sample data
```

## Key API Routes

**Payments:** `/api/square/*`, `/api/braintree/*`, `/api/paypal/*`
**Cron:** `/api/cron/approve-commissions`, `/api/cron/monthly-settlement`
**AI Studio:** `/api/ai-studio/generate`, `/api/ai-studio/analyze`, `/api/ai-studio/upload`
**Webhooks:** `/api/square/webhook`, `/api/braintree/webhook`, `/api/fulfillment/webhook`

## Key Server Actions (`src/lib/actions/`)

- `auth.ts` — signOut, updateRole
- `commissions.ts` — earnings summary, monthly commissions, approve/process payouts
- `team.ts` — pod data, team network (upline/downline)
- `glow-girl.ts` — application submit/review, profile creation, storefront publish
- `products.ts` — product CRUD
- `storefront.ts` — update storefront product selection
- `pods.ts` — pod management
- `fulfillment.ts` — fulfillment status updates
- `events.ts` — analytics event tracking

## Database Notes

- All sensitive tables have **RLS** (Row Level Security) enabled
- Service role bypasses RLS for webhooks/admin
- `pending_orders` table exists because Square lacks metadata support on payment links
- Reward points: append-only ledger (`reward_points_ledger`) with materialized balance
- Reward tiers: PEARL, OPAL, ROSE_QUARTZ, AMETHYST, SAPPHIRE, DIAMOND

## Glow Girl Membership Plans

- **Pro:** $200/mo — standard benefits
- **Elite:** $450/mo — premium benefits (free products, priority support, mentorship)
- Billing: monthly or annual
- Managed via Square subscriptions

## Environment Variables

Key env vars (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_PLAN_PRO_MONTHLY`, `SQUARE_PLAN_PRO_ANNUAL`, `SQUARE_PLAN_ELITE_MONTHLY`, `SQUARE_PLAN_ELITE_ANNUAL`
- `BRAINTREE_MERCHANT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY`
- `PAYPAL_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `FOUNDER_CODES` — comma-separated codes for first 10 founders (skip payment)
- `NEXT_PUBLIC_APP_URL`
- `SLACK_BOT_TOKEN`

## Common Gotchas

1. **Don't use Stripe** — it's deprecated. Square is the primary processor.
2. **Don't reference custom serums** — the product model has pivoted to a fixed catalog.
3. **Middleware handles OAuth** — code exchange happens in middleware, not a separate callback route (fixed for Vercel compatibility).
4. **Referral cookies:** `glow_ref` (sales attribution, 30-day), `glow_referral` (recruitment attribution)
5. **Commission hold:** 14-day hold period before PENDING → APPROVED.
6. **Types in `src/types/database.ts`** — keep these in sync with any migration changes.
7. **RLS policies** — any new tables need RLS policies added.
8. **`quiz_start` / `quiz_complete` events** — these are legacy event types from the old serum quiz. Current storefront tracks `storefront_view`, `add_to_cart`, `purchase`.
