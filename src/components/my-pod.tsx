'use client'

import { useEffect, useState } from 'react'
import { getPodData, type PodData, type PodMember } from '@/lib/actions/team'

const FAKE_RECRUITER: PodMember = {
  id: 'up-1',
  brandName: 'Jessica Glow',
  joinedAt: '2025-06-15T00:00:00Z',
  email: 'jessica@example.com',
  phone: '+1 (555) 123-4567',
  primaryHandle: '@jessicaglow',
  socialPlatforms: ['instagram', 'tiktok'],
}

const FAKE_RECRUITS: PodMember[] = [
  { id: 'down-1', brandName: 'Mia Luxe', joinedAt: '2025-09-01T00:00:00Z', email: 'mia@example.com', phone: '+1 (555) 234-5678', primaryHandle: '@mialuxe', socialPlatforms: ['instagram'] },
  { id: 'down-2', brandName: 'Olivia Skin', joinedAt: '2025-10-14T00:00:00Z', email: 'olivia@example.com', phone: '+1 (555) 345-6789', primaryHandle: '@oliviaskin', socialPlatforms: ['tiktok'] },
  { id: 'down-3', brandName: 'Ava Belle', joinedAt: '2025-12-02T00:00:00Z', email: 'ava@example.com', phone: '+1 (555) 456-7890', primaryHandle: '@avabelle', socialPlatforms: ['instagram', 'tiktok'] },
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

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
          This is a preview with sample data. Your actual pod will appear here as you build your team.
        </div>
      )}

      {/* WhatsApp tip */}
      <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">Use WhatsApp to stay connected</p>
            <p className="text-xs text-emerald-700/70 mt-0.5">
              Use the contact info below to create WhatsApp groups with your Glow Mother and Glow Babes.
            </p>
          </div>
        </div>
      </div>

      {/* Upline — My Glow Mother */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">My Glow Mother</h3>
          <p className="text-xs text-[#6E6A62]/40 mt-1">The Glow Girl who recruited you — your mentor and support</p>
        </div>
        <div className="p-6">
          {!recruiter ? (
            <p className="text-center text-[#6E6A62]/50 py-4">No upline — you&apos;re at the top!</p>
          ) : (
            <MemberCard member={recruiter} isDemo={isDemo} />
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

      {/* Downline — My Glow Babes */}
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
            <div className="grid gap-4">
              {displayRecruits.map((member) => (
                <MemberCard key={member.id} member={member} isDemo={isDemo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MemberCard({ member, isDemo }: { member: PodMember; isDemo: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-[#6E6A62]/10 bg-[#f5f0eb]/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#f5f0eb]/60 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E6A62]/20 to-[#6E6A62]/5 flex items-center justify-center text-base font-medium text-[#6E6A62] shrink-0">
          {member.brandName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#6E6A62] truncate">{member.brandName}</p>
          <p className="text-xs text-[#6E6A62]/40">
            Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-[#6E6A62]/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#6E6A62]/5">
          <div className="grid gap-2.5">
            {/* Email */}
            {member.email && (
              <ContactRow
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
                label="Email"
                value={isDemo ? 'example@email.com' : member.email}
                href={isDemo ? undefined : `mailto:${member.email}`}
                isDemo={isDemo}
              />
            )}

            {/* Phone */}
            {member.phone && (
              <ContactRow
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                }
                label="Phone"
                value={isDemo ? '+1 (555) 000-0000' : member.phone}
                href={isDemo ? undefined : `tel:${member.phone}`}
                isDemo={isDemo}
              />
            )}

            {/* Social handle */}
            {member.primaryHandle && (
              <ContactRow
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                  </svg>
                }
                label={member.socialPlatforms.length > 0 ? member.socialPlatforms.join(' / ') : 'Social'}
                value={isDemo ? '@handle' : member.primaryHandle}
                isDemo={isDemo}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ContactRow({ icon, label, value, href, isDemo }: { icon: React.ReactNode; label: string; value: string; href?: string; isDemo: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-7 h-7 rounded-lg bg-[#6E6A62]/10 flex items-center justify-center text-[#6E6A62]/60 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#6E6A62]/40 font-medium">{label}</p>
        {href && !isDemo ? (
          <a href={href} className="text-sm text-[#6E6A62] hover:underline truncate block">
            {value}
          </a>
        ) : (
          <p className={`text-sm truncate ${isDemo ? 'text-[#6E6A62]/40' : 'text-[#6E6A62]'}`}>{value}</p>
        )}
      </div>
    </div>
  )
}
