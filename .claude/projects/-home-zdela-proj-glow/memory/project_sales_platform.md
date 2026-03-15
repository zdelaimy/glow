---
name: 10-Week Sales Journey Platform Build
description: Multi-phase build of Glow Sales OS — training academy, product education, templates, AI studio enhancement, team tools. Tracks what's built and what remains.
type: project
---

## 10-Week Glow Journey — "$0 to $10K"

Building a full sales enablement platform for Glow Girls, structured as a 10-week guided journey.

**Why:** Glow Girls need training, templates, and product knowledge to sell effectively. Competitors like Monat have Market Partner Academy — we need parity. The $10K in 10 weeks framing drives urgency and retention.

### Week Structure (selling starts week 3):
1. Set Up & Believe — platform setup, product crash course, define your "why"
2. Know What You're Selling — product deep dives, talking points, practice pitch
3. Make Your First Sales — warm outreach, DM scripts, first content
4. Content That Sells — hooks, captions, AI Studio, story selling
5. DM Like a Pro — cold outreach, objection handling, follow-up
6. Grow Your Audience — IG/TikTok growth, hashtags, Reels, collabs
7. Go Live & Show Up — live selling, video scripts, camera confidence
8. Build Your Brand — personal branding, niche, storytelling
9. Build Your Team — recruiting, supporting Glow Babes, pod leadership
10. $10K & Beyond — review, optimize, scale, rank advancement

### What's Been Built (2026-03-13):

**Phase 1 — COMPLETE:**
- DB migration: `20260315000001_journey_platform.sql` (journey_weeks, journey_modules, journey_lessons, journey_progress, product_education, templates, template_favorites + RLS + 10 weeks seeded)
- TypeScript types added to `database.ts`
- Server actions: `journey.ts`, `templates.ts`
- Shared glow-girl layout with sidebar navigation (`layout.tsx` + `glow-girl-sidebar.tsx`)
- Dashboard header removed (shared layout handles it), My Sales/My Pod tabs moved to `/glow-girl/team`
- All new pages built and build-passing:
  - `/glow-girl/journey` — 10-week hub with progress tracker
  - `/glow-girl/journey/week/[num]` — week detail with modules/lessons
  - `/glow-girl/journey/lesson/[id]` — lesson page (video, content, resources, mark complete)
  - `/glow-girl/products` — product education hub
  - `/glow-girl/products/[slug]` — product detail (talking points, scripts, FAQs, objections, compliance)
  - `/glow-girl/templates` — searchable/filterable template library with favorites + copy
  - `/glow-girl/team` — My Pod + Team Network combined

### What Remains:
1. **Admin CMS** — New tabs on admin page for managing journey content, templates, product education
2. **Seed content** — Add modules/lessons to the 10 weeks, seed starter templates
3. **Dashboard journey widget** — Show journey progress on Overview tab
4. **Product education data** — Populate talking points, scripts, FAQs for existing products
5. **AI Studio enhancement** (Phase 4) — More generation types, product-aware, template-aware
6. **Leaderboard** (Phase 5) — Top sellers, gamification
7. **Onboarding checklist** (Phase 5) — New Glow Girl guided first steps

### How to apply:
When resuming this work, start with admin CMS (so content can be managed) or seed content (so pages aren't empty). The user wants video training sourced from Loom recordings (platform-specific) + curated YouTube (sales skills). Text-heavy lessons are fine to start.
