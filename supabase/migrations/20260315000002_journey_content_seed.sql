-- Seed: Journey Modules & Lessons (10-week content)
-- Each week gets 2 modules, each module gets 2-3 lessons
-- Videos are public YouTube URLs that the embed component auto-converts

-- ═══════════════════════════════════════════
-- Helper: temporary function to look up week ID
-- ═══════════════════════════════════════════
create or replace function _week_id(num int) returns uuid language sql stable as $$
  select id from journey_weeks where week_number = num;
$$;


-- ═══════════════════════════════════════════════════════════════
-- WEEK 1 — Set Up & Believe
-- ═══════════════════════════════════════════════════════════════

-- Module 1.1: Your Foundation
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000001-0001-4000-8000-000000000001', _week_id(1), 'Your Foundation', 'Set up your storefront, learn the dashboard, and get your links ready to share.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000001-0001-4000-8000-000000000001',
 'Welcome to Glow — Your Journey Starts Now',
 'An introduction to the Glow ambassador program and what the next 10 weeks will look like.',
 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
 '## Welcome, Glow Girl!

You made an incredible decision joining Glow Beauty. Over the next 10 weeks, you''re going to build a real business — one post, one conversation, one sale at a time.

### What to Expect

- **Weeks 1-3:** Foundation — set up, learn the products, make your first sales
- **Weeks 4-6:** Growth — content strategy, DM mastery, audience building
- **Weeks 7-9:** Scale — go live, build your brand, recruit your team
- **Week 10:** $10K and beyond — review, optimize, and plan your future

### Your First Action Steps

- Log into your Glow Girl dashboard and explore every tab
- Set up your storefront — choose your products, write your bio, upload a photo
- Share your storefront link with 3 people today (just to test it!)

### Mindset Check

The #1 thing that separates successful ambassadors from those who quit? **They treat this like a business from Day 1.** Block time on your calendar. Set a daily routine. Show up consistently.

You don''t need to be perfect. You just need to start.',
 '[{"label": "Glow Girl Quick Start Checklist", "url": "#", "type": "link"}]',
 12, 1),

('a1000001-0001-4000-8000-000000000001',
 'Setting Up Your Storefront',
 'Walk through your Glow Girl dashboard and get your personalized storefront live.',
 'https://www.youtube.com/watch?v=oCeMOGmg42I',
 '## Your Storefront Is Your Digital Shop

Your Glow storefront is where customers browse products and place orders — all credited to you. Let''s get it looking amazing.

### Step-by-Step Setup

- **Profile Photo:** Use a clear, well-lit headshot. Smile! This builds trust.
- **Bio:** Keep it 2-3 sentences. Who are you? Why do you love Glow? What can customers expect?
- **Product Selection:** Choose which products to feature. Start with the ones you personally use and love.
- **Custom URL:** Your storefront link is your money link. Memorize it. Put it everywhere.

### Where to Share Your Link

- Instagram bio
- TikTok bio
- Facebook profile
- Email signature
- Text messages when recommending products

### Pro Tip

Your storefront is a living thing — update your featured products as you try new ones. Authenticity sells more than any script ever will.',
 '[{"label": "Storefront Setup Guide", "url": "#", "type": "link"}]',
 10, 2),

('a1000001-0001-4000-8000-000000000001',
 'Understanding Your Commission Structure',
 'Learn exactly how you earn — from personal sales to team overrides.',
 'https://www.youtube.com/watch?v=Ll6-MmhRSUo',
 '## How You Get Paid

Understanding your compensation plan is essential. Here''s the breakdown:

### Personal Sales Commission: 25%

Every product you sell, you earn 25%. That''s $20 on an $80 Glow Serum, $11 on a $44 Beauty Gummies, etc.

### Referral Match: 10%

When you recruit a new Glow Girl, you earn 10% of their first-month commissions. This is a one-time bonus that rewards you for mentoring.

### Team Overrides (Levels 1-7)

As your team grows, you earn overrides on their sales:
- Level 1 (your direct recruits): 10%
- Level 2: 5%
- Level 3: 4%
- Level 4: 3%
- Level 5: 2%
- Level 6: 1%
- Level 7: 1%

### Pod Override: 5%

Your pod is your inner circle — team members you actively mentor. You earn an extra 5% from their sales.

### Monthly Tier Bonuses

Hit sales milestones to unlock bonus payouts. There are 15 tiers from Starter to Top Seller.

### Important Notes

- Commissions are held for 14 days (to account for returns), then approved
- Monthly settlement aggregates all approved commissions into your payout
- Focus on building genuine relationships, not just numbers',
 '[{"label": "Commission Calculator", "url": "#", "type": "link"}, {"label": "Rank Advancement Guide", "url": "#", "type": "link"}]',
 15, 3);

-- Module 1.2: Believe In Yourself
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000001-0001-4000-8000-000000000002', _week_id(1), 'Believe In Yourself', 'Develop the mindset of a successful entrepreneur.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000001-0001-4000-8000-000000000002',
 'The Entrepreneurial Mindset',
 'Why mindset is the #1 predictor of success in this business.',
 'https://www.youtube.com/watch?v=0Hm4cXUCmgE',
 '## Your Mindset Determines Your Income

This isn''t just motivational fluff — research consistently shows that mindset is the biggest predictor of entrepreneurial success.

### The 3 Mindset Shifts

**1. From Employee to CEO**
You''re not clocking in. No one is going to tell you what to do today. You decide your schedule, your income, and your effort. That''s freedom — and responsibility.

**2. From Perfection to Progress**
Your first Instagram post won''t be amazing. Your first DM might be awkward. That''s okay. Done is better than perfect. The only content that doesn''t work is the content you don''t post.

**3. From Fear of Judgment to Mission-Driven**
People will have opinions. Some friends might not "get it." But you''re building something real. Focus on the customers you''re helping, not the critics on the sidelines.

### Daily Mindset Practice

Start each morning with these:
- Write down your "why" (your deeper reason for doing this)
- Set your top 3 income-producing activities for the day
- Visualize yourself at your first rank advancement

### Your Why Matters

When things get hard (and they will), your "why" is what keeps you going. Is it financial freedom? More time with your kids? Paying off debt? Travel? Write it down and put it where you''ll see it every day.',
 '[{"label": "Daily Mindset Journal Template", "url": "#", "type": "link"}]',
 12, 1),

('a1000001-0001-4000-8000-000000000002',
 'Define Your Goals & Weekly Schedule',
 'Set your 10-week income goal and build a daily routine that gets you there.',
 'https://www.youtube.com/watch?v=XpKvs-apvOs',
 '## Goals Without a Plan Are Just Wishes

Let''s turn your Glow ambitions into a concrete plan.

### Setting Your 10-Week Goal

Be specific. "Make money" isn''t a goal. Try:
- "Earn $1,000 in commissions by Week 5"
- "Make 3 sales per week by Week 4"
- "Recruit my first team member by Week 9"

### Reverse-Engineer Your Sales Goal

If your goal is $2,500 in commissions over 10 weeks:
- That''s $250/week in commissions
- At 25% commission, that''s $1,000/week in sales
- Average order ~$80 = about 12-13 orders per week
- If 1 in 5 conversations leads to a sale, you need ~65 conversations per week
- That''s about 9-10 conversations per day

**Suddenly it feels doable, right?**

### Your Daily Power Hour

Block 1 hour per day (minimum) for income-producing activities:
- **15 min:** Post content (story, reel, or post)
- **30 min:** DM outreach (new conversations + follow-ups)
- **15 min:** Engage on others'' content (comment, like, share)

### Weekly Planning

Every Sunday, plan your week:
- Content themes for each day
- DM outreach targets
- Any lives or events
- Personal product usage to share about',
 '[{"label": "Weekly Planning Worksheet", "url": "#", "type": "link"}, {"label": "Goal Calculator Spreadsheet", "url": "#", "type": "link"}]',
 15, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 2 — Know What You're Selling
-- ═══════════════════════════════════════════════════════════════

-- Module 2.1: Product Deep Dive
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000002-0001-4000-8000-000000000001', _week_id(2), 'Product Deep Dive', 'Learn every product inside and out — ingredients, benefits, and who it''s for.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000002-0001-4000-8000-000000000001',
 'The Glow Product Line — Full Breakdown',
 'A comprehensive look at every product in the Glow catalog.',
 'https://www.youtube.com/watch?v=BuuGXEeMjWM',
 '## Know Your Products Like the Back of Your Hand

Confidence sells. When you genuinely know and love what you''re selling, it comes through in every conversation.

### How to Study Each Product

For every product in the Glow lineup, you should know:

- **What it does** (the primary benefit in one sentence)
- **Key ingredients** (2-3 hero ingredients and why they work)
- **Who it''s for** (age range, skin/hair type, lifestyle)
- **How to use it** (directions, frequency, tips)
- **Price point** and value proposition
- **Common questions** people ask about it

### The Product Knowledge Framework

Use this format to internalize each product:

**"[Product Name] is a [category] that [primary benefit]. It''s made with [key ingredient 1] and [key ingredient 2], which [what they do]. It''s perfect for [target customer]. I love it because [personal story]."**

### Example:
"The Glow Serum is a daily facial serum that gives you that lit-from-within radiance. It''s made with hyaluronic acid and vitamin C, which hydrate and brighten your skin. It''s perfect for anyone who wants glowy, healthy-looking skin without a 10-step routine. I love it because I noticed a difference in my skin within the first week."

### Action Item

Write out the Product Knowledge Framework for every product in your storefront. Practice saying each one out loud until it feels natural — not scripted.',
 '[{"label": "Product Knowledge Cheat Sheet", "url": "#", "type": "link"}]',
 15, 1),

