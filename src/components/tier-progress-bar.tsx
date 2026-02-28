'use client'

import { REWARD_TIERS } from '@/lib/commissions/constants'
import type { RewardTier } from '@/types/database'

interface Props {
  totalPoints: number
  currentTier: RewardTier | null
  milestones: { tier: RewardTier; created_at: string }[]
}

const TIER_COLORS: Record<RewardTier, string> = {
  PEARL: 'bg-neutral-300',
  OPAL: 'bg-[#b8c4c0]',
  ROSE_QUARTZ: 'bg-[#c4a68a]',
  AMETHYST: 'bg-[#8a7e72]',
  SAPPHIRE: 'bg-[#6E6A62]',
  DIAMOND: 'bg-gradient-to-r from-[#8a7e72] to-[#6E6A62]',
}

export function TierProgressBar({ totalPoints, currentTier, milestones }: Props) {
  const achievedTiers = new Set(milestones.map(m => m.tier))
  const maxPoints = REWARD_TIERS[REWARD_TIERS.length - 1].minPoints

  // Find next tier
  let nextTier = REWARD_TIERS[0]
  for (const t of REWARD_TIERS) {
    if (totalPoints < t.minPoints) {
      nextTier = t
      break
    }
    if (t === REWARD_TIERS[REWARD_TIERS.length - 1] && totalPoints >= t.minPoints) {
      nextTier = null as unknown as typeof nextTier
    }
  }

  const progressPct = Math.min(100, (totalPoints / maxPoints) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-light text-[#6E6A62]">{totalPoints.toLocaleString()}</span>
          <span className="text-[#6E6A62]/50 ml-2">points</span>
        </div>
        {currentTier && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${TIER_COLORS[currentTier] || 'bg-[#6E6A62]'}`}>
            {REWARD_TIERS.find(t => t.tier === currentTier)?.label || currentTier}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-[#f5f0eb] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6E6A62] rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
        {/* Tier markers */}
        {REWARD_TIERS.map((t) => {
          const pos = (t.minPoints / maxPoints) * 100
          return (
            <div
              key={t.tier}
              className="absolute top-0 h-full w-0.5 bg-white/50"
              style={{ left: `${pos}%` }}
            />
          )
        })}
      </div>

      {/* Tier labels */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {REWARD_TIERS.map((t) => (
          <div
            key={t.tier}
            className={`text-center p-2 rounded-lg text-xs ${
              achievedTiers.has(t.tier)
                ? 'bg-[#f5f0eb] text-[#6E6A62] font-medium'
                : totalPoints >= t.minPoints
                  ? 'bg-[#f5f0eb]/60 text-[#6E6A62]/70'
                  : 'bg-neutral-50 text-[#6E6A62]/40'
            }`}
          >
            <div className="font-medium">{t.label}</div>
            <div>{t.minPoints.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {nextTier && (
        <p className="text-sm text-[#6E6A62]/60 text-center">
          <strong>{(nextTier.minPoints - totalPoints).toLocaleString()}</strong> more points to reach{' '}
          <strong>{nextTier.label}</strong>
        </p>
      )}
    </div>
  )
}
