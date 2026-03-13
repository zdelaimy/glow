import { createClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 50

export async function checkDailyLimit(glowGirlId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_studio_projects')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirlId)
    .in('status', ['processing', 'completed'])
    .gte('created_at', todayStart.toISOString())

  const used = count || 0
  return { allowed: used < DAILY_LIMIT, used, limit: DAILY_LIMIT }
}
