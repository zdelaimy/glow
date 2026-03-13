'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { MediaUpload } from './media-upload'
import { AnalysisResults } from './analysis-results'
import { PLATFORM_OPTIONS } from '@/lib/ai-studio/types'
import type { Platform, AnalysisResult, AIStudioProject } from '@/lib/ai-studio/types'

interface AnalyzeTabProps {
  onProjectCreated: (project: AIStudioProject) => void
}

export function AnalyzeTab({ onProjectCreated }: AnalyzeTabProps) {
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [title, setTitle] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asset, setAsset] = useState<{ id: string; file_name: string; file_type: string; storage_path: string } | null>(null)

  const handleAnalyze = async () => {
    if (!title.trim()) {
      setError('Please enter a project title')
      return
    }
    if (!asset || asset.id === 'pending') {
      setError('Please upload media first')
      return
    }

    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai-studio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platform || undefined,
          assetId: asset.id,
          title: title.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const data = await res.json()
      setResult(data.output.content)
      onProjectCreated(data.project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAnalyzing(false)
    }
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
            New Analysis
          </button>
        </div>
        <AnalysisResults result={result} />
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
          placeholder="e.g., Analyze My Latest Reel"
          className="mt-2 w-full rounded-xl border border-[#6E6A62]/10 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/30"
        />
      </div>

      {/* Media Upload */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <label className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-3 block">
          Upload Content
        </label>
        <MediaUpload
          projectId={null}
          onUploaded={(a) => setAsset(a)}
          onClear={() => setAsset(null)}
          currentAsset={asset}
        />
      </div>

      {/* Platform */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <label className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-3 block">
          Platform (Optional)
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setPlatform('')}
            className={`rounded-xl px-3 py-2 text-sm transition-colors ${
              platform === ''
                ? 'bg-[#6E6A62] text-white'
                : 'bg-[#f5f0eb] text-[#6E6A62]/60 hover:text-[#6E6A62]'
            }`}
          >
            Auto
          </button>
          {PLATFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlatform(opt.value)}
              className={`rounded-xl px-3 py-2 text-sm transition-colors ${
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={analyzing || !asset}
        className="w-full rounded-full bg-[#6E6A62] text-white py-3 text-sm font-medium hover:bg-[#5a574f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {analyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Analyze Content
          </>
        )}
      </button>

      {analyzing && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
              <div className="h-4 w-24 bg-[#f5f0eb] rounded-full animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#f5f0eb] rounded-full animate-pulse" />
                <div className="h-3 w-3/4 bg-[#f5f0eb] rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
