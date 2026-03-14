'use client'

import { useState } from 'react'
import { Trash2, Eye, Sparkles, Search, Video } from 'lucide-react'
import { ProjectDetailDialog } from './project-detail-dialog'
import type { AIStudioProject, PostPackageResult } from '@/lib/ai-studio/types'

interface HistoryTabProps {
  projects: AIStudioProject[]
  onProjectsChange: (projects: AIStudioProject[]) => void
}

export function HistoryTab({ projects, onProjectsChange }: HistoryTabProps) {
  const [selectedProject, setSelectedProject] = useState<AIStudioProject | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return

    setDeleting(projectId)
    try {
      const res = await fetch('/api/ai-studio/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (res.ok) {
        onProjectsChange(projects.filter(p => p.id !== projectId))
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  const getViralScore = (project: AIStudioProject): number | null => {
    const output = project.outputs?.[0]
    if (output?.output_type === 'post_package') {
      return (output.content as PostPackageResult)?.viral_score?.overall ?? null
    }
    return null
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/60 py-16 text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#6E6A62]/20" />
        <p className="text-[#6E6A62]/50">No projects yet. Create your first post package!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {projects.map((project) => {
          const viralScore = getViralScore(project)
          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-neutral-200/60 p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  project.type === 'video' ? 'bg-pink-50 text-pink-600' : project.type === 'generate' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {project.type === 'video' ? <Video className="w-4 h-4" /> : project.type === 'generate' ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#6E6A62] truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      project.type === 'video' ? 'bg-pink-50 text-pink-600' : project.type === 'generate' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {project.type === 'video' ? 'Video' : project.type === 'generate' ? 'Generate' : 'Analyze'}
                    </span>
                    {project.platform && (
                      <span className="text-xs text-[#6E6A62]/40">{project.platform}</span>
                    )}
                    {project.product && (
                      <span className="text-xs text-[#6E6A62]/40">{project.product.name}</span>
                    )}
                    <span className="text-xs text-[#6E6A62]/30">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {viralScore !== null && (
                  <span className={`text-sm font-medium ${
                    viralScore >= 70 ? 'text-emerald-600' : viralScore >= 40 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {viralScore}
                  </span>
                )}
                <button
                  onClick={() => setSelectedProject(project)}
                  className="p-2 rounded-full hover:bg-[#f5f0eb] transition-colors text-[#6E6A62]/50 hover:text-[#6E6A62]"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deleting === project.id}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors text-[#6E6A62]/30 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ProjectDetailDialog
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}
