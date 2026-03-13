'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import type { PostPackageResult } from '@/lib/ai-studio/types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 rounded hover:bg-[#f5f0eb] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#6E6A62]/40" />}
    </button>
  )
}

function ScoreGauge({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' }) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference
  const dim = size === 'sm' ? 'w-16 h-16' : 'w-24 h-24'
  const textSize = size === 'sm' ? 'text-sm' : 'text-xl'
  const viewBox = '0 0 80 80'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${dim}`}>
        <svg viewBox={viewBox} className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="#f5f0eb" strokeWidth="5" fill="none" />
          <circle
            cx="40" cy="40" r="36"
            stroke={score >= 70 ? '#6E6A62' : score >= 40 ? '#d4a574' : '#c9756b'}
            strokeWidth="5" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${textSize} font-light text-[#6E6A62]`}>
          {score}
        </div>
      </div>
      <span className="text-xs text-[#6E6A62]/50 uppercase tracking-wider">{label}</span>
    </div>
  )
}

interface GenerationResultsProps {
  result: PostPackageResult
  onRegenerate?: () => void
  regenerating?: boolean
}

export function GenerationResults({ result, onRegenerate, regenerating }: GenerationResultsProps) {
  return (
    <div className="space-y-6">
      {/* Viral Score */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Viral Score</h3>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-xs text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <ScoreGauge score={result.viral_score.overall} label="Overall" />
          <ScoreGauge score={result.viral_score.hook_strength} label="Hook" size="sm" />
          <ScoreGauge score={result.viral_score.relatability} label="Relatable" size="sm" />
          <ScoreGauge score={result.viral_score.shareability} label="Shareable" size="sm" />
          <ScoreGauge score={result.viral_score.trend_alignment} label="Trending" size="sm" />
        </div>
      </div>

      {/* Hooks */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Hooks</h3>
        <div className="space-y-3">
          {result.hooks.map((hook, i) => (
            <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#f5f0eb]/50">
              <div className="flex-1">
                <p className="text-sm text-[#6E6A62]">&ldquo;{hook.text}&rdquo;</p>
                <span className="text-xs text-[#6E6A62]/40 mt-1 inline-block">{hook.style}</span>
              </div>
              <CopyButton text={hook.text} />
            </div>
          ))}
        </div>
      </div>

      {/* Script */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Script Concept</h3>
        <div className="space-y-0">
          {result.scripts.map((section, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-neutral-100 last:border-0">
              <div className="w-16 shrink-0 text-xs text-[#6E6A62]/40 pt-0.5">{section.timestamp}</div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#6E6A62]/60 uppercase tracking-wider mb-1">{section.section}</p>
                <p className="text-sm text-[#6E6A62]">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Captions */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Captions</h3>
        <div className="space-y-4">
          {result.captions.map((cap, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#f5f0eb]/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6E6A62]/60 uppercase tracking-wider">{cap.platform}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6E6A62]/40">{cap.char_count} chars</span>
                  <CopyButton text={cap.text} />
                </div>
              </div>
              <p className="text-sm text-[#6E6A62] whitespace-pre-wrap">{cap.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">CTAs</h3>
        <div className="space-y-2">
          {result.ctas.map((cta, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#f5f0eb]/50">
              <p className="text-sm text-[#6E6A62]">{cta}</p>
              <CopyButton text={cta} />
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Hashtags</h3>
          <CopyButton text={result.hashtags.join(' ')} />
        </div>
        <div className="flex flex-wrap gap-2">
          {result.hashtags.map((tag, i) => (
            <span key={i} className="text-sm text-[#6E6A62]/70 bg-[#f5f0eb] rounded-full px-3 py-1">{tag}</span>
          ))}
        </div>
      </div>

      {/* Edit Recommendations */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Edit Recommendations</h3>
        <ul className="space-y-2">
          {result.edit_recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#6E6A62]">
              <span className="w-5 h-5 rounded-full bg-[#f5f0eb] flex items-center justify-center text-xs text-[#6E6A62]/60 shrink-0 mt-0.5">{i + 1}</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Thumbnail + Best Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-3">Thumbnail Suggestion</h3>
          <p className="text-sm text-[#6E6A62]">{result.thumbnail_suggestion}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-3">Best Time to Post</h3>
          <p className="text-sm text-[#6E6A62]">{result.best_posting_time}</p>
        </div>
      </div>
    </div>
  )
}