('a1000002-0001-4000-8000-000000000001',
 'Understanding Ingredients & Clean Beauty',
 'Learn to speak confidently about ingredients and what makes Glow products premium.',
 'https://www.youtube.com/watch?v=oBSandHijDc',
 '## Why Ingredients Matter

Today''s beauty consumer is more educated than ever. They read labels, Google ingredients, and want to know what they''re putting on their skin. This is actually great news for you — because Glow products are made with premium, effective ingredients.

### How to Talk About Ingredients

You don''t need to be a chemist. You need to be a translator.

**Instead of:** "This contains hyaluronic acid, a glycosaminoglycan that attracts water molecules"
**Say:** "This has hyaluronic acid — it''s like a drink of water for your skin. It pulls moisture in and holds it there, so your skin stays plump and hydrated all day."

### Key Ingredient Talking Points

**Hyaluronic Acid** — Hydration magnet. Holds 1000x its weight in water. Plumps fine lines.

**Vitamin C** — Brightening powerhouse. Evens skin tone, fights dark spots, protects against environmental damage.

**Niacinamide** — The multitasker. Minimizes pores, balances oil, reduces redness.

**Retinol** — The gold standard for anti-aging. Boosts cell turnover, smooths texture, reduces wrinkles.

**Peptides** — Building blocks for firm skin. Signal your skin to produce more collagen.

### Clean Beauty Positioning

When someone asks "Is this clean?":
- Lead with what IS in the products (effective, researched ingredients)
- Mention what''s NOT (harsh sulfates, parabens, synthetic fragrances)
- Don''t bash other brands — just highlight what makes Glow different

### Handle the "I Can Get That at Sephora" Objection

"Totally! You can find great products everywhere. What I love about Glow is [personal result]. Plus, when you buy through me, you''re supporting a small business and you get my personal recommendations — I''m basically your skincare concierge."',
 '[{"label": "Ingredient Glossary", "url": "#", "type": "link"}, {"label": "Clean Beauty FAQ", "url": "#", "type": "link"}]',
 15, 2);

-- Module 2.2: Perfect Your Pitch
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000002-0001-4000-8000-000000000002', _week_id(2), 'Perfect Your Pitch', 'Practice pitching each product naturally and handling common objections.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000002-0001-4000-8000-000000000002',
 'The 30-Second Elevator Pitch',
 'Learn to explain Glow and your favorite products in 30 seconds or less.',
 'https://www.youtube.com/watch?v=2b3xG_YjgvI',
 '## Your Elevator Pitch

You should be able to explain what you do and what you sell in under 30 seconds. This comes up everywhere — at the gym, at pickup, at a party, in DMs.

### The Formula

**"I''m a [role] with [brand]. I help [who] [achieve what] using [how]. My favorite product is [product] because [personal result]."**

### Examples

**Casual (friend asks "what''s that?"):**
"Oh this is the Glow Serum — it''s seriously the best thing I''ve ever put on my face. I actually sell Glow products now. Want me to send you my link?"

**Networking (someone asks what you do):**
"I''m a beauty ambassador with Glow Beauty! I help people find premium skincare and makeup that actually works. I got hooked on their serum and now I sell the whole line. Do you have a skincare routine you love?"

**Social Media (bio or intro):**
"Skincare obsessed. Glow Beauty ambassador helping you get your best skin ever. Shop my faves below."

### Practice Makes Profit

Record yourself saying your pitch. Watch it back. Does it sound natural? Genuine? Would YOU want to learn more? Adjust until it feels like *you*, not a script.

### The Key: Always End With a Question

Notice each pitch ends with a question. This keeps the conversation going. Never pitch and walk away — pitch and engage.',
 '[{"label": "Pitch Practice Script Cards", "url": "#", "type": "link"}]',
 10, 1),

('a1000002-0001-4000-8000-000000000002',
 'Handling Objections With Confidence',
 'The most common objections you''ll hear and exactly how to respond.',
 'https://www.youtube.com/watch?v=VH3mbxkCNMk',
 '## Objections Are Just Questions in Disguise

When someone objects, they''re not saying "no forever" — they''re saying "I need more information" or "I''m not sure yet." Here''s how to handle the most common ones.

### Objection: "It''s too expensive"

**Response:** "I totally get it — I thought the same thing at first. But here''s how I look at it: the Glow Serum is $80 and lasts about 2 months. That''s $1.33/day for visibly better skin. Most people spend more than that on coffee. And unlike coffee, this compounds — your skin keeps getting better."

### Objection: "I already have a routine"

**Response:** "That''s awesome that you take care of your skin! I''m not saying ditch everything — most of my customers just add one Glow product to what they already do. The serum layers perfectly with any routine. Want to try just one thing and see?"

### Objection: "I need to think about it"

**Response:** "Of course! No pressure at all. Can I send you some before-and-after photos from customers with similar skin to yours? Sometimes seeing real results helps with the decision."

### Objection: "Does this stuff actually work?"

**Response:** "I was skeptical too! Here''s what happened with my skin... [share personal result]. I can also send you some customer reviews if you want to see what others are saying."

### Objection: "Is this an MLM?"

**Response:** "I''m an independent ambassador — think of it like being an affiliate creator. I share products I genuinely love and earn a commission when people buy through my link. I don''t push anyone to sell — I just recommend products. Sound fair?"

### The Golden Rule

**Never argue.** Agree first ("I totally get it"), then redirect. Make the customer feel heard. Some people need time — follow up in 3-5 days with a soft touch ("Hey! Just checking in — any questions about that serum?").',
 '[{"label": "Objection Handling Cheat Sheet", "url": "#", "type": "link"}]',
 15, 2),

('a1000002-0001-4000-8000-000000000002',
 'Role-Play: Practice Real Conversations',
 'Scripts for common selling scenarios — practice with a friend or in the mirror.',
 'https://www.youtube.com/watch?v=_JE_dBaDHlY',
 '## Practice Makes Permanent

The best sellers aren''t born — they practice. This lesson gives you real conversation scripts to rehearse.

### Scenario 1: A Friend Asks About Your Skin

**Them:** "Your skin looks amazing lately, what are you using?"
**You:** "Aw thank you! I''ve been using this Glow Serum — it''s got vitamin C and hyaluronic acid. I actually became an ambassador because I love it so much. Want me to send you the link?"
**Them:** "Sure!"
**You:** [send link] "Here you go! The serum is my #1 rec but the Beauty Gummies are incredible too. Let me know if you have any questions!"

### Scenario 2: Cold DM on Instagram

**You:** "Hey [name]! I love your content — your skin always looks so good. Quick question: are you open to trying new skincare? I have something I think you''d love."
**Them:** "What is it?"
**You:** "I''m a Glow Beauty ambassador. We have this serum that''s been blowing up — it''s $80 and customers are saying it rivals products twice the price. Want me to share some info?"

### Scenario 3: Someone Shows Interest But Doesn''t Buy

**Day 1:** Initial conversation (share product info)
**Day 3:** "Hey! Just wanted to follow up — did you get a chance to look at the Glow products? Happy to answer any questions!"
**Day 7:** "Hi [name]! Just wanted to let you know we have [mention any current promotion]. No pressure — just didn''t want you to miss out!"

### How to Practice

- Grab a friend and role-play these scenarios
- If no one''s available, practice in front of a mirror or record yourself
- Repeat each script 5 times until it sounds natural, not robotic
- Then put your phone down and go have a REAL conversation',
 '[{"label": "Conversation Script Templates", "url": "#", "type": "link"}, {"label": "Follow-Up Sequence Templates", "url": "#", "type": "link"}]',
 12, 3);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 3 — Make Your First Sales
-- ═══════════════════════════════════════════════════════════════

-- Module 3.1: Warm Market Outreach
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000003-0001-4000-8000-000000000001', _week_id(3), 'Warm Market Outreach', 'Start with the people who already know, like, and trust you.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000003-0001-4000-8000-000000000001',
 'Your Warm Market List',
 'Build a list of 100+ people to reach out to this week.',
 'https://www.youtube.com/watch?v=8zBSPGJdkSs',
 '## Start With People Who Already Trust You

Your warm market is the fastest path to your first sale. These are people who know you, like you, and trust your opinion.

### Building Your List of 100

Go through your phone contacts, social media followers, and think about:
- **Friends and family** (yes, even distant ones)
- **Coworkers** (current and former)
- **Parents from your kids'' activities**
- **Gym friends, neighbors, church community**
- **People who''ve liked your beauty/skincare posts**
- **Anyone who''s ever asked about your skin, hair, or makeup**

### How to Categorize Your List

**Hot (reach out first):** People who love beauty, have commented on your look, or have asked about products before.

**Warm:** Friends and family who support you in general — they may buy just because they believe in you.

**Cool:** Acquaintances — you''ll need to build more rapport first.

### The Approach (Don''t Be Weird)

**DON''T:** "Hey girl! It''s been a while! I have this amazing opportunity..."
**DO:** Be genuine. Share your excitement naturally.

**Example:** "Hey [name]! So I just started something new I''m really excited about — I became an ambassador for this skincare brand called Glow. I''ve been using their serum and I''m obsessed. Would you be open to checking it out?"

### This Week''s Goal

Reach out to at least 20 people from your warm list. Not a mass copy-paste — personalized, genuine messages.',
 '[{"label": "Warm Market List Builder", "url": "#", "type": "link"}, {"label": "DM Templates for Warm Outreach", "url": "#", "type": "link"}]',
 15, 1),

('a1000003-0001-4000-8000-000000000001',
 'The Art of the Soft Sell',
 'How to recommend products without being pushy.',
 'https://www.youtube.com/watch?v=llPGdQGMcFc',
 '## Nobody Likes Being Sold To — But Everyone Loves a Good Recommendation

Think about the last product you bought because a friend raved about it. That''s what you''re doing. You''re not selling — you''re sharing.

### The Soft Sell Framework

**1. Lead With Your Story**
"I''ve been struggling with dull skin for years and finally found something that works..."

**2. Show, Don''t Tell**
Post a story using the product. Share a before/after. Let people see the results naturally.

**3. Create Curiosity**
Instead of "Buy this serum!", try "My skin has never looked like this 😳 DM me if you want to know what I changed."

**4. Make It Easy**
When someone expresses interest: "Want me to send you the link? You can browse everything on my page!"

### What NOT to Do

- Don''t spam your friends with links
- Don''t post 10 sales posts in a row
- Don''t add people to groups without permission
- Don''t chase people who say no
- Don''t apologize for selling ("Sorry to bother you but...")

### The 80/20 Rule for Social Media

- **80% value content:** Tips, education, entertainment, personal life
- **20% selling content:** Product features, testimonials, offers, links

People follow you for YOU. They buy because they trust you.',
 '[{"label": "80/20 Content Calendar Template", "url": "#", "type": "link"}]',
 12, 2);

