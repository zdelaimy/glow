'use client'

import { useState, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { MediaUpload } from './media-upload'
import { GenerationResults } from './generation-results'
import { PLATFORM_OPTIONS, GOAL_OPTIONS, TONE_OPTIONS } from '@/lib/ai-studio/types'
import type { Platform, Goal, Tone, PostPackageResult, AIStudioProject } from '@/lib/ai-studio/types'

interface CreateTabProps {
  products: { id: string; name: string }[]
  onProjectCreated: (project: AIStudioProject) => void
}

export function CreateTab({ products, onProjectCreated }: CreateTabProps) {
  const [platform, setPlatform] = useState<Platform>('tiktok')
  const [goal, setGoal] = useState<Goal>('sell_product')
  const [productId, setProductId] = useState<string>('')
  const [tone, setTone] = useState<Tone>('clean_girl')
  const [audience, setAudience] = useState('')
  const [title, setTitle] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<PostPackageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asset, setAsset] = useState<{ id: string; file_name: string; file_type: string; storage_path: string } | null>(null)
  const pendingFileRef = useRef<File | null>(null)

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a project title')
      return
    }

    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      // If there's a pending file, upload it first
      let assetId = asset?.id !== 'pending' ? asset?.id : undefined

      if (asset?.id === 'pending' && pendingFileRef.current) {
        // Create a temporary project first, then upload
        // Actually, the generate endpoint creates the project — we'll skip pre-upload for now
        // and just send without asset
        assetId = undefined
      }

      const res = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          goal,
          productId: productId || undefined,
          tone,
          audience: audience || undefined,
          assetId,
          title: title.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setResult(data.output.content)
      onProjectCreated(data.project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    await handleGenerate()
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-light text-[#6E6A62]">{title}</h2>
          <button
            onClick={() => {
              setResult(null)
              setTitle('')
              setAsset(null)
            }}
            className="text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
          >
            New Project
          </button>
        </div>
        <GenerationResults result={result} onRegenerate={handleRegenerate} regenerating={generating} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <label className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Project Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Spring Launch TikTok Series"
          className="mt-2 w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/30"
        />
      </div>

      {/* Media Upload */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <label className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-3 block">
          Media (Optional)
        </label>
        <MediaUpload
          projectId={null}
          onUploaded={(a) => setAsset(a)}
          onClear={() => { setAsset(null); pendingFileRef.current = null }}
          currentAsset={asset}
        />
      </div>

      {/* Campaign Settings */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-5">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Campaign Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Platform */}
          <div>
            <label className="text-xs text-[#6E6A62]/50 block mb-1.5">Platform</label>
            <div className="flex gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPlatform(opt.value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm transition-colors ${
                    platform === opt.value
                      ? 'bg-[#6E6A62] text-white'
                      : 'bg-[#f5f0eb] text-[#6E6A62]/60 hover:text-[#6E6A62]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs text-[#6E6A62]/50 block mb-1.5">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className="w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] focus:outline-none focus:border-[#6E6A62]/30 bg-white"
            >
              {GOAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="text-xs text-[#6E6A62]/50 block mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] focus:outline-none focus:border-[#6E6A62]/30 bg-white"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs text-[#6E6A62]/50 block mb-1.5">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] focus:outline-none focus:border-[#6E6A62]/30 bg-white"
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="text-xs text-[#6E6A62]/50 block mb-1.5">Target Audience (Optional)</label>
          <textarea
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Women 25-35 interested in clean beauty, skincare routines..."
            rows={2}
            className="w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/30 resize-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full rounded-full bg-[#6E6A62] text-white py-3 text-sm font-medium hover:bg-[#5a574f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Post Package
          </>
        )}
      </button>

      {/* Loading skeleton */}
      {generating && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
              <div className="h-4 w-24 bg-[#f5f0eb] rounded-full animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#f5f0eb] rounded-full animate-pulse" />
                <div className="h-3 w-3/4 bg-[#f5f0eb] rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-[#f5f0eb] rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
