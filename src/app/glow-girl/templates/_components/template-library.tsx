'use client'

import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/lib/actions/templates'
import type { Template } from '@/types/database'
import { Copy, Check, Heart, Search } from 'lucide-react'

const PLATFORM_LABELS: Record<string, string> = {
  universal: 'All Platforms',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  email: 'Email',
  dm: 'DMs',
}

const CATEGORY_LABELS: Record<string, string> = {
  hook: 'Hooks',
  caption: 'Captions',
  dm_script: 'DM Scripts',
  objection: 'Objection Handling',
  story_script: 'Story Scripts',
  live_selling: 'Live Selling',
  launch_post: 'Launch Posts',
  product_feature: 'Product Features',
  recruitment: 'Recruitment',
  outreach: 'Outreach',
}

const STAGE_LABELS: Record<string, string> = {
  awareness: 'Awareness',
  interest: 'Interest',
  close: 'Close',
  follow_up: 'Follow Up',
  retention: 'Retention',
}

interface TemplateLibraryProps {
  initialTemplates: Template[]
  initialFavoriteIds: string[]
  categories: string[]
  glowGirlId: string
}

export function TemplateLibrary({
  initialTemplates,
  initialFavoriteIds,
  categories,
  glowGirlId,
}: TemplateLibraryProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [platformFilter, setPlatformFilter] = useState<string>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(initialFavoriteIds))

  // Client-side filtering
  const filtered = initialTemplates.filter((t) => {
    if (categoryFilter && t.category !== categoryFilter) return false
    if (platformFilter && t.platform !== platformFilter) return false
    if (showFavoritesOnly && !favoriteIds.has(t.id)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.body.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6A62]/30" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#6E6A62]/10 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/30"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#6E6A62]/10 text-sm text-[#6E6A62] focus:outline-none focus:border-[#6E6A62]/30 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
            ))}
          </select>

          {/* Platform */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#6E6A62]/10 text-sm text-[#6E6A62] focus:outline-none focus:border-[#6E6A62]/30 bg-white"
          >
            <option value="">All Platforms</option>
            {Object.entries(PLATFORM_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          {/* Favorites toggle */}
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${
              showFavoritesOnly
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'border-[#6E6A62]/10 text-[#6E6A62]/60 hover:border-[#6E6A62]/30'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isFavorited={favoriteIds.has(template.id)}
            glowGirlId={glowGirlId}
            onToggleFavorite={(isFav) => {
              setFavoriteIds((prev) => {
                const next = new Set(prev)
                if (isFav) next.add(template.id)
                else next.delete(template.id)
                return next
              })
            }}
          />
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
            <p className="text-[#6E6A62]/50">
              {initialTemplates.length === 0
                ? 'Templates are being prepared. Check back soon!'
                : 'No templates match your filters.'}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6E6A62]/30 text-center mt-6">
        {filtered.length} template{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function TemplateCard({
  template,
  isFavorited,
  glowGirlId,
  onToggleFavorite,
}: {
  template: Template
  isFavorited: boolean
  glowGirlId: string
  onToggleFavorite: (isFav: boolean) => void
}) {
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCopy() {
    navigator.clipboard.writeText(template.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFavorite() {
    const newState = !isFavorited
    onToggleFavorite(newState)
    startTransition(async () => {
      await toggleFavorite(glowGirlId, template.id)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200/60 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#6E6A62] truncate">{template.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-[#f5f0eb] text-[#6E6A62]/60 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[template.category] || template.category}
            </span>
            <span className="text-xs bg-[#f5f0eb] text-[#6E6A62]/60 px-2 py-0.5 rounded-full">
              {PLATFORM_LABELS[template.platform] || template.platform}
            </span>
            <span className="text-xs text-[#6E6A62]/40">
              {STAGE_LABELS[template.funnel_stage] || template.funnel_stage}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={isPending}
            className="p-2 rounded-lg hover:bg-[#f5f0eb] transition-colors"
          >
            <Heart className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[#6E6A62]/30'
            }`} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6E6A62] text-white hover:bg-[#5a574f] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <div className="px-6 py-4">
        <p className="text-sm text-[#6E6A62]/80 whitespace-pre-line leading-relaxed">{template.body}</p>
        {template.variables.length > 0 && (
          <div className="mt-3 flex items-center gap-1 flex-wrap">
            <span className="text-xs text-[#6E6A62]/40">Variables:</span>
            {template.variables.map((v) => (
              <span key={v} className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>
      {template.example_usage && (
        <div className="px-6 py-3 bg-[#f5f0eb]/30 border-t border-neutral-100">
          <p className="text-xs text-[#6E6A62]/50">
            <span className="font-medium">Example: </span>
            {template.example_usage}
          </p>
        </div>
      )}
    </div>
  )
}
