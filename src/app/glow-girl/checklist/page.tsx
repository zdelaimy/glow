'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

const WEEKS = [
  {
    week: 1,
    title: 'Set Up & Believe',
    emoji: '🌱',
    tasks: [
      'Complete your Glow Girl profile (photo, bio, brand name)',
      'Select products for your storefront',
      'Share your storefront link with 3 people',
      'Write down your "why" and your 10-week income goal',
      'Block out your daily Power Hour on your calendar',
    ],
  },
  {
    week: 2,
    title: 'Know What You\'re Selling',
    emoji: '🧴',
    tasks: [
      'Try every product you\'re selling (or study the ones you haven\'t)',
      'Write a 30-second pitch for each product',
      'Learn 2-3 key ingredients per product and what they do',
      'Practice your elevator pitch out loud 5 times',
      'Prepare answers for the top 5 objections (price, skepticism, etc.)',
    ],
  },
  {
    week: 3,
    title: 'Make Your First Sales',
    emoji: '💰',
    tasks: [
      'Build your warm market list (aim for 50+ contacts)',
      'Send personalized outreach messages to 20 people',
      'Post your first product-related story or Reel',
      'Follow up with everyone who showed interest',
      'Celebrate your first sale (no matter how small)!',
    ],
  },
  {
    week: 4,
    title: 'Content That Sells',
    emoji: '📱',
    tasks: [
      'Define your 4 content pillars (education, entertainment, personal, promo)',
      'Create and post 3 Reels or TikToks this week',
      'Try using AI Studio to generate at least 5 captions',
      'Post stories daily (aim for 5-10 slides per day)',
      'Plan next week\'s content calendar in advance',
    ],
  },
  {
    week: 5,
    title: 'DM Like a Pro',
    emoji: '💬',
    tasks: [
      'Start 10 new DM conversations per day (warm or cold)',
      'Use the 3-message framework: Connect → Transition → Offer',
      'Follow up with all open conversations from Weeks 3-4',
      'Save your best-performing DM openers as templates',
      'Track your DM-to-sale conversion rate this week',
    ],
  },
  {
    week: 6,
    title: 'Grow Your Audience',
    emoji: '📈',
    tasks: [
      'Optimize your Instagram/TikTok bio with a clear CTA',
      'Engage on 10 accounts in your niche daily (genuine comments)',
      'Research and use 5-10 targeted hashtags per post',
      'Reach out to 2 creators for a potential collaboration',
      'Hit a consistent posting schedule (3-5 Reels + daily stories)',
    ],
  },
  {
    week: 7,
    title: 'Go Live & Show Up',
    emoji: '🎥',
    tasks: [
      'Complete the 5-day camera confidence challenge (record daily)',
      'Promote your first live 24 hours in advance',
      'Go live for at least 15 minutes (demo a product, do a Q&A)',
      'Save your live and repurpose clips into Reels',
      'Script 3 short-form videos using proven templates',
    ],
  },
  {
    week: 8,
    title: 'Build Your Brand',
    emoji: '✨',
    tasks: [
      'Write your personal brand statement (who you help + how + your vibe)',
      'Pick your visual brand: 3 colors, 2 fonts, consistent photo style',
      'Create Instagram highlights (Products, Results, About Me, FAQs)',
      'Post a personal story about why you started with Glow',
      'Share 2 educational posts to build authority in your niche',
    ],
  },
  {
    week: 9,
    title: 'Build Your Team',
    emoji: '👯‍♀️',
    tasks: [
      'Share about the Glow opportunity naturally in your content',
      'Identify 5 people who might be a great fit and reach out',
      'Prepare your answer for "Is this an MLM?"',
      'If someone joins: do a welcome call within 24 hours',
      'Start a team group chat (even if it\'s just you + 1 for now)',
    ],
  },
  {
    week: 10,
    title: '$10K & Beyond',
    emoji: '🚀',
    tasks: [
      'Review your 10-week metrics (sales, orders, followers, conversion rate)',
      'Do an 80/20 analysis: what 20% of activities drove 80% of sales?',
      'Drop what isn\'t working, double down on what is',
      'Build your sustainable daily routine (1-hour Power Hour)',
      'Set your next 90-day goal and write it down',
    ],
  },
]

const STORAGE_KEY = 'glow-checklist-v1'

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setChecked(JSON.parse(saved))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    }
  }, [checked, loaded])

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleWeek(week: number) {
    setExpandedWeeks((prev) => ({ ...prev, [week]: !prev[week] }))
  }

  function taskKey(week: number, taskIndex: number) {
    return `w${week}-t${taskIndex}`
  }

  function weekProgress(week: number, taskCount: number) {
    let done = 0
    for (let i = 0; i < taskCount; i++) {
      if (checked[taskKey(week, i)]) done++
    }
    return done
  }

  const totalTasks = WEEKS.reduce((s, w) => s + w.tasks.length, 0)
  const totalDone = WEEKS.reduce((s, w) => s + weekProgress(w.week, w.tasks.length), 0)
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0

  if (!loaded) return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">10-Week Checklist</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          Your week-by-week action plan. Check off tasks as you go.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#6E6A62]">Overall Progress</span>
          <span className="text-sm text-[#6E6A62]/60">
            {totalDone} / {totalTasks} tasks &middot; {overallPct}%
          </span>
        </div>
        <div className="h-3 bg-[#f5f0eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6E6A62] to-[#8a857d] rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-3">
        {WEEKS.map((w) => {
          const done = weekProgress(w.week, w.tasks.length)
          const isComplete = done === w.tasks.length
          const expanded = expandedWeeks[w.week] ?? false

          return (
            <div
              key={w.week}
              className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden"
            >
              {/* Week header */}
              <button
                type="button"
                onClick={() => toggleWeek(w.week)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#f5f0eb]/40 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    isComplete
                      ? 'bg-emerald-100'
                      : done > 0
                      ? 'bg-[#6E6A62]/10'
                      : 'bg-[#f5f0eb]'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <span>{w.emoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#6E6A62]/40 uppercase tracking-wider">
                      Week {w.week}
                    </span>
                    {isComplete && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-[#6E6A62] mt-0.5">{w.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-[#f5f0eb] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-emerald-500' : 'bg-[#6E6A62]'
                        }`}
                        style={{ width: `${(done / w.tasks.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#6E6A62]/50 shrink-0 tabular-nums">
                      {done}/{w.tasks.length}
                    </span>
                  </div>
                </div>
                {expanded ? (
                  <ChevronDown className="w-5 h-5 text-[#6E6A62]/30 shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#6E6A62]/30 shrink-0" />
                )}
              </button>

              {/* Tasks */}
              {expanded && (
                <div className="border-t border-neutral-100 px-5 py-3 space-y-1">
                  {w.tasks.map((task, i) => {
                    const key = taskKey(w.week, i)
                    const isDone = checked[key] ?? false
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full flex items-start gap-3 py-2.5 px-2 rounded-lg text-left hover:bg-[#f5f0eb]/40 transition-colors group"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#6E6A62]/25 shrink-0 mt-0.5 group-hover:text-[#6E6A62]/50 transition-colors" />
                        )}
                        <span
                          className={`text-sm leading-relaxed ${
                            isDone
                              ? 'text-[#6E6A62]/40 line-through'
                              : 'text-[#6E6A62]'
                          }`}
                        >
                          {task}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
