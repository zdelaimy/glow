'use client'

import { Video, MessageCircle, Camera, Heart, BookOpen, Users } from 'lucide-react'

const WEEKLY_BLOCKS = [
  {
    icon: Video,
    activity: 'Create & Post Reels',
    hours: '2–3 hrs',
    hoursNum: 2.5,
    description: 'This is how you grow. Film 3–4 short reels per week — product demos, routines, before/afters, trending formats. Good reels = new followers = new customers.',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconColor: 'text-rose-500',
    tips: [
      'Hook viewers in the first 1 second — start with movement or a bold statement',
      'Show the product in use, not just sitting on a shelf',
      'Use trending sounds — check the Video Scripts tab for ideas',
      'Post at least 3x/week — consistency beats perfection',
      'Reels that teach something ("3 signs your skin barrier is damaged") outperform sales pitches',
    ],
    highlight: true,
  },
  {
    icon: MessageCircle,
    activity: 'DMs & Outreach',
    hours: '2 hrs',
    hoursNum: 2,
    description: 'Reply to every comment and DM. Reach out to people who engage with your content. This is where followers become customers.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
    tips: [
      'Reply to comments within 1 hour of posting — it boosts the algorithm',
      'DM people who like your posts: "Hey! Thanks for the love — have you tried the serum?"',
      'Don\'t lead with a pitch. Lead with a genuine compliment or question',
    ],
  },
  {
    icon: Camera,
    activity: 'Stories',
    hours: '2 hrs',
    hoursNum: 2,
    description: 'Post 5–10 stories per day. Show your routine, your results, behind-the-scenes. Stories keep you top of mind with your existing followers.',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconColor: 'text-purple-500',
    tips: [
      'Mix it up: selfie, product shot, poll, question box, testimonial',
      'Always have a "swipe up" or "link in bio" CTA on at least one story',
      'Reshare customer results and tag them',
    ],
  },
  {
    icon: Heart,
    activity: 'Engage & Comment',
    hours: '1 hr',
    hoursNum: 1,
    description: 'Spend time engaging with accounts in your niche. Leave genuine comments on beauty, skincare, and lifestyle posts. This gets your profile seen by new people.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
    tips: [
      'Comment on 20–30 posts per day in skincare/beauty hashtags',
      'Write real comments (not "love this!") — 6+ words that add to the conversation',
      'Follow accounts that follow similar creators',
    ],
  },
  {
    icon: BookOpen,
    activity: 'Learn & Plan',
    hours: '1 hr',
    hoursNum: 1,
    description: 'Study what\'s working. Watch top-performing reels in your niche. Plan your content for the week. Check your analytics.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
    tips: [
      'Save reels that get high engagement — study the format, not just the content',
      'Batch plan your week: decide your 3–4 reel topics in one sitting',
      'Check which posts got the most saves and shares — that\'s your best content',
    ],
  },
  {
    icon: Users,
    activity: 'Team & Recruiting',
    hours: '1–2 hrs',
    hoursNum: 1.5,
    description: 'Support your team. Answer their questions. Share what\'s working for you. Look for potential new Glow Girls among your engaged followers.',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    iconColor: 'text-slate-500',
    tips: [
      'Your most engaged followers are your best recruits — they already love the product',
      'Share your earnings wins (even small ones) in your stories to attract interest',
      'Check in with your team weekly — a quick "how\'s it going?" goes a long way',
    ],
  },
]

