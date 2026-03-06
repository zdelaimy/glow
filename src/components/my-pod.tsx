'use client'

import { useEffect, useState } from 'react'
import { getPodData, type PodData, type PodMember } from '@/lib/actions/team'

const FAKE_RECRUITER: PodMember = {
  id: 'up-1',
  brandName: 'Jessica Glow',
  joinedAt: '2025-06-15T00:00:00Z',
}

const FAKE_RECRUITS: PodMember[] = [
  { id: 'down-1', brandName: 'Mia Luxe', joinedAt: '2025-09-01T00:00:00Z' },
  { id: 'down-2', brandName: 'Olivia Skin', joinedAt: '2025-10-14T00:00:00Z' },
  { id: 'down-3', brandName: 'Ava Belle', joinedAt: '2025-12-02T00:00:00Z' },
]

export function MyPod({ glowGirlId, glowGirlName }: { glowGirlId: string; glowGirlName: string }) {
  const [podData, setPodData] = useState<PodData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPodData(glowGirlId)
      .then((data) => {
        setPodData(data)
        const hasReal = data.recruiter !== null || data.directRecruits.length > 0
        setIsDemo(!hasReal)
      })
      .catch(() => {
        setPodData(null)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
  }, [glowGirlId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
        <div className="animate-pulse text-[#6E6A62]/50">Loading your pod...</div>
      </div>
    )
  }

  const recruiter = podData?.recruiter ?? (isDemo ? FAKE_RECRUITER : null)
  const directRecruits = podData?.directRecruits ?? []
  const displayRecruits = directRecruits.length > 0 ? directRecruits : (isDemo ? FAKE_RECRUITS : [])
  const recruiterSlackLink = podData?.recruiterSlackLink ?? null
  const mySlackLink = podData?.mySlackLink ?? null

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
          This is a preview with sample data. Your actual pod will appear here as you build your team.
        </div>
      )}

      {/* Upline Pod */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">My Glow Mother</h3>
          <p className="text-xs text-[#6E6A62]/40 mt-1">The Glow Girl who recruited you — your mentor and support</p>
        </div>
        <div className="p-6">
          {!recruiter ? (
            <p className="text-center text-[#6E6A62]/50 py-4">No upline — you&apos;re at the top!</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6E6A62]/20 to-[#6E6A62]/5 flex items-center justify-center text-lg font-medium text-[#6E6A62]">
                  {recruiter.brandName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#6E6A62] text-lg">{recruiter.brandName}</p>
                  <p className="text-xs text-[#6E6A62]/40">
                    Your recruiter &middot; Joined {new Date(recruiter.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {recruiterSlackLink && (
                <SlackChannelCard
                  label="My Glow Mother"
                  description={`Chat with ${recruiter.brandName} and her other recruits`}
                  link={recruiterSlackLink}
                />
              )}
              {!recruiterSlackLink && !isDemo && (
                <p className="text-xs text-[#6E6A62]/40 italic">Slack channel not yet set up for this pod.</p>
              )}
              {isDemo && (
                <SlackChannelCard
                  label="My Glow Mother"
                  description={`Chat with ${recruiter.brandName} and her other recruits`}
                  link="#"
                  disabled
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* YOU node */}
      <div className="flex justify-center">
        <div className="bg-[#6E6A62] text-white rounded-2xl px-8 py-4 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1">You</div>
          <div className="font-medium text-lg">{glowGirlName}</div>
        </div>
      </div>

      {/* Downline Pod */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">My Glow Babes</h3>
          <p className="text-xs text-[#6E6A62]/40 mt-1">Your direct recruits — the Glow Girls you&apos;re mentoring</p>
        </div>
        <div className="p-6">
          {displayRecruits.length === 0 ? (
            <p className="text-center text-[#6E6A62]/50 py-6">
              No recruits yet. Share your referral link to build your pod!
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {displayRecruits.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[#f5f0eb]/40 border border-[#6E6A62]/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-700">
                      {member.brandName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#6E6A62] truncate">{member.brandName}</p>
                      <p className="text-xs text-[#6E6A62]/40">
                        Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {mySlackLink && (
                <SlackChannelCard
                  label="My Glow Babes"
                  description={`Chat with your ${displayRecruits.length} direct recruit${displayRecruits.length === 1 ? '' : 's'}`}
                  link={mySlackLink}
                />
              )}
              {!mySlackLink && !isDemo && (
                <p className="text-xs text-[#6E6A62]/40 italic">Slack channel not yet set up for your pod.</p>
              )}
              {isDemo && (
                <SlackChannelCard
                  label="My Glow Babes"
                  description={`Chat with your ${displayRecruits.length} direct recruit${displayRecruits.length === 1 ? '' : 's'}`}
                  link="#"
                  disabled
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SlackChannelCard({ label, description, link, disabled }: { label: string; description: string; link: string; disabled?: boolean }) {
  return (
    <div className="rounded-xl border border-[#6E6A62]/10 bg-[#f5f0eb]/30 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#6E6A62]">{label}</p>
          <p className="text-xs text-[#6E6A62]/50 mt-0.5">{description}</p>
        </div>
        <a
          href={disabled ? undefined : link}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
            disabled
              ? 'bg-[#4A154B]/40 text-white/60 cursor-not-allowed'
              : 'bg-[#4A154B] text-white hover:bg-[#3a1039] cursor-pointer'
          }`}
          onClick={disabled ? (e) => e.preventDefault() : undefined}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Open in Slack
        </a>
      </div>
    </div>
  )
}