-- Module 3.2: Closing Your First Sale
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000003-0001-4000-8000-000000000002', _week_id(3), 'Closing Your First Sale', 'Turn interest into orders with proven closing techniques.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000003-0001-4000-8000-000000000002',
 'From "I''m Interested" to "I''ll Take It"',
 'Simple closing techniques that feel natural.',
 'https://www.youtube.com/watch?v=jaCRQ3ij6tY',
 '## Closing Isn''t Sleazy — It''s Helping People Decide

Most people who express interest genuinely want to buy. They just need a little nudge. Your job is to make it easy.

### 5 Natural Closing Techniques

**1. The Assumptive Close**
"Which one do you want to start with — the serum or the full glow kit?"
(Notice: not "Do you want to buy?" but "Which one?")

**2. The Urgency Close (only when real)**
"We''re running a promo this week — 15% off your first order. Want me to grab your link before it ends?"

**3. The Social Proof Close**
"This is our bestseller — I had 3 people order it just this week. Want me to send you the link?"

**4. The Personal Recommendation Close**
"Based on what you told me about your skin, I''d start with the serum. It''s $80 and it''ll last you about 2 months. Want me to send the link?"

**5. The Follow-Up Close**
"Hey! Just circling back — I know you were interested in the serum. Any questions I can answer? Happy to help you pick!"

### After They Buy

- Send a thank you message
- Ask them to let you know when it arrives
- Follow up in 2 weeks to ask how they like it
- Happy customers become repeat customers AND referral sources

### Your First Sale Will Change Everything

There''s something magical about seeing that first commission hit. It makes everything real. Push through any awkwardness — your first sale is waiting.',
 '[{"label": "Closing Scripts Collection", "url": "#", "type": "link"}]',
 12, 1),

('a1000003-0001-4000-8000-000000000002',
 'Creating a Follow-Up System',
 'Most sales happen on the 2nd-5th touch. Build a system that follows up for you.',
 'https://www.youtube.com/watch?v=CLFejIqDm6Q',
 '## The Fortune Is in the Follow-Up

80% of sales require 5+ follow-ups, but most people give up after 1. This is where you win.

### The 7-Day Follow-Up Sequence

**Day 1:** Initial conversation + share product info/link
**Day 3:** Check-in — "Hey! Did you get a chance to look? Any questions?"
**Day 5:** Value add — Share a testimonial, before/after, or tip related to their interest
**Day 7:** Soft close — "Just wanted to check in one more time! The offer [mention any promo] ends soon. No pressure either way!"

### Tracking Your Conversations

Use a simple system to track where each prospect is:
- **New:** Haven''t reached out yet
- **Contacted:** Sent initial message
- **Interested:** They responded positively
- **Follow-Up:** Need to check back in
- **Customer:** They bought!
- **Not Now:** Said no for now (circle back in 30 days)

### Follow-Up DM Templates

**After sharing link (Day 3):**
"Hey [name]! Just checking in — did you have a chance to check out the Glow products? I''m happy to help if you have any questions 😊"

**After they said "I''ll think about it" (Day 5):**
"Hi [name]! No pressure at all, but I wanted to share this — [send testimonial/before-after]. One of my customers just sent me this and I thought of you!"

**Re-engagement (Day 7-14):**
"Hey [name]! Quick heads up — [promotion/new product/seasonal reason]. Thought of you! Let me know if you want details."

### The Golden Rule of Follow-Up

Be helpful, not annoying. Every follow-up should add value, not just ask "Did you buy yet?"',
 '[{"label": "Follow-Up Tracker Spreadsheet", "url": "#", "type": "link"}, {"label": "Follow-Up DM Swipe File", "url": "#", "type": "link"}]',
 15, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 4 — Content That Sells
-- ═══════════════════════════════════════════════════════════════

-- Module 4.1: Content Strategy
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000004-0001-4000-8000-000000000001', _week_id(4), 'Content Strategy', 'Build a content plan that attracts customers to you.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000004-0001-4000-8000-000000000001',
 'The Content Pillars Framework',
 'Create a content strategy that''s sustainable and sells without being salesy.',
 'https://www.youtube.com/watch?v=HjBo--1n8S4',
 '## Content Is Your 24/7 Salesperson

While you sleep, your content is working. While you''re at brunch, your Reel is getting views. Great content does the selling for you.

### Your 4 Content Pillars

**1. Education (30%)**
Teach something. Skincare tips, ingredient spotlights, "did you know" facts.
*Example: "3 ingredients you NEED in your serum (and why)"*

**2. Entertainment (30%)**
Be relatable, funny, or inspiring. Trends, day-in-my-life, hot takes.
*Example: "POV: Your friend asks for skincare advice and you pull out a full presentation"*

**3. Personal (20%)**
Let people know YOU. Behind the scenes, your story, your routine, your wins.
*Example: "Why I quit my 9-5 to sell skincare (and what happened next)"*

**4. Promotional (20%)**
Direct product features, testimonials, offers, link sharing.
*Example: "This $80 serum replaced my entire skincare shelf — here''s why"*

### Weekly Content Calendar

| Day | Pillar | Format |
|-----|--------|--------|
| Mon | Education | Carousel/Reel |
| Tue | Entertainment | Story series |
| Wed | Personal | Reel/Post |
| Thu | Education | Story tips |
| Fri | Promotional | Product feature |
| Sat | Entertainment | Trend/fun |
| Sun | Personal + CTA | Week recap + link |

### The Hook Formula

Your first line or first 3 seconds determine everything:
- "Stop doing this to your skin..."
- "The $80 product that replaced my entire routine"
- "Nobody talks about this skincare mistake"
- "I was today years old when I learned..."',
 '[{"label": "30-Day Content Calendar Template", "url": "#", "type": "link"}, {"label": "Hook Formula Swipe File", "url": "#", "type": "link"}]',
 15, 1),

('a1000004-0001-4000-8000-000000000001',
 'Using AI Studio to Batch-Create Content',
 'Use Glow''s built-in AI Studio to generate captions, scripts, and content ideas.',
 'https://www.youtube.com/watch?v=4Y1ip85r07A',
 '## Work Smarter, Not Harder

Glow''s AI Studio is your secret weapon. It helps you generate content ideas, write captions, and create scripts — all in your voice.

### What AI Studio Can Do

- **Generate Instagram captions** for any product
- **Write Reel scripts** with hooks and CTAs
- **Create story sequences** for product launches
- **Brainstorm content ideas** based on trends
- **Draft DM scripts** for different scenarios

### How to Use It Effectively

**Step 1:** Go to your Glow Girl Dashboard → AI Studio

**Step 2:** Choose what you need:
- Caption for a product post
- Script for a Reel or TikTok
- Story sequence for the week
- DM templates

**Step 3:** Give it context:
- Which product you''re featuring
- Your tone (casual, professional, funny)
- Your audience (age, interests, pain points)

**Step 4:** Edit the output to sound like YOU. AI gives you 80% — you add the personal touch.

### Batch Content Creation Day

Set aside 2 hours on Sunday:
1. Plan your content for the week (use the calendar from the last lesson)
2. Use AI Studio to draft all your captions
3. Film your Reels/TikToks in one session
4. Schedule everything using your phone''s scheduling features

### Pro Tip

Save your best AI-generated captions as templates. Over time, you''ll build a swipe file of proven content that you can remix.',
 '[{"label": "AI Studio Quick Start Guide", "url": "#", "type": "link"}]',
 12, 2);

-- Module 4.2: Creating Content
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000004-0001-4000-8000-000000000002', _week_id(4), 'Creating Reels & TikToks', 'Hands-on video creation for Instagram Reels and TikTok.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000004-0001-4000-8000-000000000002',
 'Reels That Go Viral (or at Least Get Sales)',
 'The anatomy of a high-performing Reel for beauty products.',
 'https://www.youtube.com/watch?v=MPPyPayGqKM',
 '## Short-Form Video Is the #1 Growth Tool

Reels and TikToks are how new people find you. Here''s how to make them work for your beauty business.

### The Anatomy of a Great Reel

**Hook (0-3 seconds):** Stop the scroll. Text overlay + movement.
- "The product dermatologists don''t want you to know about"
- "Watch my skin transform in 30 days"
- "Rating every product in my skincare routine"

**Value (3-20 seconds):** Deliver the content. Keep it fast-paced.
- Show the product, demonstrate it, share results
- Use trending audio when it fits
- Text overlays for people watching without sound

**CTA (last 2-3 seconds):** Tell them what to do next.
- "Link in bio!"
- "Comment GLOW and I''ll send you the link"
- "Follow for more skincare tips"
- "Save this for later"

### 10 Reel Ideas That Work for Beauty

1. Get Ready With Me (GRWM) using Glow products
2. Before/After with the product
3. "What I ordered vs. what I got" (unboxing)
4. Skincare routine breakdown
5. "Rating my skincare 1-10"
6. Product comparison (Glow vs. expensive alternative)
7. "3 things I wish I knew about skincare sooner"
8. Day-in-my-life as a Glow Girl
9. Customer testimonial reaction
10. "This or that" skincare edition

### Filming Tips

- Natural lighting is everything (face a window)
- Clean background or aesthetic setup
- Hold your phone at eye level
- Film in 9:16 (vertical)
- Record in natural light between 10am-2pm for best quality

### Don''t Overthink It

Your phone, natural light, and 60 seconds. That''s all you need. Hit record.',
 '[{"label": "50 Reel Ideas for Beauty Sellers", "url": "#", "type": "link"}, {"label": "Reel Script Templates", "url": "#", "type": "link"}]',
 15, 1),

