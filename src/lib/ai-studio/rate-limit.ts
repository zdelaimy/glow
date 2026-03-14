import { createClient } from '@/lib/supabase/server'

const DAILY_TEXT_LIMIT = 50
const DAILY_VIDEO_LIMIT = 10

export async function checkDailyLimit(glowGirlId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_studio_projects')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirlId)
    .in('status', ['processing', 'completed'])
    .in('type', ['generate', 'analyze'])
    .gte('created_at', todayStart.toISOString())

  const used = count || 0
  return { allowed: used < DAILY_TEXT_LIMIT, used, limit: DAILY_TEXT_LIMIT }
}

export async function checkVideoDailyLimit(glowGirlId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_studio_projects')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirlId)
    .in('status', ['processing', 'completed'])
    .eq('type', 'video')
    .gte('created_at', todayStart.toISOString())

  const used = count || 0
  return { allowed: used < DAILY_VIDEO_LIMIT, used, limit: DAILY_VIDEO_LIMIT }
}
