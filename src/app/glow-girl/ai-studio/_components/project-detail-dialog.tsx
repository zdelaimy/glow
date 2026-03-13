'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GenerationResults } from './generation-results'
import { AnalysisResults } from './analysis-results'
import type { AIStudioProject, PostPackageResult, AnalysisResult } from '@/lib/ai-studio/types'

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
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-neutral-200/60 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-medium text-[#6E6A62]">{project.title}</h2>
            <p className="text-xs text-[#6E6A62]/50 mt-0.5">
              {project.type === 'generate' ? 'Post Package' : 'Content Analysis'} &middot; {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f0eb] transition-colors">
            <X className="w-4 h-4 text-[#6E6A62]" />
          </button>
        </div>

        <div className="p-6">
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

          {!loading && !content && (
            <p className="text-center text-[#6E6A62]/50 py-12">No output available for this project.</p>
          )}
        </div>
      </div>
    </div>
  )
}
