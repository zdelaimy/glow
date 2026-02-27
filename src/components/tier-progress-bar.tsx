'use client'

import { REWARD_TIERS } from '@/lib/commissions/constants'
import type { RewardTier } from '@/types/database'

interface Props {
  totalPoints: number
  currentTier: RewardTier | null
  milestones: { tier: RewardTier; created_at: string }[]
}

const TIER_COLORS: Record<RewardTier, string> = {
  PEARL: 'bg-gray-200',
  OPAL: 'bg-blue-200',
  ROSE_QUARTZ: 'bg-pink-300',
  AMETHYST: 'bg-purple-400',
  SAPPHIRE: 'bg-blue-500',
  DIAMOND: 'bg-gradient-to-r from-cyan-300 to-violet-400',
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
          <span className="text-2xl font-bold">{totalPoints.toLocaleString()}</span>
          <span className="text-muted-foreground ml-2">points</span>
        </div>
        {currentTier && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${TIER_COLORS[currentTier] || 'bg-gray-400'}`}>
            {REWARD_TIERS.find(t => t.tier === currentTier)?.label || currentTier}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full transition-all duration-700"
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
                ? 'bg-violet-100 text-violet-700 font-medium'
                : totalPoints >= t.minPoints
                  ? 'bg-violet-50 text-violet-600'
                  : 'bg-gray-50 text-muted-foreground'
            }`}
          >
            <div className="font-medium">{t.label}</div>
            <div>{t.minPoints.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {nextTier && (
        <p className="text-sm text-muted-foreground text-center">
          <strong>{(nextTier.minPoints - totalPoints).toLocaleString()}</strong> more points to reach{' '}
          <strong>{nextTier.label}</strong>
        </p>
      )}
    </div>
  )
}
