import { requireGlowGirl } from '@/lib/auth'
import { getJourneyOverview } from '@/lib/actions/journey'
import Link from 'next/link'
import { CheckCircle2, Lock, ChevronRight } from 'lucide-react'

const WEEK_ICONS = ['🌱', '🧴', '💰', '📱', '💬', '📈', '🎥', '✨', '👯‍♀️', '🚀']

export default async function JourneyPage() {
  const { glowGirl } = await requireGlowGirl()
  const weeks = await getJourneyOverview(glowGirl.id)

  const totalLessons = weeks.reduce((s, w) => s + w.lesson_count, 0)
  const totalCompleted = weeks.reduce((s, w) => s + w.completed_count, 0)
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#6E6A62]">Your 10-Week Journey</h1>
        <p className="text-sm text-[#6E6A62]/60 mt-1">
          $0 to $10K — one week at a time. You&apos;ve got this.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#6E6A62]">Overall Progress</span>
          <span className="text-sm text-[#6E6A62]/60">
            {totalCompleted} / {totalLessons} lessons &middot; {overallPct}%
          </span>
        </div>
        <div className="h-3 bg-[#f5f0eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6E6A62] to-[#8a857d] rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-4">
        {weeks.map((week) => {
          const pct = week.lesson_count > 0
            ? Math.round((week.completed_count / week.lesson_count) * 100)
            : 0
          const isComplete = pct === 100 && week.lesson_count > 0
          const hasContent = week.lesson_count > 0

          return (
            <Link
              key={week.id}
              href={hasContent ? `/glow-girl/journey/week/${week.week_number}` : '#'}
              className={`block bg-white rounded-2xl border border-neutral-200/60 p-6 transition-all ${
                hasContent
                  ? 'hover:border-[#6E6A62]/30 hover:shadow-sm cursor-pointer'
                  : 'opacity-60 cursor-default'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Week number */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  isComplete
                    ? 'bg-emerald-100'
                    : pct > 0
                    ? 'bg-[#6E6A62]/10'
                    : 'bg-[#f5f0eb]'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <span>{WEEK_ICONS[week.week_number - 1]}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#6E6A62]/40 uppercase tracking-wider">
                      Week {week.week_number}
                    </span>
                    {isComplete && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-[#6E6A62] mt-0.5">{week.title}</h3>
                  <p className="text-sm text-[#6E6A62]/50 mt-0.5">{week.subtitle}</p>

                  {week.milestone && (
                    <p className="text-xs text-[#6E6A62]/40 mt-2">
                      Milestone: {week.milestone}
                    </p>
                  )}

                  {/* Progress bar */}
                  {hasContent && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#f5f0eb] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete ? 'bg-emerald-500' : 'bg-[#6E6A62]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#6E6A62]/50 shrink-0">
                        {week.completed_count}/{week.lesson_count}
                      </span>
                    </div>
                  )}

                  {!hasContent && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#6E6A62]/40">
                      <Lock className="w-3 h-3" />
                      Content coming soon
                    </div>
                  )}
                </div>

                {hasContent && (
                  <ChevronRight className="w-5 h-5 text-[#6E6A62]/30 shrink-0 mt-1" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
