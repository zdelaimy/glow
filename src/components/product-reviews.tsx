"use client"

import { useState, useMemo } from "react"
import { Star, ChevronDown, BadgeCheck, Search } from "lucide-react"

interface Review {
  name: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
  skinConcerns: string[]
  skinType: string
  age: string
  usage: string
  product: string
}

const REVIEWS: Review[] = [
  { name: "Edie D.", rating: 5, title: "A Work In Progress", body: "My skin has suffered conscious neglect for most of my life. I am seeing some changes to the dark spots and also some light peeling off of the overly dry spots. So heading in the right direction. It will take time.", date: "Mar 12, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Fine Lines/Wrinkles", "Loss of Firmness", "Deep Lines/Creases"], skinType: "Dry", age: "65+", usage: "Used Often", product: "Glow Serum" },
  { name: "Mirasol B.", rating: 5, title: "I love this V-C serum", body: "I love this V-C serum! It gives me a glow smooth my skin. I am 70yrs and my skin feels firmer and more radiant since I started using it.", date: "Mar 10, 2026", verified: true, skinConcerns: ["Loss of Firmness", "Puffiness/Dark Circles"], skinType: "Normal", age: "65+", usage: "Used Often", product: "Glow Serum" },
  { name: "Amanda R.", rating: 5, title: "Holy grail serum", body: "I've tried probably 20 different vitamin C serums and this is hands down the best one. My skin is glowing and my dark spots from sun damage are actually fading. Two months in and I'm never going back.", date: "Mar 8, 2026", verified: true, skinConcerns: ["Dark Spots", "Sun Damage", "Dull/Uneven Skin"], skinType: "Combination", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Priya S.", rating: 5, title: "Dermatologist noticed the difference", body: "I was skeptical about the price but honestly it's so worth it. A little goes a long way and my skin has never looked this good. Even my dermatologist commented on the improvement at my last visit.", date: "Mar 5, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Dull/Uneven Skin"], skinType: "Normal", age: "45-54", usage: "Used Often", product: "Glow Serum" },
  { name: "Chloe W.", rating: 4, title: "Great but takes time", body: "It took about 3-4 weeks before I started seeing real results. But now at week 6 my skin looks incredible. Just be patient with it — it's worth the wait. My fine lines are definitely softer.", date: "Mar 3, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Loss of Firmness"], skinType: "Dry", age: "45-54", usage: "Used Often", product: "Glow Serum" },
  { name: "Jordan L.", rating: 5, title: "Brighter skin in 2 weeks", body: "I noticed a difference within the first two weeks. My complexion is more even, the texture is smoother, and I actually look forward to my morning routine now. The vitamin C really works.", date: "Feb 28, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Rough Texture"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Mia T.", rating: 5, title: "Pores look smaller", body: "After years of trying serums that either broke me out or did nothing, this one actually works. My pores look smaller and my skin just has this healthy glow to it. No breakouts at all.", date: "Feb 27, 2026", verified: true, skinConcerns: ["Large Pores", "Acne/Breakouts", "Oily Skin"], skinType: "Oily", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Natasha K.", rating: 5, title: "Better than my $180 serum", body: "I used to spend $180 on a serum from a luxury brand. Switched to Glow and the results are honestly better. My skin is clearer and more radiant than it's been in years. The niacinamide makes such a difference.", date: "Feb 24, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dark Spots", "Fine Lines/Wrinkles"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Sophia H.", rating: 5, title: "Goodbye dark spots", body: "I had stubborn hyperpigmentation from old acne scars that nothing could touch. This serum has visibly lightened them in just over a month. I'm actually shocked at the results.", date: "Feb 21, 2026", verified: true, skinConcerns: ["Dark Spots", "Acne Scars", "Dull/Uneven Skin"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Rachel B.", rating: 4, title: "Good for sensitive skin", body: "I have pretty reactive skin and was nervous to try a vitamin C serum. Zero irritation, no breakouts. My skin is brighter and calmer. Only 4 stars because I wish the bottle were bigger.", date: "Feb 20, 2026", verified: true, skinConcerns: ["Sensitivity/Redness", "Dull/Uneven Skin"], skinType: "Sensitive", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Isabella G.", rating: 5, title: "Glass skin is real", body: "People keep asking me what I'm doing differently. The answer is just this serum. My skin literally looks like it has a filter on it. The hyaluronic acid makes it so plump and hydrated.", date: "Feb 19, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dehydration", "Fine Lines/Wrinkles"], skinType: "Dry", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Aaliyah D.", rating: 5, title: "My skin transformation", body: "Before and after photos don't lie — my skin has completely transformed in 6 weeks. Smoother, brighter, more even. I've never gotten so many compliments on my complexion.", date: "Feb 18, 2026", verified: true, skinConcerns: ["Dark Spots", "Rough Texture", "Dull/Uneven Skin"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Emma C.", rating: 5, title: "Perfect under makeup", body: "This serum makes my foundation look flawless. It hydrates without being greasy and gives the most beautiful base. My makeup artist asked what I was using and now she recommends it.", date: "Feb 17, 2026", verified: true, skinConcerns: ["Dehydration", "Dull/Uneven Skin"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Olivia P.", rating: 4, title: "Subtle but real results", body: "I don't think it's a miracle product but I do see a genuine difference. My skin is smoother and has a healthier glow. Using it morning and night for 5 weeks now. Fine lines are softening.", date: "Feb 15, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Dull/Uneven Skin"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Taylor J.", rating: 5, title: "My esthetician is impressed", body: "Went for my quarterly facial and my esthetician said my skin was in the best shape she's ever seen it. Told her about Glow and she wants to stock it in her studio. That says everything.", date: "Feb 14, 2026", verified: true, skinConcerns: ["Large Pores", "Rough Texture", "Fine Lines/Wrinkles"], skinType: "Combination", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Jasmine F.", rating: 5, title: "Replaced 3 products", body: "I used to layer a vitamin C, a hyaluronic acid, and a niacinamide separately. This has all three and works better than all of them combined. Simpler routine, better results.", date: "Feb 13, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dehydration", "Large Pores"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Lily N.", rating: 5, title: "Bought for mom, she loves it", body: "Got this for my mom who's in her 50s and she texts me literally every day about how good her skin looks. She says it's the first product that actually does what it claims for her wrinkles.", date: "Feb 12, 2026", verified: true, skinConcerns: ["Deep Lines/Creases", "Loss of Firmness", "Dark Spots"], skinType: "Dry", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Brooklyn A.", rating: 5, title: "Don't need concealer anymore", body: "I want to give this 10 stars. I've been using it for 2 months and my skin has never been this clear and glowy. I literally threw away my concealer because I don't need it anymore.", date: "Feb 11, 2026", verified: true, skinConcerns: ["Dark Spots", "Dull/Uneven Skin", "Acne Scars"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Savannah E.", rating: 4, title: "Really good, almost perfect", body: "Love the results — my skin is brighter and smoother. The only thing I'd change is adding SPF or making a version with sunscreen built in. Otherwise it's an amazing product.", date: "Feb 10, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Sun Damage"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Aria V.", rating: 5, title: "No more dull winter skin", body: "My skin used to look so tired and dull, especially in winter. This serum brought it back to life. I look rested even when I'm running on 5 hours of sleep. The radiance is real.", date: "Feb 9, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dehydration", "Rough Texture"], skinType: "Dry", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Madison Q.", rating: 5, title: "The glow is REAL", body: "Everyone at work keeps asking if I went on vacation. Nope, just started using Glow Serum three weeks ago. The radiance is unreal — like I'm lit from within.", date: "Feb 8, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Harper W.", rating: 5, title: "Clean ingredients that actually work", body: "I'm very particular about what I put on my skin. Love that this is paraben-free, cruelty-free, and actually effective. So many clean brands sacrifice results — this one doesn't.", date: "Feb 7, 2026", verified: true, skinConcerns: ["Sensitivity/Redness", "Fine Lines/Wrinkles"], skinType: "Sensitive", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Zoe L.", rating: 5, title: "Wedding-ready skin", body: "Started using this 3 months before my wedding and my skin looked absolutely flawless on the big day. My photographer even commented on it. Best beauty investment I made.", date: "Feb 6, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Large Pores", "Fine Lines/Wrinkles"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Grace M.", rating: 4, title: "Good for acne-prone skin", body: "I have oily, acne-prone skin and this doesn't break me out at all. My acne scars are fading slowly and my overall skin tone is more even. Wish it came in a larger size though.", date: "Feb 5, 2026", verified: true, skinConcerns: ["Acne/Breakouts", "Acne Scars", "Oily Skin"], skinType: "Oily", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Layla R.", rating: 5, title: "Third bottle already", body: "On my third bottle and not stopping anytime soon. This is the one product I refuse to run out of. My skin is the clearest it's been since I was a teenager. The dark spots are almost gone.", date: "Feb 4, 2026", verified: true, skinConcerns: ["Dark Spots", "Dull/Uneven Skin"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Penelope S.", rating: 5, title: "Lightweight and effective", body: "I hate heavy serums that sit on top of my skin. This one absorbs in seconds and actually penetrates. You can feel it working. Results showed up fast — within two weeks.", date: "Feb 3, 2026", verified: true, skinConcerns: ["Rough Texture", "Dehydration"], skinType: "Oily", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Nora B.", rating: 5, title: "Visible pore reduction", body: "I always had enlarged pores on my nose and cheeks. After about a month of daily use, they're noticeably smaller. The niacinamide in this is doing its thing.", date: "Feb 1, 2026", verified: true, skinConcerns: ["Large Pores", "Oily Skin", "Rough Texture"], skinType: "Oily", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Camila D.", rating: 5, title: "The texture is everything", body: "It goes on like water but feels like it's doing something immediately. Not sticky, not greasy, just pure hydration. My skin drinks it up every morning. Love the lightweight feel.", date: "Jan 30, 2026", verified: true, skinConcerns: ["Dehydration", "Rough Texture"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Willow F.", rating: 4, title: "Solid serum, slow shipping", body: "The product itself is fantastic — my skin is softer and brighter. Shipping took about 8 days which was a bit long, but the results make up for it. Will reorder.", date: "Jan 29, 2026", verified: false, skinConcerns: ["Dull/Uneven Skin", "Rough Texture"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Elena H.", rating: 5, title: "Dermatologist approved", body: "I showed this to my dermatologist and she said the ingredient list is excellent. 15% vitamin C is the sweet spot for efficacy without irritation. She actually recommends it to patients now.", date: "Jan 28, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Dark Spots", "Sun Damage"], skinType: "Normal", age: "45-54", usage: "Used Often", product: "Glow Serum" },
  { name: "Luna P.", rating: 5, title: "I look younger, period", body: "I'm 42 and people consistently think I'm in my early 30s now. The fine lines around my eyes have softened and my skin has this youthful bounce to it. Life-changing product.", date: "Jan 26, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Loss of Firmness", "Dull/Uneven Skin"], skinType: "Combination", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Scarlett N.", rating: 5, title: "Best impulse buy ever", body: "Saw an ad, was skeptical, tried it anyway. Best impulse buy of my life. I'm on month two and getting more compliments on my skin than I ever have. My dark circles look lighter too.", date: "Jan 25, 2026", verified: true, skinConcerns: ["Dark Spots", "Puffiness/Dark Circles", "Dull/Uneven Skin"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Victoria C.", rating: 5, title: "Simplified my whole routine", body: "Cleanse, Glow Serum, moisturizer, sunscreen. That's it. My skin has never been simpler or looked this good. The serum does all the heavy lifting. Don't need 10 products anymore.", date: "Jan 24, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Fine Lines/Wrinkles"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Addison J.", rating: 4, title: "Almost perfect", body: "Love everything about this serum. The only tiny critique is the dropper could be better — sometimes it's hard to get the right amount out. But the formula itself? Chef's kiss.", date: "Jan 23, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dehydration"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Ellie W.", rating: 5, title: "Smells amazing too", body: "On top of working incredibly well, it has this subtle fresh scent that's not overpowering at all. Makes my whole routine feel more luxurious. Skin is noticeably brighter.", date: "Jan 21, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Naomi G.", rating: 5, title: "Sun damage savior", body: "Living in Hawaii means lots of sun exposure. This serum has been incredible at fading the sun spots on my cheeks. I use it religiously morning and night. Huge difference in 6 weeks.", date: "Jan 20, 2026", verified: true, skinConcerns: ["Sun Damage", "Dark Spots", "Fine Lines/Wrinkles"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Ruby V.", rating: 5, title: "Outperforms luxury brands", body: "I've used La Mer, Drunk Elephant, SkinCeuticals — you name it. This performs on par or better than all of them for a fraction of the price. Not even exaggerating.", date: "Jan 19, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Dull/Uneven Skin", "Dark Spots"], skinType: "Combination", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Autumn M.", rating: 5, title: "My skin literally glows", body: "People keep using the word 'glowing' to describe my skin and that's never happened before in my life. This serum turned me into a skincare person. Can't imagine my routine without it.", date: "Jan 18, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Rough Texture"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Skylar E.", rating: 4, title: "Great for dry skin types", body: "My dry skin loves this. The hyaluronic acid provides intense hydration without clogging pores. My skin feels bouncy and plump all day. Would love a night cream version too.", date: "Jan 17, 2026", verified: true, skinConcerns: ["Dehydration", "Rough Texture", "Fine Lines/Wrinkles"], skinType: "Dry", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Claire O.", rating: 5, title: "Minimalist routine dream", body: "This replaced three separate serums in my routine. Less products, less money, better results. Exactly what I was looking for. My skin is clearer than when I used all three.", date: "Jan 16, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Large Pores"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Ivy R.", rating: 5, title: "Even my husband noticed", body: "My husband, who literally never notices anything, looked at me last week and said 'your skin looks really good.' That's how you know it's working. Fine lines around my eyes are softer.", date: "Jan 15, 2026", verified: true, skinConcerns: ["Fine Lines/Wrinkles", "Dull/Uneven Skin"], skinType: "Normal", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Mackenzie B.", rating: 5, title: "Stress skin saver", body: "Stress, lack of sleep, terrible diet — my skin should be a disaster right now. But this serum keeps it looking healthy and bright despite my chaotic grad school life.", date: "Jan 14, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dehydration", "Acne/Breakouts"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Peyton L.", rating: 5, title: "Bought 3 as gifts", body: "Bought one for myself, loved it so much I bought three more as birthday gifts. Every single person has texted me thanking me. It really is that good for brightening and evening skin tone.", date: "Jan 13, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Dark Spots"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Quinn S.", rating: 4, title: "Patience pays off", body: "Patience is key with this one. Weeks 1-2 I didn't see much. Week 3 things started shifting. By week 5 I was taking selfies with no filter for the first time in years.", date: "Jan 12, 2026", verified: false, skinConcerns: ["Dull/Uneven Skin", "Dark Spots", "Rough Texture"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Reese D.", rating: 5, title: "The ingredient list is excellent", body: "As someone who reads every ingredient label, this formulation is top tier. No fillers, no fragrance masking, just effective actives at proper concentrations. Exactly what my skin needed.", date: "Jan 11, 2026", verified: true, skinConcerns: ["Sensitivity/Redness", "Fine Lines/Wrinkles"], skinType: "Sensitive", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Sienna H.", rating: 5, title: "Rosacea-friendly", body: "I have mild rosacea and most vitamin C serums irritate my skin. This one is gentle enough that I can use it daily with zero redness or flare-ups. Game changer for sensitive skin types.", date: "Jan 10, 2026", verified: true, skinConcerns: ["Sensitivity/Redness", "Dull/Uneven Skin"], skinType: "Sensitive", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Teagan K.", rating: 5, title: "Confidence booster", body: "I know it sounds dramatic but this serum gave me confidence I didn't know I was missing. Going out without makeup used to stress me out. Now I actually prefer my bare skin.", date: "Jan 9, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Acne Scars", "Large Pores"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Uma J.", rating: 5, title: "Winter skin savior", body: "Vermont winters destroy my skin usually. This year with the Glow Serum I've maintained that healthy, dewy look even in the driest, coldest months. The hyaluronic acid is a lifesaver.", date: "Jan 8, 2026", verified: true, skinConcerns: ["Dehydration", "Rough Texture", "Dull/Uneven Skin"], skinType: "Dry", age: "35-44", usage: "Used Often", product: "Glow Serum" },
  { name: "Violet A.", rating: 5, title: "At 55, this actually works", body: "My daughter gifted me this for Christmas. At 55, I've tried everything. This is the first serum that's made a noticeable difference in my fine lines and overall skin tone. On my second bottle.", date: "Jan 7, 2026", verified: true, skinConcerns: ["Deep Lines/Creases", "Loss of Firmness", "Dark Spots"], skinType: "Dry", age: "55-64", usage: "Used Often", product: "Glow Serum" },
  { name: "Wren T.", rating: 4, title: "Really effective formula", body: "Solid, well-formulated serum. My dark circles look lighter and my skin tone is more even. Only minor note is I'd prefer a pump over a dropper for hygiene reasons. But the formula is great.", date: "Jan 6, 2026", verified: false, skinConcerns: ["Puffiness/Dark Circles", "Dull/Uneven Skin"], skinType: "Normal", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Ximena F.", rating: 5, title: "Best skincare purchase ever", body: "Best skincare purchase I've ever made. My skin is clearer, brighter, and so much smoother. I've recommended it to everyone I know and they all love it too. The glow is undeniable.", date: "Jan 5, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Rough Texture", "Dark Spots"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
  { name: "Yara N.", rating: 5, title: "Camera-ready every day", body: "I work in entertainment and looking good is part of the job. This serum gives me that camera-ready skin without professional treatments. My makeup artist is obsessed with it too.", date: "Jan 4, 2026", verified: true, skinConcerns: ["Dull/Uneven Skin", "Fine Lines/Wrinkles", "Large Pores"], skinType: "Combination", age: "25-34", usage: "Used Often", product: "Glow Serum" },
]

type SortOption = "recent" | "highest" | "lowest"
const REVIEWS_PER_PAGE = 5

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${cls} ${i <= rating ? "fill-[#1a1a1a] text-[#1a1a1a]" : "fill-neutral-200 text-neutral-200"}`} />
      ))}
    </div>
  )
}

export function ProductReviews() {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())

  const totalReviews = REVIEWS.length
  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: REVIEWS.filter((rev) => rev.rating === r).length,
  }))

  const sortedAndFiltered = useMemo(() => {
    let result = [...REVIEWS]

    if (filterRating) {
      result = result.filter((r) => r.rating === filterRating)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.skinConcerns.some((c) => c.toLowerCase().includes(q))
      )
    }

    if (sortBy === "highest") result.sort((a, b) => b.rating - a.rating)
    else if (sortBy === "lowest") result.sort((a, b) => a.rating - b.rating)

    return result
  }, [sortBy, searchQuery, filterRating])

  const visibleReviews = sortedAndFiltered.slice(0, visibleCount)
  const hasMore = visibleCount < sortedAndFiltered.length

  function toggleExpand(i: number) {
    setExpandedReviews((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <section id="reviews" className="py-20 md:py-28 border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl leading-tight text-neutral-900 text-center mb-12">
          What People Are Saying
        </h2>

        {/* Aggregate rating + bar chart */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          {/* Left — big number */}
          <div className="text-center md:text-left shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-light text-neutral-900">{avgRating}</span>
              <StarRating rating={Math.round(Number(avgRating))} size="md" />
            </div>
            <p className="text-sm text-neutral-400 mt-1">Based on {totalReviews} reviews</p>
          </div>

          {/* Right — rating bars */}
          <div className="flex-1 w-full max-w-xs space-y-1.5">
            {ratingCounts.map(({ rating, count }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`flex items-center gap-3 w-full text-left transition-opacity ${
                  filterRating && filterRating !== rating ? "opacity-30" : ""
                }`}
              >
                <span className="text-xs text-neutral-500 w-3 shrink-0">{rating}</span>
                <Star className="w-3 h-3 fill-[#1a1a1a] text-[#1a1a1a] shrink-0" />
                <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a1a1a] rounded-full transition-all"
                    style={{ width: `${(count / totalReviews) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-400 w-6 text-right shrink-0">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-[#faf8f5] rounded-xl p-5 mb-8 border border-neutral-100">
          <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-400 mb-2 font-sans">AI-generated from customer reviews</p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Customers appreciate the brightening and hydrating effects of Glow Serum&apos;s Vitamin C formula, noting smoother and more radiant skin after a few weeks of use. Many report visible fading of dark spots and fine lines, with sensitive skin types noting zero irritation.
          </p>
        </div>

        {/* Search + Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(REVIEWS_PER_PAGE) }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); setVisibleCount(REVIEWS_PER_PAGE) }}
            className="px-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-600 outline-none focus:border-neutral-400 transition-colors"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {filterRating && (
          <button
            onClick={() => { setFilterRating(null); setVisibleCount(REVIEWS_PER_PAGE) }}
            className="text-xs text-neutral-500 underline underline-offset-2 mb-4 block"
          >
            Clear filter — showing {filterRating}-star reviews ({sortedAndFiltered.length})
          </button>
        )}

        {/* Review list */}
        <div className="divide-y divide-neutral-100">
          {visibleReviews.map((review, i) => {
            const isExpanded = expandedReviews.has(i)
            return (
              <div key={i} className="py-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{review.name}</p>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">{review.date}</span>
                </div>

                {/* Stars + title */}
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} />
                  <h4 className="text-sm font-semibold text-neutral-800 font-sans">{review.title}</h4>
                </div>

                {/* Skin metadata */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  <div className="text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-500">Skin Concern:</span>{" "}
                    {review.skinConcerns.join(", ")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-[11px] text-neutral-400">
                  <span><span className="font-medium text-neutral-500">Skin:</span> {review.skinType}</span>
                  <span><span className="font-medium text-neutral-500">Age:</span> {review.age}</span>
                  <span><span className="font-medium text-neutral-500">Product:</span> {review.product}</span>
                  <span><span className="font-medium text-neutral-500">Usage:</span> {review.usage}</span>
                </div>

                {/* Body */}
                <p className="text-sm text-neutral-600 leading-relaxed">{review.body}</p>

                {!isExpanded && review.body.length > 200 && (
                  <button onClick={() => toggleExpand(i)} className="text-xs text-neutral-500 underline mt-2">
                    See more
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {sortedAndFiltered.length === 0 && (
          <p className="text-center text-neutral-400 py-10">No reviews match your search.</p>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-8 pt-6 border-t border-neutral-100">
            <button
              onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
              className="inline-flex items-center gap-2 h-11 px-8 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-neutral-400 transition-colors"
            >
              Show More Reviews
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