export function WeeklyPlaybook() {
  const totalHours = WEEKLY_BLOCKS.reduce((sum, b) => sum + b.hoursNum, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center px-2">
        <h2 className="text-lg font-medium text-[#6E6A62]">Your 10-Hour Week</h2>
        <p className="text-sm text-[#6E6A62]/50 mt-1">
          This is all it takes. 10 hours a week, broken down into simple daily habits.
        </p>
      </div>

      {/* Visual time bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter font-medium">
            Weekly Breakdown
          </span>
          <span className="text-sm font-medium text-[#6E6A62]">~{totalHours} hrs/week</span>
        </div>
        <div className="flex rounded-full overflow-hidden h-8 gap-[2px]">
          {WEEKLY_BLOCKS.map((block) => {
            const pct = (block.hoursNum / totalHours) * 100
            return (
              <div
                key={block.activity}
                className={`${block.color} flex items-center justify-center transition-all`}
                style={{ width: `${pct}%` }}
                title={`${block.activity}: ${block.hours}`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider truncate px-1">
                  {block.hours}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex gap-[2px] mt-1.5">
          {WEEKLY_BLOCKS.map((block) => {
            const pct = (block.hoursNum / totalHours) * 100
            return (
              <div key={block.activity} style={{ width: `${pct}%` }} className="text-center">
                <span className="text-[9px] text-[#6E6A62]/40 font-inter truncate block">
                  {block.activity.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key message */}
      <div className="bg-[#6E6A62] rounded-2xl p-6 text-center">
        <p className="text-white text-base md:text-lg font-medium leading-relaxed">
          Reels are how you grow your following.
        </p>
        <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
          A single viral reel can bring in hundreds of new followers overnight. Those followers see your stories, click your link, and buy. That&apos;s the flywheel.
        </p>
        <div className="flex items-center justify-center gap-6 mt-5">
          <div className="text-center">
            <p className="text-2xl font-light text-white">3–4</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-inter">Reels / week</p>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div className="text-center">
            <p className="text-2xl font-light text-white">2–3</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-inter">Hours / week</p>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div className="text-center">
            <p className="text-2xl font-light text-white">&infin;</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-inter">Potential reach</p>
          </div>
        </div>
      </div>

      {/* Activity blocks */}
      <div className="space-y-4">
        {WEEKLY_BLOCKS.map((block) => (
          <div
            key={block.activity}
            className={`bg-white rounded-2xl border overflow-hidden ${
              block.highlight ? 'border-rose-200 ring-1 ring-rose-100' : 'border-neutral-200/60'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${block.color} border flex items-center justify-center flex-shrink-0`}>
                  <block.icon className={`w-5 h-5 ${block.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-medium text-[#6E6A62]">{block.activity}</h3>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${block.color} border`}>
                      {block.hours}
                    </span>
                  </div>
                  <p className="text-sm text-[#6E6A62]/60 leading-relaxed">{block.description}</p>

                  {block.highlight && (
                    <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">
                        This is the #1 priority
                      </p>
                      <p className="text-xs text-rose-600/80">
                        If you only do one thing this week, make it reels. Everything else follows from growing your audience.
                      </p>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="mt-4 space-y-2">
                    {block.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6E6A62]/25 flex-shrink-0 mt-1.5" />
                        <p className="text-sm text-[#6E6A62]/50 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The flywheel */}
      <div className="bg-[#f5f0eb] rounded-2xl p-6">
        <h3 className="text-sm font-medium text-[#6E6A62] text-center mb-4">The Growth Flywheel</h3>
        <div className="flex items-center justify-center gap-3 text-sm text-[#6E6A62]/70">
          <span className="bg-white rounded-full px-3 py-1.5 font-medium text-[#6E6A62]">Post reels</span>
          <span className="text-[#6E6A62]/30">&rarr;</span>
          <span className="bg-white rounded-full px-3 py-1.5 font-medium text-[#6E6A62]">Gain followers</span>
          <span className="text-[#6E6A62]/30">&rarr;</span>
          <span className="bg-white rounded-full px-3 py-1.5 font-medium text-[#6E6A62]">They see your stories</span>
          <span className="text-[#6E6A62]/30">&rarr;</span>
          <span className="bg-white rounded-full px-3 py-1.5 font-medium text-[#6E6A62]">They buy</span>
        </div>
        <p className="text-center text-xs text-[#6E6A62]/40 mt-3 font-inter">
          Repeat every week. The bigger your audience, the easier every sale becomes.
        </p>
      </div>
    </div>
  )
}
