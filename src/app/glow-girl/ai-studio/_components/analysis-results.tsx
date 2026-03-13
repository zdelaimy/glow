'use client'

import type { AnalysisResult } from '@/lib/ai-studio/types'

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6E6A62]/60">{label}</span>
        <span className="text-xs text-[#6E6A62]/60">{score}/100</span>
      </div>
      <div className="h-2 bg-[#f5f0eb] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 70 ? '#6E6A62' : score >= 40 ? '#d4a574' : '#c9756b',
          }}
        />
      </div>
    </div>
  )
}

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 text-center">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Overall Score</h3>
        <div className="relative w-28 h-28 mx-auto">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="#f5f0eb" strokeWidth="5" fill="none" />
            <circle
              cx="40" cy="40" r="36"
              stroke={result.overall_score >= 70 ? '#6E6A62' : result.overall_score >= 40 ? '#d4a574' : '#c9756b'}
              strokeWidth="5" fill="none"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36 - (result.overall_score / 100) * 2 * Math.PI * 36}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-light text-[#6E6A62]">
            {result.overall_score}
          </div>
        </div>
      </div>

      {/* Hook Analysis */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Hook Analysis</h3>
        <ScoreBar score={result.hook_analysis.score} label="Hook Strength" />
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-[#f5f0eb]/50">
            <span className="text-xs text-[#6E6A62]/40 uppercase tracking-wider">Current</span>
            <p className="text-sm text-[#6E6A62] mt-1">{result.hook_analysis.current}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/30">
            <span className="text-xs text-emerald-700/50 uppercase tracking-wider">Suggested Rewrite</span>
            <p className="text-sm text-emerald-900 mt-1">{result.hook_analysis.rewrite}</p>
          </div>
          <p className="text-sm text-[#6E6A62]/70">{result.hook_analysis.feedback}</p>
        </div>
      </div>

      {/* Visual Quality */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Visual Quality</h3>
        <div className="space-y-3">
          <ScoreBar score={result.visual_quality.lighting} label="Lighting" />
          <ScoreBar score={result.visual_quality.framing} label="Framing" />
          <ScoreBar score={result.visual_quality.background} label="Background" />
        </div>
        <p className="text-sm text-[#6E6A62]/70 mt-4">{result.visual_quality.feedback}</p>
      </div>

      {/* Pacing */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Pacing</h3>
        <ScoreBar score={result.pacing.score} label="Pacing Score" />
        <p className="text-sm text-[#6E6A62]/70 mt-4">{result.pacing.feedback}</p>
      </div>

      {/* Script Rewrite */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Script Rewrite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-[#f5f0eb]/50">
            <span className="text-xs text-[#6E6A62]/40 uppercase tracking-wider">Original</span>
            <p className="text-sm text-[#6E6A62] mt-2 whitespace-pre-wrap">{result.script_rewrite.original_summary}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/30">
            <span className="text-xs text-emerald-700/50 uppercase tracking-wider">Improved</span>
            <p className="text-sm text-emerald-900 mt-2 whitespace-pre-wrap">{result.script_rewrite.improved}</p>
          </div>
        </div>
      </div>

      {/* Platform Fit */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Platform Fit</h3>
        <div className="space-y-4">
          {result.platform_fit.map((pf, i) => (
            <div key={i}>
              <ScoreBar score={pf.score} label={pf.platform} />
              <p className="text-sm text-[#6E6A62]/70 mt-2">{pf.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prioritized Improvements */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium mb-4">Prioritized Improvements</h3>
        <div className="space-y-3">
          {result.improvements.map((imp, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f5f0eb]/50">
              <span className="w-6 h-6 rounded-full bg-[#6E6A62] text-white flex items-center justify-center text-xs shrink-0">
                {imp.priority}
              </span>
              <div>
                <p className="text-sm font-medium text-[#6E6A62]">{imp.title}</p>
                <p className="text-sm text-[#6E6A62]/60 mt-0.5">{imp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
