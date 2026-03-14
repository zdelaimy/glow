'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, Check, Loader2, ExternalLink, Music } from 'lucide-react'
import { TemplatePicker } from './template-picker'
import type { AIStudioProject, VideoTemplate, VideoPackageResult } from '@/lib/ai-studio/types'
import { PLATFORM_OPTIONS, TONE_OPTIONS } from '@/lib/ai-studio/types'

interface VideoTabProps {
  templates: VideoTemplate[]
  products: { id: string; name: string }[]
  onProjectCreated: (project: AIStudioProject) => void
}

type Step = 'browse' | 'details' | 'result'

export function VideoTab({ templates, products, onProjectCreated }: VideoTabProps) {
  const [step, setStep] = useState<Step>('browse')
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'both'>('both')
  const [tone, setTone] = useState<string>('')
  const [productId, setProductId] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VideoPackageResult | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleTemplateSelect = (template: VideoTemplate) => {
    setSelectedTemplate(template)
    setStep('details')
  }

  const handleGenerate = async () => {
    if (!selectedTemplate) return
    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/ai-studio/video/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          platform,
          tone: tone || undefined,
          productId: productId || undefined,
          title: `${selectedTemplate.name} — ${platform}`,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate')
      }

      const { project, output } = await res.json()
      setResult(output.content as VideoPackageResult)
      setStep('result')
      onProjectCreated(project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleStartOver = () => {
    setStep('browse')
    setSelectedTemplate(null)
    setResult(null)
    setPlatform('both')
    setTone('')
    setProductId('')
    setError(null)
  }

  // ─── Step 1: Browse inspo ───
  if (step === 'browse') {
    return (
      <div className="space-y-4">
        <div className="text-center px-2">
          <h2 className="text-lg font-medium text-[#6E6A62]">Video Inspo</h2>
          <p className="text-sm text-[#6E6A62]/50 mt-1">
            Pick a viral format. We&apos;ll give you everything you need to recreate it.
          </p>
        </div>
        <TemplatePicker templates={templates} onSelect={handleTemplateSelect} />
      </div>
    )
  }

  // ─── Step 2: Template detail + options ───
  if (step === 'details' && selectedTemplate) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => setStep('browse')}
          className="flex items-center gap-1 text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Template header */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <h2 className="text-lg font-medium text-[#6E6A62]">{selectedTemplate.name}</h2>
          {selectedTemplate.description && (
            <p className="text-sm text-[#6E6A62]/60 mt-1">{selectedTemplate.description}</p>
          )}

          {/* Example link */}
          {selectedTemplate.example_url && (
            <a
              href={selectedTemplate.example_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#6E6A62] underline"
            >
              <ExternalLink className="w-4 h-4" />
              Watch the inspo video
            </a>
          )}
        </div>

        {/* How to film */}
        {selectedTemplate.filming_instructions && (
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
            <h3 className="text-sm font-medium text-[#6E6A62] mb-3">How to Film This</h3>
            <div className="space-y-2.5">
              {selectedTemplate.filming_instructions.split('\n').map((line, i) => {
                const trimmed = line.trim()
                if (!trimmed) return null
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs bg-[#6E6A62]/10 text-[#6E6A62] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
                      {trimmed.replace(/^\d+\.\s*/, '')}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Sound suggestion */}
            {selectedTemplate.suggested_sound && (
              <div className="mt-4 flex items-start gap-2 bg-[#f5f0eb] rounded-xl p-3">
                <Music className="w-4 h-4 text-[#6E6A62]/50 shrink-0 mt-0.5" />
                <p className="text-xs text-[#6E6A62]/60">
                  <span className="font-medium text-[#6E6A62]/80">Sound tip:</span>{' '}
                  {selectedTemplate.suggested_sound}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <h3 className="text-sm font-medium text-[#6E6A62]">Customize Your Brief</h3>

          {/* Platform */}
          <div>
            <label className="text-xs text-[#6E6A62]/60 mb-1.5 block">Platform</label>
            <div className="flex gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPlatform(opt.value)}
                  className={`text-sm rounded-full px-4 py-2 transition-colors ${
                    platform === opt.value
                      ? 'bg-[#6E6A62] text-white'
                      : 'bg-[#f5f0eb] text-[#6E6A62]/60 active:bg-[#6E6A62]/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs text-[#6E6A62]/60 mb-1.5 block">Vibe (optional)</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(tone === opt.value ? '' : opt.value)}
                  className={`text-sm rounded-full px-3 py-1.5 transition-colors ${
                    tone === opt.value
                      ? 'bg-[#6E6A62] text-white'
                      : 'bg-[#f5f0eb] text-[#6E6A62]/60 active:bg-[#6E6A62]/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          {products.length > 0 && (
            <div>
              <label className="text-xs text-[#6E6A62]/60 mb-1 block">Feature a product (optional)</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-xl border border-[#6E6A62]/15 px-4 py-2.5 text-sm text-[#6E6A62] bg-white focus:outline-none focus:border-[#6E6A62]/40"
              >
                <option value="">None</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center px-4">{error}</p>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={creating}
          className="w-full py-3.5 rounded-full bg-[#6E6A62] text-white text-sm font-medium active:bg-[#5a5650] transition-colors disabled:opacity-50"
        >
          {creating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating your brief...
            </span>
          ) : (
            'Generate My Content Brief'
          )}
        </button>
      </div>
    )
  }

  // ─── Step 3: Result ───
  if (step === 'result' && result && selectedTemplate) {
    return (
      <div className="space-y-4">
        {/* Back / Start over */}
        <button
          onClick={handleStartOver}
          className="flex items-center gap-1 text-sm text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New video
        </button>

        <div className="text-center px-2">
          <h2 className="text-lg font-medium text-[#6E6A62]">Your Content Brief</h2>
          <p className="text-sm text-[#6E6A62]/50 mt-1">
            {selectedTemplate.name} — ready to post
          </p>
        </div>

        {/* Text overlays to add */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 space-y-4">
          <h3 className="text-sm font-medium text-[#6E6A62]">Text to Add in Your Video</h3>
          <p className="text-xs text-[#6E6A62]/40">Copy these and add as text overlays in TikTok or Instagram</p>

          {/* Hook */}
          <CopyBlock
            label="Hook (show first 1-2 seconds)"
            text={result.hook_text}
            field="hook"
            copiedField={copiedField}
            onCopy={handleCopy}
          />

          {/* Body */}
          <CopyBlock
            label="Main text (show during video)"
            text={result.body_text}
            field="body"
            copiedField={copiedField}
            onCopy={handleCopy}
          />

          {/* CTA */}
          <CopyBlock
            label="CTA (show at the end)"
            text={result.cta_text}
            field="cta"
            copiedField={copiedField}
            onCopy={handleCopy}
          />
        </div>

        {/* Caption */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#6E6A62]">Caption</h3>
            <button
              onClick={() => handleCopy(result.caption, 'caption')}
              className="flex items-center gap-1 text-xs text-[#6E6A62]/50 active:text-[#6E6A62]"
            >
              {copiedField === 'caption' ? (
                <><Check className="w-3 h-3" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>
          </div>
          <p className="text-sm text-[#6E6A62] leading-relaxed whitespace-pre-wrap">{result.caption}</p>
        </div>

        {/* Hashtags */}
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6E6A62]">Hashtags</h3>
            <button
              onClick={() => handleCopy(result.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' '), 'hashtags')}
              className="flex items-center gap-1 text-xs text-[#6E6A62]/50 active:text-[#6E6A62]"
            >
              {copiedField === 'hashtags' ? (
                <><Check className="w-3 h-3" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy All</>
              )}
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
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-5">
            <h3 className="text-sm font-medium text-[#6E6A62] mb-3">How to Post</h3>
            <div className="space-y-3">
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

        {/* Sound tip from template */}
        {selectedTemplate.suggested_sound && (
          <div className="flex items-start gap-3 bg-[#f5f0eb] rounded-2xl p-4">
            <Music className="w-5 h-5 text-[#6E6A62]/50 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#6E6A62]/80">Sound Tip</p>
              <p className="text-sm text-[#6E6A62]/60 mt-0.5">{selectedTemplate.suggested_sound}</p>
            </div>
          </div>
        )}

        {/* Start over */}
        <button
          onClick={handleStartOver}
          className="w-full py-3 rounded-full border border-[#6E6A62]/20 text-sm text-[#6E6A62] active:bg-[#f5f0eb] transition-colors"
        >
          Create Another Video
        </button>
      </div>
    )
  }

  return null
}

// ─── Copy block component ───
function CopyBlock({
  label,
  text,
  field,
  copiedField,
  onCopy,
}: {
  label: string
  text: string
  field: string
  copiedField: string | null
  onCopy: (text: string, field: string) => void
}) {
  return (
    <div className="bg-[#f5f0eb] rounded-xl p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wider text-[#6E6A62]/40 font-medium">{label}</span>
        <button
          onClick={() => onCopy(text, field)}
          className="flex items-center gap-1 text-xs text-[#6E6A62]/50 active:text-[#6E6A62]"
        >
          {copiedField === field ? (
            <><Check className="w-3 h-3" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </button>
      </div>
      <p className="text-sm text-[#6E6A62] font-medium leading-snug">{text}</p>
    </div>
  )
}
