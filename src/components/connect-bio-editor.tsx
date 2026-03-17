'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Upload } from 'lucide-react'

interface ConnectBioEditorProps {
  glowGirlId: string
  initialHeadline: string | null
  initialBio: string | null
  initialPhotoUrl: string | null
}

export function ConnectBioEditor({ glowGirlId, initialHeadline, initialBio, initialPhotoUrl }: ConnectBioEditorProps) {
  const [headline, setHeadline] = useState(initialHeadline || '')
  const [bio, setBio] = useState(initialBio || '')
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/leads/connect-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          glow_girl_id: glowGirlId,
          connect_headline: headline || null,
          connect_bio: bio || null,
          connect_photo_url: photoUrl || null,
        }),
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
        <Upload className="w-4 h-4 text-[#6E6A62]/50" />
        <h2 className="text-xl font-light text-[#6E6A62]">Connect Page Bio</h2>
      </div>
      <p className="text-sm text-[#6E6A62]/50 mb-5">
        Personalize your connect form with a photo, headline, and bio. This is what visitors see before they fill out the form.
      </p>

      <div className="space-y-4">
        {/* Photo preview + URL */}
        <div className="flex items-start gap-4">
          {photoUrl ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#6E6A62]/10">
              <Image src={photoUrl} alt="Profile" fill className="object-cover" sizes="64px" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#f5f0eb] shrink-0 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#6E6A62]/30" />
            </div>
          )}
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-[0.12em] text-[#6E6A62]/50 block mb-1.5">
              Photo URL
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://your-image-url.com/photo.jpg"
              className="w-full rounded-xl border border-[#6E6A62]/15 bg-[#f5f0eb]/50 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40 transition-colors"
            />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-[#6E6A62]/50 block mb-1.5">
            Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Work from anywhere with me"
            maxLength={100}
            className="w-full rounded-xl border border-[#6E6A62]/15 bg-[#f5f0eb]/50 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-[#6E6A62]/50 block mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story — who you are, why you love Glow, what excites you about this opportunity..."
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border border-[#6E6A62]/15 bg-[#f5f0eb]/50 px-4 py-2.5 text-sm text-[#6E6A62] placeholder:text-[#6E6A62]/30 focus:outline-none focus:border-[#6E6A62]/40 transition-colors resize-none"
          />
          <p className="text-[11px] text-[#6E6A62]/30 mt-1 text-right">{bio.length}/500</p>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[#6E6A62] text-white hover:bg-[#5a5650] disabled:opacity-50'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Saved!
            </span>
          ) : saving ? 'Saving...' : 'Save Bio'}
        </button>
      </div>
    </div>
  )
}