('a1000004-0001-4000-8000-000000000002',
 'Story Selling — Your Secret Weapon',
 'How to use Instagram/TikTok Stories to drive daily sales.',
 'https://www.youtube.com/watch?v=M5PpfNJgfnY',
 '## Stories Are Where Trust (and Sales) Happen

Your feed gets you discovered. Your Stories make the sale. Stories feel intimate, personal, and real — that''s why they convert.

### The Daily Story Framework

Think of your Stories as a mini TV show. Each day has a flow:

**Morning (2-3 slides):**
- Coffee + mindset or gratitude
- Tease what''s coming today

**Midday (3-5 slides):**
- Product in use (skincare routine, makeup application)
- Educational tip
- Poll or question sticker for engagement

**Evening (2-3 slides):**
- Results/recap
- Testimonial or DM screenshot (with permission)
- Soft CTA: "Link in bio" or "DM me for details"

### Story Selling Techniques

**The Before/During/After Sequence:**
Story 1: "About to do my skincare routine..." (before)
Story 2: Product application video (during)
Story 3: "And THIS is why I love this serum" [close-up of glowy skin] (after)

**The Testimonial Share:**
Story 1: "Got this message and I''m crying 😭" [screenshot of happy customer DM]
Story 2: "This is why I do what I do. [Product name] in my bio if you want to try it!"

**The Behind-the-Scenes:**
Story 1: "Packing orders today! Thank you guys so much" [show dashboard/orders]
Story 2: "This month has been insane — [share a win]"

### Engagement Stickers to Use

- **Poll:** "Serum or moisturizer first?" (drives engagement)
- **Question box:** "What''s your biggest skincare struggle?" (gives you content ideas)
- **Quiz:** "True or false: you need SPF indoors" (education)
- **Slider:** "How much would you pay for glowing skin?" (fun)',
 '[{"label": "Story Sequence Templates", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 5 — DM Like a Pro
-- ═══════════════════════════════════════════════════════════════

-- Module 5.1: DM Openers
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000005-0001-4000-8000-000000000001', _week_id(5), 'DM Openers & Strategy', 'How to start conversations that lead to sales.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000005-0001-4000-8000-000000000001',
 'The DM Sales Machine',
 'How top sellers use DMs to consistently generate sales every single day.',
 'https://www.youtube.com/watch?v=BSwknFMGJeI',
 '## DMs Are Where the Money Is

Content gets attention. DMs get sales. The most successful Glow Girls treat their inbox like a sales pipeline.

### The DM Mindset Shift

You''re not "sliding into DMs" — you''re starting conversations. You''re not being pushy — you''re being helpful. If you genuinely believe your products can help someone, it''s selfish NOT to reach out.

### Who to DM

**High Priority:**
- People who engage with your content (likes, comments, saves)
- People who view your stories consistently
- People who follow beauty/skincare accounts
- People who post about skincare struggles

**Medium Priority:**
- New followers (welcome them!)
- People who engage with similar brands
- Friends of friends who might be interested

### The 3-Message Framework

**Message 1: Connect (no selling)**
"Hey [name]! I love your [specific thing — their style, a recent post, etc.]. Just wanted to say hi!"

**Message 2: Transition (subtle)**
After they respond: "Thanks! By the way, I noticed you post a lot about skincare — are you pretty into it? I just started working with this brand and I''m obsessed."

**Message 3: Offer (only if they show interest)**
"It''s called Glow Beauty — want me to send you some info? I think you''d love [specific product based on what you know about them]."

### Daily DM Goals

- **10 new conversations** started per day
- **Follow up** with 5 existing conversations
- **Respond to all DMs** within 2 hours during business hours

### Track Everything

Note who you''ve messaged, where they are in the conversation, and when to follow up. Your future commissions depend on your follow-up game.',
 '[{"label": "DM Tracking Spreadsheet", "url": "#", "type": "link"}, {"label": "DM Opener Templates (25+)", "url": "#", "type": "link"}]',
 15, 1),

('a1000005-0001-4000-8000-000000000001',
 'Cold DMs That Don''t Feel Cold',
 'Reach beyond your warm market with cold outreach that actually works.',
 'https://www.youtube.com/watch?v=R0C2pmsmP10',
 '## Expanding Beyond Your Warm Market

Your warm market got you started. Cold outreach scales your business. But cold doesn''t have to mean impersonal.

### The Warm-Up Method

Before you DM someone cold, warm them up:
1. Follow them
2. Like 2-3 of their recent posts
3. Leave a genuine comment on something
4. Watch and react to their stories
5. THEN send a DM (they''ll recognize your name)

### Cold DM Templates That Work

**The Compliment Opener:**
"Hey [name]! Your skin is literally goals 😍 Can I ask what products you use? I''m always looking for new recommendations!"

**The Mutual Interest Opener:**
"Hey! I saw we both follow [beauty account] — their content is so good. Are you into skincare? I''d love to swap recommendations!"

**The Value-First Opener:**
"Hey [name]! I saw your post about dealing with [skin concern]. I actually have a tip that helped me with the same thing — want to hear it?"

**The Story Response:**
When someone posts a story about skincare, beauty, or self-care: "Omg I love [thing they posted]! Have you tried [related Glow product]? It''s been a game-changer for me."

### What NOT to Do With Cold DMs

- Don''t send a paragraph on the first message
- Don''t lead with "I have an amazing opportunity"
- Don''t copy-paste the same message to everyone (people can tell)
- Don''t pitch in the first message — build rapport first
- Don''t get discouraged by low response rates (10-20% is normal)

### Numbers Game

If you DM 10 cold prospects per day:
- 2-3 will respond
- 1 will show interest
- In a week, that''s 7 interested prospects
- If 30% buy, that''s 2+ sales per week from cold outreach alone',
 '[{"label": "Cold DM Scripts Library", "url": "#", "type": "link"}]',
 15, 2);

-- Module 5.2: Converting Conversations
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000005-0001-4000-8000-000000000002', _week_id(5), 'Converting Conversations', 'Turn DM conversations into sales with proven frameworks.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000005-0001-4000-8000-000000000002',
 'The Conversation-to-Sale Pipeline',
 'A step-by-step framework for guiding DM conversations from hello to checkout.',
 'https://www.youtube.com/watch?v=Yc2bVJJBrFc',
 '## Every Sale Starts With a Conversation

Here''s the pipeline that top Glow Girls use:

### Stage 1: Connect (Messages 1-3)
Build rapport. Ask questions. Find common ground.
- "What do you do for work?"
- "How long have you been into skincare?"
- "What''s your biggest skin frustration right now?"

### Stage 2: Qualify (Messages 4-6)
Understand their needs so you can recommend the right product.
- "What does your current routine look like?"
- "What results are you looking for?"
- "Have you tried anything like [product category] before?"

### Stage 3: Present (Messages 7-9)
Share the solution that matches their needs.
- "Based on what you told me, I think [product] would be perfect for you because [reason]."
- Share a photo, before/after, or testimonial relevant to their concern
- "It''s $[price] and lasts about [timeframe]"

### Stage 4: Close (Message 10+)
Ask for the sale naturally.
- "Want me to send you the link to grab it?"
- "I can send you my storefront — you can browse everything there"
- If they hesitate: "No pressure at all! Want me to send you some customer reviews to help you decide?"

### Stage 5: Follow Up
If they don''t buy right away:
- Day 3: Soft check-in
- Day 7: Share relevant content or testimonial
- Day 14: "Hey! Just wanted to circle back..."
- Day 30: "Hi [name]! Been thinking about you — [reason to reconnect]"

### Key Principle: Ask, Don''t Tell

The best salespeople ask great questions. Let the customer talk themselves into buying by understanding their own needs.',
 '[{"label": "DM Pipeline Tracker", "url": "#", "type": "link"}]',
 15, 1),

