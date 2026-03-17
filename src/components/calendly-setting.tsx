'use client'

import { useState } from 'react'
import { Calendar, Check } from 'lucide-react'

interface CalendlySettingProps {
  glowGirlId: string
  initialUrl: string | null
}

export function CalendlySetting({ glowGirlId, initialUrl }: CalendlySettingProps) {
  const [url, setUrl] = useState(initialUrl || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/leads/calendly', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glow_girl_id: glowGirlId, calendly_url: url || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-[#6E6A62]/50" />
        <h2 className="text-xl font-light text-[#6E6A62]">Calendly Integration</h2>
      </div>
      <p className="text-sm text-[#6E6A62]/50 mb-4">
        Paste your Calendly scheduling link to embed it on your connect form.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://calendly.com/your-name/30min"
          className="flex-1 rounded-full border border-[#6E6A62]/20 bg-[#f5f0eb]/50 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#6E6A62] text-white hover:bg-[#5a5650] disabled:opacity-50'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Saved!
            </span>
          ) : saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
    </div>
  )
}
