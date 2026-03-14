'use client'

import { useEffect, useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { GenerationResults } from './generation-results'
import { AnalysisResults } from './analysis-results'
import type { AIStudioProject, PostPackageResult, AnalysisResult, VideoPackageResult } from '@/lib/ai-studio/types'

interface ProjectDetailDialogProps {
  project: AIStudioProject | null
  onClose: () => void
}

export function ProjectDetailDialog({ project, onClose }: ProjectDetailDialogProps) {
  const [fullProject, setFullProject] = useState<AIStudioProject | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!project) {
      setFullProject(null)
      return
    }

    // If we already have outputs, use them
    if (project.outputs && project.outputs.length > 0) {
      setFullProject(project)
      return
    }

    // Otherwise fetch full detail
    setLoading(true)
    fetch(`/api/ai-studio/projects/${project.id}`)
      .then(r => r.json())
      .then(data => setFullProject(data.project))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [project])

  if (!project) return null

  const output = fullProject?.outputs?.[0]
  const content = output?.content

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200/60 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h2 className="font-medium text-[#6E6A62] truncate">{project.title}</h2>
            <p className="text-xs text-[#6E6A62]/50 mt-0.5">
              {project.type === 'video' ? 'Video Brief' : project.type === 'generate' ? 'Post Package' : 'Content Analysis'} &middot; {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f0eb] transition-colors shrink-0">
            <X className="w-4 h-4 text-[#6E6A62]" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[#f5f0eb] rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {content && output?.output_type === 'post_package' && (
            <GenerationResults result={content as PostPackageResult} />
          )}

          {content && output?.output_type === 'analysis' && (
            <AnalysisResults result={content as AnalysisResult} />
          )}

          {content && output?.output_type === 'video_package' && (
            <VideoPackageDisplay result={content as VideoPackageResult} />
          )}

          {!loading && !content && (
            <p className="text-center text-[#6E6A62]/50 py-12">No output available for this project.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoPackageDisplay({ result }: { result: VideoPackageResult }) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Text overlays */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#6E6A62]">Text Overlays</h3>
        {[
          { label: 'Hook', text: result.hook_text, field: 'hook' },
          { label: 'Body', text: result.body_text, field: 'body' },
          { label: 'CTA', text: result.cta_text, field: 'cta' },
        ].map(({ label, text, field }) => (
          <div key={field} className="bg-[#f5f0eb] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider text-[#6E6A62]/40 font-medium">{label}</span>
              <button
                onClick={() => handleCopy(text, field)}
                className="flex items-center gap-1 text-xs text-[#6E6A62]/50"
              >
                {copiedField === field ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <p className="text-sm text-[#6E6A62] font-medium">{text}</p>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#6E6A62]">Caption</h3>
          <button
            onClick={() => handleCopy(result.caption, 'caption')}
            className="flex items-center gap-1 text-xs text-[#6E6A62]/50"
          >
            {copiedField === 'caption' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
        <p className="text-sm text-[#6E6A62] leading-relaxed">{result.caption}</p>
      </div>

      {/* Hashtags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[#6E6A62]">Hashtags</h3>
          <button
            onClick={() => handleCopy(result.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' '), 'hashtags')}
            className="flex items-center gap-1 text-xs text-[#6E6A62]/50"
          >
            {copiedField === 'hashtags' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy All</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.hashtags.map((tag, i) => (
            <span key={i} className="text-xs bg-[#f5f0eb] text-[#6E6A62]/70 rounded-full px-2.5 py-1">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

      {/* Posting steps */}
      {result.posting_steps && result.posting_steps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#6E6A62] mb-3">How to Post</h3>
          <div className="space-y-2.5">
            {result.posting_steps.map((stepText, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-xs bg-[#6E6A62] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-medium">
                  {i + 1}
                </span>
                <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{stepText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