('a1000005-0001-4000-8000-000000000002',
 'Advanced Objection Handling in DMs',
 'Navigate tricky DM conversations and turn "no" into "not yet."',
 'https://www.youtube.com/watch?v=o_IhZq9E0Jo',
 '## DM Objections Hit Different

In person, you can read body language. In DMs, you only have text. Here''s how to handle objections in writing.

### The LAER Framework

**L — Listen:** Read their objection carefully. Don''t rush to respond.
**A — Acknowledge:** "I totally understand" or "That makes sense"
**E — Explore:** Ask a follow-up question to understand the real concern
**R — Respond:** Address the specific concern, not a generic one

### DM Objection Scripts

**"I can''t afford it right now"**
"Totally get it! Budget is real. Just so you know, [product] works out to about $[per day price] per day. But no rush — I''ll be here whenever the timing is right! Want me to let you know if we run any deals?"

**"I''m not sure it''ll work for my skin"**
"That''s such a fair concern! Can I ask what your skin type is? I can share results from customers with similar skin. Would seeing some before/afters help?"

**"Let me ask my partner"**
"Of course! Would it help if I sent you a quick summary you could share with them? Sometimes having the details makes the conversation easier."

**"I''ve been burned by products before"**
"Ugh, that''s the worst feeling. I was the same way — I''d tried so many things that didn''t work. What actually convinced me was [your personal story]. Everyone''s skin is different, but I can share what our customers are saying?"

**Radio Silence (they stopped responding)**
Wait 3-5 days, then: "Hey [name]! No worries at all if the timing isn''t right. I just wanted to share this [testimonial/result/tip] in case it''s helpful. Hope you''re having a great week!"

### The Biggest Mistake

Arguing or getting defensive. If someone says no, respect it gracefully: "Totally understand! If you ever change your mind, you know where to find me 😊"

A graceful no today often becomes a yes in 30 days.',
 '[{"label": "DM Objection Handling Guide", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 6 — Grow Your Audience
-- ═══════════════════════════════════════════════════════════════

-- Module 6.1: Organic Growth
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000006-0001-4000-8000-000000000001', _week_id(6), 'Organic Growth Strategies', 'Grow your following without spending money on ads.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000006-0001-4000-8000-000000000001',
 'Instagram Growth Playbook',
 'Proven strategies to grow your Instagram following with beauty content.',
 'https://www.youtube.com/watch?v=WEBi8EM-MVw',
 '## Growing on Instagram in 2024+

The algorithm rewards consistency, engagement, and Reels. Here''s your playbook.

### Profile Optimization

Before you try to grow, make sure your profile converts visitors into followers:
- **Profile photo:** Clear, professional, approachable
- **Name field:** Your name + keyword (e.g., "Sarah | Skincare Tips")
- **Bio:** What you do + who you help + CTA
- **Link:** Your Glow storefront link
- **Highlights:** Organize into categories (Products, Results, About Me, FAQs)

### The Growth Framework

**1. Reels Are King (post 3-5/week)**
Reels get pushed to non-followers. This is how new people find you.
- Use trending audio
- Hook in the first second
- Add text overlays
- Keep it 15-30 seconds

**2. Hashtag Strategy**
Use 5-10 targeted hashtags per post:
- 3 niche hashtags (#cleanskincare, #glowyskin, #skincareobsessed)
- 3 medium hashtags (#beautytips, #skincareroutine)
- 2-4 broad hashtags (#beauty, #skincare)

**3. Engagement Strategy (30 min/day)**
- Respond to every comment and DM
- Comment on 10 accounts in your niche
- Engage with followers'' content
- Use Stories daily (minimum 5/day)

**4. Collaborations**
- Comment section friends (people who always engage)
- Collab posts with other creators
- Shoutout swaps with similar-sized accounts

### Posting Schedule

Consistency matters more than perfection:
- **Reels:** 3-5x per week
- **Stories:** Daily (5-10 slides)
- **Feed Posts:** 2-3x per week
- **Lives:** 1x per week (starting Week 7)

### Growth Takes Time

Expect 100-500 new followers per month with consistent effort. Quality over quantity — 500 engaged followers who buy > 10,000 who scroll past.',
 '[{"label": "Instagram Growth Checklist", "url": "#", "type": "link"}, {"label": "Hashtag Research Tool", "url": "#", "type": "link"}]',
 15, 1),

('a1000006-0001-4000-8000-000000000001',
 'TikTok for Beauty Sellers',
 'How to use TikTok to reach massive audiences and drive sales.',
 'https://www.youtube.com/watch?v=bQPC7xjJkWI',
 '## TikTok: The Great Equalizer

On TikTok, a brand new account can go viral on its first post. The algorithm prioritizes content quality over follower count.

### Why TikTok Works for Beauty

- Beauty is the #1 niche on TikTok
- "TikTok made me buy it" is a real phenomenon
- Short-form video is perfect for product demos
- The algorithm shows your content to interested viewers

### Getting Started

**Profile Setup:**
- Business or Creator account
- Link your Glow storefront in bio
- Clear profile photo and description
- @glowbeauty in your bio

**Your First 10 Videos (post 1/day):**
1. "What I do" introduction
2. Get Ready With Me (GRWM)
3. Skincare routine with Glow products
4. "Rating my skincare collection"
5. Before/After
6. "Skincare mistakes I used to make"
7. Product unboxing/first impression
8. Day in my life as a beauty ambassador
9. Skincare tip/hack
10. "Why I love [specific product]"

### TikTok Best Practices

- **Post 1-3x daily** (volume matters on TikTok)
- **Use trending sounds** (browse For You page for inspiration)
- **Hook in 1 second** (text overlay + movement)
- **Keep it short** (15-30 seconds performs best for product content)
- **Engage in comments** (reply to comments with video responses)
- **Use relevant hashtags** (#skincare, #beautytok, #glowup)

### Converting TikTok Views to Sales

TikTok''s weakness: you can''t link in comments. Solutions:
- "Link in bio" CTA
- "Comment GLOW and I''ll DM you the link"
- Create a Linktree or use your Glow storefront link
- Respond to comments with detailed product info',
 '[{"label": "TikTok Content Calendar", "url": "#", "type": "link"}, {"label": "Trending Sound Tracker", "url": "#", "type": "link"}]',
 15, 2);

-- Module 6.2: Community & Engagement
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000006-0001-4000-8000-000000000002', _week_id(6), 'Community & Engagement', 'Build a loyal community that buys from you again and again.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000006-0001-4000-8000-000000000002',
 'Building a Community, Not Just a Following',
 'Turn followers into fans who buy everything you recommend.',
 'https://www.youtube.com/watch?v=3bXFx8RNpTM',
 '## Followers Buy Once. Community Members Buy Forever.

A community is built on trust, value, and genuine connection. Here''s how to create one.

### The Community Flywheel

**Value → Trust → Engagement → Sales → More Value**

When you consistently provide value, people trust you. When they trust you, they engage with your content. When they engage, they buy. When they buy and love it, they come back and tell others. The cycle compounds.

### 5 Ways to Build Community

**1. Be Responsive**
Reply to every DM. Reply to every comment. Make people feel seen. This alone puts you ahead of 90% of creators.

**2. Feature Your Customers**
Share their results (with permission). Repost their stories. Make them feel like part of the Glow family.

**3. Create Series Content**
- Monday Skincare Tips
- Wednesday Product Spotlights
- Friday Q&A
People come back for content they can anticipate.

**4. Go Behind the Scenes**
Show the unglamorous parts. Packing orders, learning about products, your real morning routine. Authenticity builds connection.

**5. Ask for Input**
- "What should I review next?"
- "Which product should I feature this week?"
- "Would you rather see a GRWM or a product comparison?"
When people feel ownership, they become invested.

### Engagement Metrics That Matter

Focus on these, not follower count:
- **Save rate** (people saving your posts for later)
- **Share rate** (people sending your content to friends)
- **DM volume** (people reaching out to you)
- **Comment quality** (real conversations, not just emojis)
- **Story reply rate** (people responding to your stories)

### The 1,000 True Fans Concept

You don''t need a million followers. You need 1,000 people who love what you do. If each one buys $80/year, that''s $80,000 in sales = $20,000 in commissions. From 1,000 people.',
 '[{"label": "Community Engagement Checklist", "url": "#", "type": "link"}]',
 15, 1),

('a1000006-0001-4000-8000-000000000002',
 'Collaborations & Cross-Promotion',
 'Partner with other creators to reach new audiences.',
 'https://www.youtube.com/watch?v=XDBjFo5DRYU',
 '## Two Audiences Are Better Than One

Collaborations put you in front of people who''ve never seen you before — with a built-in endorsement from someone they already trust.

### Types of Collaborations

**1. Instagram Collab Posts**
Create a post that appears on both your feeds. Instagram''s collab feature makes this easy.
- "Our combined skincare routine"
- "She rates my products, I rate hers"
- "Skincare swap challenge"

**2. TikTok Duets & Stitches**
React to or build on another creator''s content. Great for visibility.

**3. Story Takeovers**
Take over each other''s Stories for a day. You get their audience, they get yours.

**4. Joint Lives**
Go live together — Q&A, product reviews, get-ready-together.

**5. Shoutout Swaps**
Each person shares the other''s content with a genuine recommendation.

### Finding Collab Partners

Look for creators who:
- Have a similar-sized audience (within 2x of your follower count)
- Share your values and aesthetic
- Are in complementary niches (beauty + wellness, skincare + fitness, beauty + fashion)
- Have engaged followers (not just big numbers)
- Are NOT direct competitors selling the same products

### How to Pitch a Collab

"Hey [name]! I love your content, especially [specific post]. I''m a beauty ambassador with Glow and I think our audiences would love a collab. I was thinking we could do [specific idea]. Would you be open to it?"

### Collab Content Ideas

- "My morning routine vs. her morning routine"
- "Best friend rates my skincare products"
- "We tried each other''s skincare for a week"
- "Skincare Q&A with my beauty bestie"
- "Building the ultimate skincare routine together"',
 '[{"label": "Collab Pitch Templates", "url": "#", "type": "link"}, {"label": "Collab Ideas List", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 7 — Go Live & Show Up
-- ═══════════════════════════════════════════════════════════════

-- Module 7.1: Live Selling Prep
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000007-0001-4000-8000-000000000001', _week_id(7), 'Live Selling Prep', 'Overcome camera fear and prepare for your first live sale.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000007-0001-4000-8000-000000000001',
 'Overcoming Camera Fear',
 'Practical tips to get comfortable on camera — even if you hate being filmed.',
 'https://www.youtube.com/watch?v=SRwUIBGYhcA',
 '## Everyone Is Nervous at First

Even the most confident creators were scared before their first video. The difference? They did it anyway.

### Why Camera Fear Happens

- Fear of judgment ("What will people think?")
- Perfectionism ("I don''t look/sound good enough")
- Imposter syndrome ("Who am I to give advice?")
- Technical anxiety ("What if something goes wrong?")

### The 5-Day Camera Confidence Challenge

**Day 1:** Record a 15-second video of you talking about your favorite product. Watch it. Delete it. That''s it.

**Day 2:** Record a 30-second video. Watch it. Keep it on your phone.

**Day 3:** Record a 60-second video and post it to your Close Friends story only.

**Day 4:** Record a video and post it to your regular story (it disappears in 24 hours!).

**Day 5:** Record and post your first Reel.

### Practical Tips

- **Look at the camera lens**, not yourself on screen
- **Pretend you''re talking to your best friend**
- **Don''t watch it 10 times** before posting — one watch max
- **Film multiple takes** — you only need one good one
- **Good lighting fixes everything** — face a window
- **You are your harshest critic** — nobody notices the things you notice

### Reframe the Fear

You''re not performing for the world. You''re talking to ONE person who needs your help. One mom who wants better skincare. One woman who wants to feel confident. Talk to HER.

### Remember

- Your first video will be your worst
- Your 10th video will be decent
- Your 50th video will be great
- But you can''t get to 50 without posting #1',
 '[{"label": "Camera Confidence Challenge Tracker", "url": "#", "type": "link"}]',
 12, 1),

('a1000007-0001-4000-8000-000000000001',
 'Planning Your First Live',
 'Everything you need to prepare for a successful first live sale.',
 'https://www.youtube.com/watch?v=mVnbhk73gDU',
 '## Your First Live Doesn''t Need to Be Perfect — It Needs to Happen

Live video converts 10x better than pre-recorded content because it builds trust in real-time. People can ask questions and get immediate answers.

### Before Your Live

**Promote it 24 hours in advance:**
- Story: "Going live tomorrow at [time]! I''ll be showing you my full skincare routine with Glow products. Drop a 🙋 if you''ll be there!"
- Post: Countdown graphic with time and topic
- DM your most engaged followers: "Hey! I''m going live tomorrow — would love to see you there!"

**Set Up:**
- Good lighting (ring light or window)
- Phone propped at eye level (tripod or stack of books)
- Products laid out and ready
- Notes nearby (key points you want to hit)
- Water bottle handy
- Quiet space with minimal interruptions

### Your First Live: The Outline

**First 5 minutes: Welcome**
- Greet people as they join (by name!)
- "Hey everyone! Thanks for being here. I''m going to wait a couple minutes for people to join..."
- Share the topic and what they''ll learn

**Middle 15-20 minutes: Content**
- Demo your products
- Share tips and personal results
- Ask questions: "Who has tried a vitamin C serum before?"
- Read and respond to comments

**Last 5 minutes: Close**
- Recap what you covered
- Share your storefront link (verbally + in comments)
- "My link is in my bio — everything I showed you today is there!"
- Thank everyone for joining
- Announce when your next live will be

### Live Selling Tips

- **Engage with comments constantly** — this keeps people watching
- **Hold up products to the camera** — let people see them
- **Share prices confidently** — don''t whisper the price
- **Create urgency** — "I only have X of these in my feature collection"
- **Save the live** — it becomes content for people who missed it',
 '[{"label": "Live Selling Script Template", "url": "#", "type": "link"}, {"label": "Live Setup Checklist", "url": "#", "type": "link"}]',
 15, 2);

-- Module 7.2: Show Up Consistently
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000007-0001-4000-8000-000000000002', _week_id(7), 'Show Up Consistently', 'Build a video content routine that drives sales every week.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000007-0001-4000-8000-000000000002',
 'Video Scripts That Sell',
 'Pre-written video scripts you can customize and use immediately.',
 'https://www.youtube.com/watch?v=0Wa10Dg9gDo',
 '## Scripts Take the Guesswork Out

Having a script doesn''t mean being robotic — it means being prepared. Here are templates you can make your own.

### Script 1: The Product Review (60 seconds)

**[HOOK]** "Okay I need to talk about this product because it changed my skin"
**[STORY]** "I''ve been using the [product] for [timeframe] and here''s what happened..."
**[RESULT]** "My skin went from [before] to [after]. I''m not kidding."
**[CTA]** "Link in my bio if you want to try it. Trust me on this one."

### Script 2: The "3 Reasons" Format (45 seconds)

**[HOOK]** "3 reasons the Glow Serum is worth every penny"
**[REASON 1]** "First — the ingredients. Vitamin C and hyaluronic acid that actually work."
**[REASON 2]** "Second — it lasts forever. 2 months per bottle."
**[REASON 3]** "Third — my skin has never looked this good and I''ve tried everything."
**[CTA]** "Comment GLOW and I''ll send you the link"

### Script 3: The GRWM (Get Ready With Me) (2-3 minutes)

**[INTRO]** "Get ready with me using only Glow products!"
**[STEP BY STEP]** Show each product as you apply it. Name it, mention the price, share one benefit.
**[FINAL LOOK]** "And THIS is the finished look. All Glow, all under $[total]."
**[CTA]** "Shop my routine — link in bio!"

### Script 4: The Storytime Sell (60-90 seconds)

**[HOOK]** "Story time: how I accidentally started a skincare business"
**[STORY]** Share your genuine journey of discovering Glow
**[LESSON]** "The lesson? Sometimes the best opportunities find you."
**[CTA]** "If you want to learn more about the products OR the opportunity, my link is in my bio"

### How to Customize

Replace brackets with your personal details. Practice saying it 2-3 times. Then record. The more personal and natural it sounds, the better it converts.',
 '[{"label": "Video Script Template Pack", "url": "#", "type": "link"}]',
 15, 1),

('a1000007-0001-4000-8000-000000000002',
 'Repurposing Content Across Platforms',
 'Create once, post everywhere — maximize your content with minimal effort.',
 'https://www.youtube.com/watch?v=bFhdjLUf3KQ',
 '## One Piece of Content = 5+ Posts

Stop creating from scratch every day. Smart creators repurpose.

### The Content Multiplication Method

Start with ONE piece of content (a Reel, a live, a long-form video) and turn it into:

**Original:** 60-second Reel about your skincare routine

**Repurposed into:**
1. **TikTok:** Same video, re-upload natively
2. **Story series:** Break into 3-4 story slides with text overlays
3. **Carousel post:** Screenshots of key moments + tips as slides
4. **Caption post:** Write out the routine as a text post
5. **Pinterest pin:** Thumbnail with text overlay → links to your storefront
6. **DM content:** Send the video to interested prospects: "This is my routine!"

### The Live Repurposing Goldmine

A 30-minute live gives you:
- 5-10 short clips for Reels/TikToks
- Multiple story segments
- Quotes for caption posts
- FAQ content from viewer questions
- Testimonial moments (if customers commented)

### Weekly Batch Workflow

**Sunday (2 hours):** Plan and script content for the week
**Monday (1 hour):** Film 3-5 Reels back to back
**Tuesday-Saturday:** Post, engage, repurpose, DM
**Ongoing:** Save customer DMs, testimonials, and comments for future content

### Platform-Specific Tweaks

- **Instagram:** Aesthetic, polished, lifestyle-focused
- **TikTok:** Raw, authentic, fast-paced, trending sounds
- **Stories:** Personal, behind-the-scenes, interactive (polls, questions)
- **Pinterest:** Evergreen, searchable, beauty tips + links

### The Bottom Line

You don''t need to be a full-time content creator. You need a smart system. Create once. Distribute everywhere. Focus your remaining time on DMs and sales conversations.',
 '[{"label": "Content Repurposing Checklist", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 8 — Build Your Brand
-- ═══════════════════════════════════════════════════════════════

-- Module 8.1: Brand Identity
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000008-0001-4000-8000-000000000001', _week_id(8), 'Brand Identity', 'Define what makes you unique and build a recognizable personal brand.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000008-0001-4000-8000-000000000001',
 'Finding Your Unique Angle',
 'Discover what makes you different — because people buy from people they connect with.',
 'https://www.youtube.com/watch?v=D09Pljxxkqg',
 '## You Are Your Brand

There are thousands of beauty sellers. There''s only one YOU. Your personal brand is what makes people choose to buy from you instead of anyone else.

### The Personal Brand Framework

Answer these questions:

**Who are you?**
Not just "a Glow Girl" — what''s your story? Mom of 3? Fitness enthusiast? Former corporate worker? College student? Skincare addict since age 12?

**Who do you serve?**
Your ideal customer. Be specific: "Busy moms in their 30s who want a simple but effective skincare routine" is better than "women who like skincare."

**What''s your vibe?**
- Playful and fun?
- Clean and minimal?
- Luxurious and aspirational?
- Raw and relatable?
- Educational and authoritative?

**What''s your signature thing?**
Every memorable brand has one:
- A catchphrase ("You deserve this glow")
- A content series ("Monday Skin School")
- A visual style (always wearing pink, always filming in the same spot)
- A niche angle ("Clean beauty for sensitive skin")

### Brand Positioning Examples

- **The Skincare Scientist:** Deep-dives into ingredients, debunks myths, educates followers
- **The Busy Mom:** Real routines for real life, relatable, time-saving beauty
- **The Glow-Up Queen:** Transformation focused, before/afters, inspirational
- **The Luxury Lover:** Premium aesthetic, treat-yourself energy, aspirational
- **The Real Girl:** Unfiltered, honest reviews, no-BS recommendations

### Pick Your Lane

You don''t need to appeal to everyone. The more specific your angle, the more magnetic you become to the RIGHT people. A mom searching for "skincare for busy moms" will choose the account that speaks directly to her over a generic beauty page every time.

### Action Item

Write your brand statement: "I help [who] achieve [what] through [how], and my vibe is [description]." Put this somewhere you''ll see it before creating content.',
 '[{"label": "Personal Brand Worksheet", "url": "#", "type": "link"}]',
 15, 1),

('a1000008-0001-4000-8000-000000000001',
 'Visual Branding on a Budget',
 'Create a cohesive, professional-looking feed without a design degree or expensive tools.',
 'https://www.youtube.com/watch?v=Sn2xO-3Ekwc',
 '## Looks Matter (On Social Media)

You don''t need a graphic designer. You need consistency. When someone lands on your profile, they should immediately get a "vibe."

### The 3-Element Visual Brand

**1. Color Palette (pick 3-5 colors)**
Stick to these across all your content:
- Your background colors
- Text overlay colors
- Outfit choices in photos/videos
- Story highlights cover colors

Tools: Use Canva''s color palette generator or pull colors from a photo you love.

**2. Fonts (pick 2)**
- One for headings (bold, eye-catching)
- One for body text (clean, readable)
Use the same fonts in every graphic, carousel, and text overlay.

**3. Photo Style**
Decide on your aesthetic:
- Bright and airy?
- Warm and cozy?
- Clean and minimal?
- Bold and colorful?

Use the same 1-2 photo filters consistently. Your followers should recognize your content before seeing your name.

### Free Tools for Visual Branding

- **Canva:** Templates for everything (stories, posts, carousels) — free version is plenty
- **Lightroom Mobile:** Free presets for consistent photo editing
- **Unfold:** Beautiful story templates
- **InShot:** Video editing with text and music
- **Your phone camera:** Seriously, modern phones are amazing

### Feed Planning

Use an app like Preview or Planoly to see how posts look together before posting. Aim for variety in format (close-up, full body, flat lay, graphic) while maintaining color consistency.

### The Quick Wins

- Use the same filter on every photo
- Create Canva templates and reuse them
- Stick to 3 colors in your graphics
- Keep your highlights covers matching
- Use the same 2 fonts for all text

### Remember

Good enough and consistent beats perfect and sporadic. Post that content.',
 '[{"label": "Canva Template Pack", "url": "#", "type": "link"}, {"label": "Brand Color Palette Examples", "url": "#", "type": "link"}]',
 12, 2);

-- Module 8.2: Storytelling & Authority
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000008-0001-4000-8000-000000000002', _week_id(8), 'Storytelling & Authority', 'Use storytelling to create deeper connections and position yourself as an expert.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000008-0001-4000-8000-000000000002',
 'Storytelling That Sells',
 'The framework behind every great personal brand story.',
 'https://www.youtube.com/watch?v=Nj-hdQMa3uA',
 '## Facts Tell. Stories Sell.

People don''t remember product features. They remember how you made them feel. Story is the most powerful tool in your selling toolkit.

### The Story Selling Framework

Every great story follows this pattern:

**1. The Before (The Problem)**
"I used to [struggle/frustration]. I felt [emotion]."

**2. The Turning Point (The Discovery)**
"Then I found [product/opportunity]. At first I was skeptical, but..."

**3. The After (The Transformation)**
"Now I [result/new reality]. I feel [positive emotion]."

**4. The Invitation (The CTA)**
"If you''re where I was, I want to help. [Link/DM me/etc.]"

### Your Core Stories

Prepare these and rotate them in your content:

**Your Origin Story:** How did you find Glow? Why did you decide to become an ambassador?

**Your Product Story:** What specific results have you gotten from the products?

**Your Business Story:** How has the income/opportunity changed your life?

**Customer Stories:** Results from people you''ve helped (with permission)

### Story Formats by Platform

**Instagram Reel:** 60-second story with visual montage
**Stories:** Multi-slide narrative (text + photos + video clips)
**Caption:** Written story with photo that matches the emotion
**TikTok:** Raw, authentic, straight-to-camera storytelling
**Live:** Deep-dive story with Q&A

### Storytelling Tips

- Be specific (not "I had bad skin" but "I couldn''t leave the house without foundation")
- Show vulnerability (people connect with struggles, not perfection)
- Use sensory details ("I remember looking in the mirror and...")
- Keep it conversational (write like you talk)
- Always tie it back to how you can help THEM

### The Power Move

Share stories regularly. People who follow you long enough will feel like they KNOW you. When they need skincare, they won''t Google it — they''ll DM you.',
 '[{"label": "Story Framework Templates", "url": "#", "type": "link"}]',
 15, 1),

('a1000008-0001-4000-8000-000000000002',
 'Becoming the Go-To Expert',
 'Position yourself as the person people come to for beauty advice.',
 'https://www.youtube.com/watch?v=8w-kCUMvHgs',
 '## Authority = Trust = Sales

When people see you as an expert, they don''t need convincing. They come to you ready to buy.

### The Authority Building Playbook

**1. Teach Consistently**
Post educational content 2-3x per week:
- Ingredient spotlights
- Skincare routine tips
- Common mistakes people make
- Myth-busting content
- Product comparisons and reviews

**2. Share Your Journey**
Document your learning publicly. "I just learned that niacinamide and vitamin C work even better together — here''s why..."

People trust people who are actively learning, not just people who claim to know everything.

**3. Answer Questions Publicly**
When someone DMs you a question, turn the answer into content (anonymously). "Someone asked me about the best order to apply products — great question! Here''s the answer..."

**4. Show Social Proof**
- Customer testimonials and results
- Your personal before/afters
- Number of customers helped
- Repeat customers coming back

**5. Be Honest About What You Don''t Know**
"I''m not a dermatologist, but here''s what I''ve learned from my own experience and research..." Honesty builds more trust than fake expertise.

### Content Ideas for Authority

- "5 ingredients I always look for in a serum"
- "The skincare order that actually matters"
- "What nobody tells you about [ingredient]"
- "I tried the viral skincare hack so you don''t have to"
- "Questions to ask before buying any skincare product"

### The Compound Effect

Authority builds over time. Each educational post, each helpful DM response, each honest review adds to your reputation. In 6 months of consistent content, you''ll be the skincare person in your community. That''s when sales become effortless.',
 '[{"label": "Authority Content Ideas (50+)", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 9 — Build Your Team
-- ═══════════════════════════════════════════════════════════════

-- Module 9.1: Sharing the Opportunity
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000009-0001-4000-8000-000000000001', _week_id(9), 'Sharing the Opportunity', 'How to authentically invite others to join Glow.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000009-0001-4000-8000-000000000001',
 'The Art of the Invite',
 'How to share the Glow opportunity without being "that person."',
 'https://www.youtube.com/watch?v=6bhU-6FuTHs',
 '## Recruiting Is Just Sharing What Works

If your friend opened an amazing restaurant, you''d tell people about it. This is the same thing — you found something great and you''re sharing it.

### Who Makes a Great Glow Girl

Look for people who:
- Love beauty and skincare products
- Are active on social media
- Have an entrepreneurial spirit
- Are looking for extra income
- Have expressed interest in side hustles
- Comment on your Glow content frequently

### The Invitation Framework

**1. Plant the Seed (organic content)**
Post about the business side naturally:
- "Love that my serum addiction turned into a paycheck 😂"
- "Commission notification just hit 🎉 I love this glow life"
- "Still can''t believe I get paid to talk about skincare"

**2. The Direct Invite (DM)**
When someone shows interest: "Hey [name]! I noticed you''ve been liking my Glow posts. Have you ever thought about doing something like this? I think you''d be amazing at it."

**3. The Information Share**
If they''re curious: "It''s super simple — you get your own storefront, earn 25% commission on sales, and get training and support from me and the team. Want me to send you more info?"

**4. Let Them Decide**
Never pressure. "Take your time to think about it! I''m here if you have any questions."

### What NOT to Say

- "This is an amazing opportunity" (overused, triggers skepticism)
- "You''d be perfect for this!" (without knowing their situation)
- "You could quit your job!" (unrealistic for most people)
- "It''s not an MLM" (unprompted — this raises red flags)

### What TO Say

- "I''ve been doing this for [time] and here''s what I''ve earned..."
- "What I love most is [genuine personal benefit]"
- "The products practically sell themselves — I just share what I actually use"
- "There''s no pressure, no inventory, and I help you every step of the way"

### Handle the "Is this an MLM?" Question

"I''m an independent beauty ambassador — think of it like being a brand affiliate or creator partner. I share products, earn commission, and if I bring on other sellers, I earn a small bonus from their sales too. There''s no inventory, no garage full of products, and you can stop anytime. Want to hear more about how it actually works?"',
 '[{"label": "Recruiting Conversation Guide", "url": "#", "type": "link"}, {"label": "Opportunity Overview PDF", "url": "#", "type": "link"}]',
 15, 1),

('a1000009-0001-4000-8000-000000000001',
 'Leveraging Social Media to Attract Recruits',
 'Content strategies that make people come to YOU about the opportunity.',
 'https://www.youtube.com/watch?v=I2mNnRBbKkk',
 '## Attraction Recruiting > Cold Recruiting

The best recruiting happens when people DM YOU asking about the opportunity. Here''s how to make that happen.

### The "Show Don''t Tell" Method

Instead of posting "Join my team!", show the LIFESTYLE and RESULTS:

**Income posts (tasteful, not braggy):**
- "Monthly commission just dropped 💰 Still pinching myself that this is real"
- Photo of commission notification with caption about gratitude

**Lifestyle posts:**
- "Working from my favorite coffee shop today. This is the freedom I was looking for."
- "Midweek date because my schedule is MINE"

**Behind-the-scenes posts:**
- "This is what a day in my Glow business actually looks like"
- "Monday morning — packing orders, creating content, and coaching my team"

**Team posts:**
- "So proud of [team member] who just hit [milestone]!"
- "My team call today was everything 🥹 I love these women"

### Content That Attracts Recruits

- "How I make money talking about skincare" (Reel)
- "Day in my life as a Glow ambassador" (vlog style)
- "What I wish I knew before starting my beauty business" (carousel)
- "From [old job/situation] to [new reality]" (story)
- "FAQ: Everything you want to know about being a Glow Girl" (saved to highlights)

### The Interest Pipeline

When someone expresses interest:
1. Thank them for reaching out
2. Ask about their situation and goals
3. Share the relevant benefits (income, flexibility, products, community)
4. Send them your apply/info link
5. Follow up in 48 hours
6. Support their decision either way

### The Numbers Game

Not everyone will say yes. That''s okay. If you share the opportunity with 20 people:
- 10 will say "not for me" → respect it
- 5 will say "maybe later" → follow up in 30 days
- 3 will ask questions → nurture them
- 2 will apply → support them fully

Those 2 people can change your income forever.',
 '[{"label": "Recruiting Content Templates", "url": "#", "type": "link"}]',
 15, 2);

-- Module 9.2: Supporting Your Team
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a1000009-0001-4000-8000-000000000002', _week_id(9), 'Supporting Your Team', 'How to onboard and mentor new team members for everyone''s success.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a1000009-0001-4000-8000-000000000002',
 'Onboarding Your First Recruit',
 'The first 48 hours with a new team member set the tone for their entire journey.',
 'https://www.youtube.com/watch?v=7J2GiGhI6no',
 '## Their Success Is Your Success

When someone joins your team, they''re trusting you. Here''s how to give them the best possible start.

### The First 48 Hours

**Hour 1: Welcome Call**
- Congratulate them!
- Walk through their dashboard and storefront setup
- Help them choose their products
- Introduce them to the 10-Week Journey (they''ll start at Week 1)

**Hours 2-24: Setup Support**
- Help them complete their profile
- Review their bio and product selections
- Add them to your team group chat
- Share your favorite content from the Journey

**Hours 24-48: First Action**
- Help them make their warm market list
- Review their first post/story draft
- Encourage their first outreach messages
- Celebrate their first share/conversation

### The Weekly Check-In

Schedule a 15-minute call or voice note check-in every week:
- "How are you feeling?"
- "What wins did you have this week?"
- "What are you struggling with?"
- "What''s your focus for next week?"

### What New Recruits Need Most

**Week 1-2:** Hand-holding. They''re learning everything. Be patient. Be available.

**Week 3-4:** Encouragement. This is when doubt creeps in. Share your own early struggles.

**Month 2:** Independence. Start stepping back. Let them make decisions. Celebrate their initiative.

**Month 3+:** Partnership. They''re becoming a peer. Collaborate on content, share strategies, celebrate together.

### The Duplication Principle

Everything you teach your team, they''ll teach theirs. Keep it simple:
- Simple scripts they can copy
- Simple content frameworks they can follow
- Simple daily routines they can maintain
- Simple systems they can replicate

The most scalable businesses are built on simple, repeatable systems.',
 '[{"label": "New Team Member Onboarding Checklist", "url": "#", "type": "link"}, {"label": "Weekly Check-In Template", "url": "#", "type": "link"}]',
 15, 1),

