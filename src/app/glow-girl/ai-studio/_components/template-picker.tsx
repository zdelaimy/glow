'use client'

import { ExternalLink, Clock, Music, ChevronRight } from 'lucide-react'
import type { VideoTemplate } from '@/lib/ai-studio/types'

interface TemplatePickerProps {
  templates: VideoTemplate[]
  onSelect: (template: VideoTemplate) => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  grwm: '💄',
  before_after: '✨',
  product_spotlight: '🧴',
  testimonial: '💬',
}

export function TemplatePicker({ templates, onSelect }: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className="w-full text-left bg-white rounded-2xl border border-neutral-200/60 overflow-hidden active:scale-[0.98] transition-transform"
        >
          {/* Top section: thumbnail or gradient placeholder */}
          {template.thumbnail_url ? (
            <img
              src={template.thumbnail_url}
              alt={template.name}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-28 bg-gradient-to-br from-[#f5f0eb] to-[#e8e2db] flex items-center justify-center">
              <span className="text-4xl">{CATEGORY_EMOJI[template.category] || '🎬'}</span>
            </div>
          )}

          {/* Info section */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-medium text-[#6E6A62]">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-[#6E6A62]/60 mt-1 line-clamp-2">{template.description}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-[#6E6A62]/30 shrink-0 mt-0.5" />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {template.duration_hint && (
                <span className="flex items-center gap-1 text-xs text-[#6E6A62]/40">
                  <Clock className="w-3 h-3" />
                  {template.duration_hint}
                </span>
              )}
              {template.suggested_sound && (
                <span className="flex items-center gap-1 text-xs text-[#6E6A62]/40">
                  <Music className="w-3 h-3" />
                  Sound tip included
                </span>
              )}
              <span className="text-[10px] bg-[#f5f0eb] rounded-full px-2 py-0.5 text-[#6E6A62]/50 uppercase tracking-wider">
                {template.platform === 'both' ? 'TikTok + IG' : template.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
              </span>
            </div>

            {/* Example link */}
            {template.example_url && (
              <a
                href={template.example_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-[#6E6A62]/60 underline mt-3 hover:text-[#6E6A62]"
              >
                <ExternalLink className="w-3 h-3" />
                Watch example
              </a>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
