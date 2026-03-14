import { requireGlowGirl } from '@/lib/auth'
import { getWeekDetail } from '@/lib/actions/journey'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Circle, Clock, PlayCircle, FileText } from 'lucide-react'

const WEEK_ICONS = ['🌱', '🧴', '💰', '📱', '💬', '📈', '🎥', '✨', '👯‍♀️', '🚀']

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ num: string }>
}) {
  const { num } = await params
  const weekNumber = parseInt(num, 10)
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 10) notFound()

  const { glowGirl } = await requireGlowGirl()
  const detail = await getWeekDetail(weekNumber, glowGirl.id)

  if (!detail) notFound()

  const { week, modules, total_lessons, completed_lessons } = detail
  const pct = total_lessons > 0 ? Math.round((completed_lessons / total_lessons) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back nav */}
      <Link
        href="/glow-girl/journey"
        className="inline-flex items-center gap-2 text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Journey
      </Link>

      {/* Week header */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#f5f0eb] flex items-center justify-center text-2xl shrink-0">
            {WEEK_ICONS[weekNumber - 1]}
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-[#6E6A62]/40 uppercase tracking-wider">
              Week {week.week_number}
            </span>
            <h1 className="text-2xl font-light text-[#6E6A62] mt-0.5">{week.title}</h1>
            <p className="text-sm text-[#6E6A62]/60 mt-1">{week.subtitle}</p>
            {week.description && (
              <p className="text-sm text-[#6E6A62]/50 mt-3 leading-relaxed">{week.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#f5f0eb] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6E6A62] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm text-[#6E6A62]/60 shrink-0">
            {completed_lessons}/{total_lessons} lessons
          </span>
        </div>

        {week.milestone && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#f5f0eb]/60 border border-[#6E6A62]/5">
            <span className="text-xs font-medium text-[#6E6A62]/50 uppercase tracking-wider">Milestone</span>
            <p className="text-sm text-[#6E6A62] mt-0.5">{week.milestone}</p>
          </div>
        )}
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-6">
        {modules.map((module, moduleIdx) => (
          <div key={module.id} className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h2 className="text-sm font-medium text-[#6E6A62]">
                {moduleIdx + 1}. {module.title}
              </h2>
              {module.description && (
                <p className="text-xs text-[#6E6A62]/50 mt-0.5">{module.description}</p>
              )}
            </div>

            <div className="divide-y divide-neutral-100">
              {module.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/glow-girl/journey/lesson/${lesson.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#f5f0eb]/40 transition-colors"
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#6E6A62]/20 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${lesson.completed ? 'text-[#6E6A62]/60' : 'text-[#6E6A62] font-medium'}`}>
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-xs text-[#6E6A62]/40 mt-0.5 truncate">{lesson.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {lesson.video_url && (
                      <PlayCircle className="w-4 h-4 text-[#6E6A62]/30" />
                    )}
                    {lesson.resources && lesson.resources.length > 0 && (
                      <FileText className="w-4 h-4 text-[#6E6A62]/30" />
                    )}
                    <span className="text-xs text-[#6E6A62]/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration_minutes}m
                    </span>
                  </div>
                </Link>
              ))}

              {module.lessons.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-[#6E6A62]/40">
                  Lessons coming soon
                </div>
              )}
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
            <p className="text-[#6E6A62]/50">Content for this week is being prepared.</p>
          </div>
        )}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mt-8">
        {weekNumber > 1 ? (
          <Link
            href={`/glow-girl/journey/week/${weekNumber - 1}`}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            &larr; Week {weekNumber - 1}
          </Link>
        ) : <div />}
        {weekNumber < 10 ? (
          <Link
            href={`/glow-girl/journey/week/${weekNumber + 1}`}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            Week {weekNumber + 1} &rarr;
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