('a1000009-0001-4000-8000-000000000002',
 'Pod Leadership & Team Culture',
 'Create a team culture that retains and motivates your Glow Girls.',
 'https://www.youtube.com/watch?v=sE5eVSwVx1Y',
 '## Great Leaders Build Great Teams

Your pod is your inner circle. These are the team members you actively mentor and support. A strong pod culture keeps people engaged and selling.

### What Is a Pod?

In Glow, your pod is your close team — typically your direct recruits and their first-level recruits. You earn an extra 5% override on pod sales, so investing in your pod directly impacts your income.

### Building Pod Culture

**1. Create a Group Chat**
Use GroupMe, WhatsApp, or a private Instagram group:
- Daily wins sharing
- Content inspiration
- Accountability check-ins
- Celebration of milestones

**2. Weekly Team Calls (15-30 min)**
Keep them short and valuable:
- 5 min: Wins and shoutouts
- 10 min: Training topic (rotate through the Journey content)
- 5 min: Goals for the week
- 5 min: Q&A

**3. Monthly Challenges**
Gamify it:
- "30 DMs in 30 Days"
- "First to 10 sales wins [prize]"
- "Content challenge — post every day this week"
- "Customer review challenge"

**4. Recognition**
People stay where they feel valued:
- Shoutouts in the group chat
- Celebrate first sales, rank ups, and milestones
- Feature team members on your stories
- Send a congratulations DM for every achievement

### Leadership Principles

- **Lead by example:** Don''t ask your team to do things you won''t do
- **Be available, not smothering:** Respond quickly but don''t micromanage
- **Celebrate effort, not just results:** "I love that you went live for the first time!" matters more than "Great sales this week"
- **Be honest about struggles:** Share when things are hard. Authenticity builds loyalty.
- **Protect the culture:** Address negativity quickly. One toxic person can derail a whole team.

### Your Role as a Leader

You''re not their boss. You''re their mentor, cheerleader, and accountability partner. The more you pour into your team, the more everyone earns — including you.',
 '[{"label": "Pod Leadership Playbook", "url": "#", "type": "link"}, {"label": "Team Challenge Ideas", "url": "#", "type": "link"}]',
 15, 2);


