import { requireGlowGirl } from '@/lib/auth'
import { getLessonDetail } from '@/lib/actions/journey'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import { LessonCompleteButton } from '../../_components/lesson-complete-button'
import { VideoEmbed } from '../../_components/video-embed'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { glowGirl } = await requireGlowGirl()
  const detail = await getLessonDetail(id, glowGirl.id)

  if (!detail) notFound()

  const { lesson, module, week, prev_lesson_id, next_lesson_id } = detail

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/glow-girl/journey/week/${week.week_number}`}
        className="inline-flex items-center gap-2 text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Week {week.week_number}: {week.title}
      </Link>

      {/* Module context */}
      <div className="text-xs text-[#6E6A62]/40 uppercase tracking-wider mb-2">
        {module.title}
      </div>

      {/* Lesson title */}
      <h1 className="text-2xl font-light text-[#6E6A62] mb-2">{lesson.title}</h1>
      {lesson.description && (
        <p className="text-sm text-[#6E6A62]/60 mb-6">{lesson.description}</p>
      )}

      {/* Video */}
      {lesson.video_url && (
        <div className="mb-8">
          <VideoEmbed url={lesson.video_url} />
        </div>
      )}

      {/* Content */}
      {lesson.content && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8">
          <div
            className="prose prose-sm max-w-none text-[#6E6A62] prose-headings:text-[#6E6A62] prose-headings:font-medium prose-a:text-[#6E6A62] prose-a:underline prose-strong:text-[#6E6A62]"
            dangerouslySetInnerHTML={{ __html: formatContent(lesson.content) }}
          />
        </div>
      )}

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200/60 mb-8">
          <div className="px-6 py-4 border-b border-neutral-200/60">
            <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Resources</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {lesson.resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 hover:bg-[#f5f0eb]/40 transition-colors"
              >
                {resource.type === 'pdf' || resource.type === 'download' ? (
                  <Download className="w-4 h-4 text-[#6E6A62]/50 shrink-0" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-[#6E6A62]/50 shrink-0" />
                )}
                <span className="text-sm text-[#6E6A62]">{resource.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mark complete */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 mb-8">
        <LessonCompleteButton
          glowGirlId={glowGirl.id}
          lessonId={lesson.id}
          initialCompleted={lesson.completed}
        />
      </div>

      {/* Prev/Next navigation */}
      <div className="flex items-center justify-between">
        {prev_lesson_id ? (
          <Link
            href={`/glow-girl/journey/lesson/${prev_lesson_id}`}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            &larr; Previous Lesson
          </Link>
        ) : <div />}
        {next_lesson_id ? (
          <Link
            href={`/glow-girl/journey/lesson/${next_lesson_id}`}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            Next Lesson &rarr;
          </Link>
        ) : (
          <Link
            href={`/glow-girl/journey/week/${week.week_number}`}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            Back to Week {week.week_number}
          </Link>
        )}
      </div>
    </div>
  )
}

function formatContent(markdown: string): string {
  // Basic markdown → HTML (paragraphs, bold, italic, headers, lists)
  let html = markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Paragraphs for remaining lines
  html = html
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) return trimmed
      return `<p>${trimmed}</p>`
    })
    .join('\n')

  return html
}
