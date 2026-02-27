# Glow Custom Serum

A premium creator commerce platform for custom skincare serums. Creators design signature serums, customers take a skin quiz, and get a personalized blend shipped to their door.

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (Postgres + Auth + Storage)
- **Payments**: Stripe (Checkout + Subscriptions)
- **Animations**: Framer Motion
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project ([supabase.com](https://supabase.com))
- Stripe account ([stripe.com](https://stripe.com))

### Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase and Stripe credentials.

3. **Database setup**

   Run the migrations in your Supabase SQL editor (or via CLI):
   ```
   supabase/migrations/00001_schema.sql
   supabase/migrations/00002_rls.sql
   ```

   Then run the seed data:
   ```
   supabase/seed.sql
   ```

4. **Supabase Storage**

   Create a public bucket called `brand-assets` in Supabase Storage.

5. **Stripe setup**

   - Create a Stripe account and get your API keys
   - Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
   - Listen for these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

   For local development, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Create an admin user**

   After signing up via the login page, update your profile role in Supabase:
   ```sql
   UPDATE profiles SET role = 'ADMIN' WHERE id = 'your-user-id';
   ```

## Routes

| Route | Description |
|-------|------------|
| `/` | Landing page |
| `/login` | Auth (magic link) |
| `/admin` | Admin dashboard (approve creators, view orders, analytics) |
| `/creator/onboarding` | Creator brand setup wizard |
| `/creator/dashboard` | Creator dashboard (products, analytics, orders) |
| `/creator/signature` | Create a new signature serum |
| `/{creatorSlug}` | Public storefront |
| `/{creatorSlug}/quiz` | Customer skin quiz |
| `/{creatorSlug}/product/{signatureSlug}` | Product detail page |
| `/{creatorSlug}/order-success` | Post-checkout confirmation |

## Product Model

- **Base Formula** (pick 1): Barrier Silk, Clear Gel, Glow Milk
- **Boosters** (pick 1-2): Calm, Pore, Dew, Even, Smooth, Prep
- **Texture** (optional): Silky, Gel, Milky
- **Scent** (optional): Fragrance-Free, Citrus, Vanilla

Only pre-validated combinations are allowed (compatibility tables in DB).

## Quiz Algorithm

The skin quiz maps answers to 6 need-scores: BARRIER, CLARIFY, BRIGHTEN, HYDRATE, SMOOTH, PREP.

1. Each answer adds points to 1-3 needs
2. Highest need picks the base formula
3. Top 1-2 needs pick boosters (subject to compatibility)
4. Texture and scent inferred from finish and sensitivity answers
5. If top booster pair is incompatible, falls back to next best allowed pair

## Deploy

Deploy to Vercel:
```bash
npx vercel
```

Set all environment variables in Vercel dashboard. Update `NEXT_PUBLIC_APP_URL` to your production domain.

## Manual QA Checklist

- [ ] Sign up via magic link
- [ ] Set user to ADMIN role, verify admin dashboard loads
- [ ] Set user to CREATOR role, complete onboarding wizard
- [ ] Verify creator storefront loads at `/{slug}`
- [ ] Create a signature serum product
- [ ] Verify product appears on storefront
- [ ] Complete the customer quiz, verify blend recommendation
- [ ] Verify Stripe checkout redirects correctly (test mode)
- [ ] Verify webhook creates order record
- [ ] Verify creator dashboard shows analytics
- [ ] Verify admin can approve/revoke creators
- [ ] Verify admin CSV export works
- [ ] Verify image uploads to Supabase Storage
- [ ] Test on mobile viewport

## Notes

- All cosmetic claims only — no disease/medical claims
- No fake reviews — placeholder for "creator testimonials coming soon"
- Subscription-first pricing with optional one-time purchase
- Products are base + booster pods shipped together, mixed by customer