-- ═══════════════════════════════════════════════════════════════
-- WEEK 10 — $10K & Beyond
-- ═══════════════════════════════════════════════════════════════

-- Module 10.1: Review & Optimize
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a100000a-0001-4000-8000-000000000001', _week_id(10), 'Review & Optimize', 'Analyze your results and double down on what works.', 1);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a100000a-0001-4000-8000-000000000001',
 'Your 10-Week Performance Review',
 'Analyze your numbers, celebrate your wins, and identify what to improve.',
 'https://www.youtube.com/watch?v=LJxhYmsiIF8',
 '## Numbers Don''t Lie

Congratulations — you''ve made it to Week 10! Let''s look at where you are and plan where you''re going.

### Key Metrics to Review

Pull these from your Glow Girl dashboard:

**Sales Metrics:**
- Total sales volume ($)
- Number of orders
- Average order value
- Best-selling product
- Number of unique customers
- Repeat customer rate

**Activity Metrics:**
- Content posted (Reels, Stories, Posts)
- DM conversations started
- DM conversations that led to sales (conversion rate)
- Lives completed
- Storefront views

**Team Metrics (if applicable):**
- Team members recruited
- Team sales volume
- Your override earnings

### The 80/20 Analysis

Look at your data and find:
- **Which 20% of activities drove 80% of your sales?** (Was it DMs? Content? Lives? Referrals?)
- **Which product drove the most revenue?**
- **Which platform drove the most customers?**
- **What time of day did you make the most sales?**

