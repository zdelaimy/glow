import { SupabaseClient } from '@supabase/supabase-js'
import { computeUnlockedLevels } from './calculate'
import { RANK_LABELS } from './constants'
import type { CommissionSettings } from '@/types/database'

export async function recomputeRanksForUpline(
  supabase: SupabaseClient,
  glowGirlIds: string[],
  settings: CommissionSettings
) {
  if (glowGirlIds.length === 0) return

  const { data: ranks } = await supabase
    .from('glow_girl_ranks')
    .select('glow_girl_id, personal_recruits, group_volume_cents')
    .in('glow_girl_id', glowGirlIds)

  if (!ranks) return

  for (const rank of ranks) {
    const unlocked = computeUnlockedLevels(
      rank.personal_recruits,
      rank.group_volume_cents,
      settings
    )
    const label = RANK_LABELS[unlocked] || 'Starter'

    await supabase
      .from('glow_girl_ranks')
      .update({
        unlocked_levels: unlocked,
        rank_label: label,
        computed_at: new Date().toISOString(),
      })
      .eq('glow_girl_id', rank.glow_girl_id)
  }
}