### Double Down on Winners

If DMs drive most of your sales → spend more time on DMs
If Reels drive the most traffic → create more Reels
If one product outsells everything → feature it more prominently
If mornings are your best time → schedule your Power Hour early

### Drop What''s Not Working

Be honest about what hasn''t moved the needle:
- Spending hours on Pinterest with no sales? Pause it.
- Long-form YouTube videos getting no views? Stick to short-form.
- Cold DMs on Twitter with zero response? Focus on Instagram/TikTok.

### Celebrate Every Win

Whether you hit $100 or $10,000, you built something real. You showed up, learned new skills, overcame fears, and created income. That''s incredible.',
 '[{"label": "Performance Review Template", "url": "#", "type": "link"}, {"label": "80/20 Analysis Worksheet", "url": "#", "type": "link"}]',
 15, 1),

('a100000a-0001-4000-8000-000000000001',
 'Building Sustainable Routines',
 'Create a daily and weekly system you can maintain for the long term.',
 'https://www.youtube.com/watch?v=Y9h_TN9LUn0',
 '## Hustle Gets You Started. Systems Keep You Going.

The 10-week journey gave you the skills. Now let''s build the routines that make this sustainable.

### The Daily System (1 Hour)

**Morning (15 min):**
- Check notifications and respond to DMs
- Post a Story or engage with followers
- Set your 3 priorities for the day

**Power Hour (30 min):**
- 15 min: New DM outreach
- 15 min: Follow-up conversations

**Evening (15 min):**
- Post content (or schedule for tomorrow)
- Respond to comments and DMs
- Log your wins for the day

### The Weekly System

**Sunday:** Plan content and DM targets for the week
**Monday:** Fresh content day (film Reels, create posts)
**Wednesday:** Midweek engagement push (engage with 20 accounts)
**Friday:** Week review (what worked, what didn''t)
**Saturday:** Rest or batch content for next week

### The Monthly System

- Review metrics in your dashboard
- Adjust content strategy based on performance
- Set next month''s income goal
- Schedule 1 live per week
- Plan any promotions or campaigns
- Check in with team members individually

### Avoiding Burnout

This is a marathon, not a sprint:
- Take at least 1 full day off per week
- Batch content so you''re not creating every day
- Automate what you can (scheduling tools, saved replies)
- Don''t compare your Week 10 to someone else''s Year 3
- Celebrate small wins — they compound
- Ask for help when you need it (your upline, your pod, Glow support)

### The Compound Effect

If you maintain these habits:
- Month 1-3: Building foundation, 5-15 sales/month
- Month 4-6: Growing momentum, 20-40 sales/month
- Month 7-12: Consistent income, team building, 50+ sales/month
- Year 2+: Significant passive income from team overrides

Every day you show up, you''re investing in future you.',
 '[{"label": "Daily Routine Template", "url": "#", "type": "link"}, {"label": "Monthly Planning Worksheet", "url": "#", "type": "link"}]',
 12, 2);

-- Module 10.2: Scaling to $10K and Beyond
insert into journey_modules (id, week_id, title, description, sort_order)
values ('a100000a-0001-4000-8000-000000000002', _week_id(10), 'Scaling to $10K+', 'Plan your path to $10K in total sales and beyond.', 2);

insert into journey_lessons (module_id, title, description, video_url, content, resources, duration_minutes, sort_order) values
('a100000a-0001-4000-8000-000000000002',
 'The $10K Roadmap',
 'A concrete plan to reach $10,000 in total sales and rank up.',
 'https://www.youtube.com/watch?v=wGkF5IkTW3o',
 '## The Path to $10K

$10,000 in total sales is a major milestone. Here''s the math and the plan to get there.

### The Math

**If your average order is $80:**
- $10,000 ÷ $80 = 125 orders
- At 25% commission = $2,500 in personal earnings

**At 5 orders per week:** ~25 weeks (6 months)
**At 10 orders per week:** ~13 weeks (3 months)
**At 15 orders per week:** ~8 weeks (2 months)

### The Acceleration Strategies

**1. Increase Average Order Value**
- Recommend bundles: "Most people pair the serum with the gummies — it''s the full glow-up"
- Suggest gifts: "This makes an amazing birthday gift"
- Create product combinations: "My 3-step routine is [X + Y + Z]"

**2. Increase Repeat Purchases**
- Follow up 30 days after purchase: "How are you loving the serum? Ready for a refill?"
- Share tips for products they already own (keeps them engaged)
- Alert them to new products or promotions

**3. Get Customer Referrals**
- "If you love the product, would you mind sharing my link with a friend? It means the world to me!"
- Feature happy customers on your stories (they''ll share with their network)
- Create a referral incentive if possible

**4. Scale Your Team**
- Each team member is a multiplier
- 5 team members doing $500/month = $2,500 in team volume
- Your override earnings grow with every recruit

### Rank Advancement

As you grow, you''ll hit new ranks in the compensation plan:
- Higher ranks = higher monthly tier bonuses
- Track your personal recruits and group volume (GV) in your dashboard
- Ranks are based on personal recruits + total team sales volume

### The Mindset at $10K

When you hit $10K, something shifts. It stops being a side hustle and becomes a real business. You stop wondering IF it works and start optimizing HOW to grow it faster.

### What''s Next After $10K?

- $25K: You''ve built serious momentum
- $50K: This is real, sustainable income
- $100K: You''re a top performer — mentoring others, earning significant overrides
- Beyond: The ceiling is your effort × your team × time',
 '[{"label": "10K Roadmap Planner", "url": "#", "type": "link"}, {"label": "Rank Advancement Tracker", "url": "#", "type": "link"}]',
 15, 1),

('a100000a-0001-4000-8000-000000000002',
 'Your Next Chapter — What Happens After Week 10',
 'The journey doesn''t end here. Here''s how to keep growing.',
 'https://www.youtube.com/watch?v=UNQhuFL6CWg',
 '## This Is Just the Beginning

You''ve spent 10 weeks building skills that most people never develop. You can sell. You can create content. You can build a team. These skills are yours forever.

### What You''ve Accomplished

Take a moment to appreciate how far you''ve come:
- You built and launched your storefront
- You learned to pitch with confidence
- You made real sales and earned real commissions
- You created content consistently
- You overcame camera fear
- You built (or started building) a team
- You showed up, week after week

### The Cycle Repeats

The best Glow Girls run through this journey cyclically:
- **Quarter 1:** Focus on personal sales and content
- **Quarter 2:** Focus on team building and leadership
- **Quarter 3:** Focus on scaling and optimization
- **Quarter 4:** Focus on sustainability and goal-setting for next year

### Your Ongoing Toolkit

You have access to these resources permanently:
- **This Journey:** Revisit any lesson anytime
- **AI Studio:** Continue generating content
- **Product Education:** Deep-dive materials for every product
- **Marketing Templates:** Ready-to-use scripts and captions
- **Your Pod:** Your team and upline support

### Set Your Next Big Goal

What does success look like for you in the next 90 days?
- A specific income number?
- A certain number of team members?
- A rank advancement?
- Quitting your 9-5?
- A specific purchase or experience funded by Glow?

Write it down. Tell your team. Make it real.

### Final Words

You have everything you need. The products are premium. The tools are built. The training is here. The only variable is YOU — your effort, your consistency, your belief.

Go make it happen, Glow Girl. We''re rooting for you. ✨',
 '[{"label": "90-Day Goal Setting Worksheet", "url": "#", "type": "link"}, {"label": "Glow Girl Success Stories", "url": "#", "type": "link"}]',
 12, 2);


-- ═══════════════════════════════════════════════════════════════
-- Cleanup helper function
-- ═══════════════════════════════════════════════════════════════
drop function _week_id(int);
