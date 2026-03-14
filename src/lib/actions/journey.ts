'use server'

import { createClient } from '@/lib/supabase/server'
import type { JourneyModule, JourneyLesson } from '@/types/database'

export interface WeekOverview {
  id: string
  week_number: number
  title: string
  subtitle: string
  description: string | null
  milestone: string | null
  lesson_count: number
  completed_count: number
}

export interface WeekDetail {
  week: {
    id: string
    week_number: number
    title: string
    subtitle: string
    description: string | null
    milestone: string | null
  }
  modules: (JourneyModule & {
    lessons: (JourneyLesson & { completed: boolean })[]
  })[]
  total_lessons: number
  completed_lessons: number
}

export interface LessonDetail {
  lesson: JourneyLesson & { completed: boolean }
  module: JourneyModule
  week: { id: string; week_number: number; title: string }
  prev_lesson_id: string | null
  next_lesson_id: string | null
}

export async function getJourneyOverview(glowGirlId: string): Promise<WeekOverview[]> {
  const supabase = await createClient()

  const { data: weeks } = await supabase
    .from('journey_weeks')
    .select('*')
    .order('week_number')

  if (!weeks || weeks.length === 0) return []

  // Get all lessons and progress in bulk
  const { data: modules } = await supabase
    .from('journey_modules')
    .select('id, week_id')

  const moduleIds = (modules || []).map(m => m.id)

  const { data: lessons } = await supabase
    .from('journey_lessons')
    .select('id, module_id')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['none'])

  const { data: progress } = await supabase
    .from('journey_progress')
    .select('lesson_id')
    .eq('glow_girl_id', glowGirlId)

  const completedSet = new Set((progress || []).map(p => p.lesson_id))

  // Build a map: week_id -> lesson ids
  const moduleToWeek: Record<string, string> = {}
  for (const m of modules || []) {
    moduleToWeek[m.id] = m.week_id
  }

  const weekLessons: Record<string, string[]> = {}
  for (const l of lessons || []) {
    const weekId = moduleToWeek[l.module_id]
    if (weekId) {
      if (!weekLessons[weekId]) weekLessons[weekId] = []
      weekLessons[weekId].push(l.id)
    }
  }

  return weeks.map(w => ({
    id: w.id,
    week_number: w.week_number,
    title: w.title,
    subtitle: w.subtitle,
    description: w.description,
    milestone: w.milestone,
    lesson_count: (weekLessons[w.id] || []).length,
    completed_count: (weekLessons[w.id] || []).filter(id => completedSet.has(id)).length,
  }))
}

export async function getWeekDetail(weekNumber: number, glowGirlId: string): Promise<WeekDetail | null> {
  const supabase = await createClient()

  const { data: week } = await supabase
    .from('journey_weeks')
    .select('*')
    .eq('week_number', weekNumber)
    .single()

  if (!week) return null

  const { data: modules } = await supabase
    .from('journey_modules')
    .select('*')
    .eq('week_id', week.id)
    .order('sort_order')

  const moduleIds = (modules || []).map(m => m.id)

  const { data: lessons } = await supabase
    .from('journey_lessons')
    .select('*')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['none'])
    .order('sort_order')

  const { data: progress } = await supabase
    .from('journey_progress')
    .select('lesson_id')
    .eq('glow_girl_id', glowGirlId)

  const completedSet = new Set((progress || []).map(p => p.lesson_id))

  const enrichedModules = (modules || []).map(m => ({
    ...m,
    lessons: (lessons || [])
      .filter(l => l.module_id === m.id)
      .map(l => ({ ...l, completed: completedSet.has(l.id) })),
  }))

  const totalLessons = enrichedModules.reduce((s, m) => s + m.lessons.length, 0)
  const completedLessons = enrichedModules.reduce(
    (s, m) => s + m.lessons.filter((l: { completed: boolean }) => l.completed).length,
    0
  )

  return {
    week: {
      id: week.id,
      week_number: week.week_number,
      title: week.title,
      subtitle: week.subtitle,
      description: week.description,
      milestone: week.milestone,
    },
    modules: enrichedModules,
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
  }
}

export async function getLessonDetail(lessonId: string, glowGirlId: string): Promise<LessonDetail | null> {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('journey_lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) return null

  const { data: module } = await supabase
    .from('journey_modules')
    .select('*')
    .eq('id', lesson.module_id)
    .single()

  if (!module) return null

  const { data: week } = await supabase
    .from('journey_weeks')
    .select('id, week_number, title')
    .eq('id', module.week_id)
    .single()

  if (!week) return null

  // Check completion
  const { data: prog } = await supabase
    .from('journey_progress')
    .select('id')
    .eq('glow_girl_id', glowGirlId)
    .eq('lesson_id', lessonId)
    .single()

  // Get all lessons in this week for prev/next navigation
  const { data: weekModules } = await supabase
    .from('journey_modules')
    .select('id')
    .eq('week_id', week.id)
    .order('sort_order')

  const weekModuleIds = (weekModules || []).map(m => m.id)

  const { data: weekLessons } = await supabase
    .from('journey_lessons')
    .select('id, module_id, sort_order')
    .in('module_id', weekModuleIds.length > 0 ? weekModuleIds : ['none'])
    .order('sort_order')

  // Sort lessons by module order, then lesson order
  const moduleOrder: Record<string, number> = {}
  weekModuleIds.forEach((id, i) => { moduleOrder[id] = i })

  const sortedLessons = (weekLessons || []).sort((a, b) => {
    const modDiff = (moduleOrder[a.module_id] || 0) - (moduleOrder[b.module_id] || 0)
    if (modDiff !== 0) return modDiff
    return a.sort_order - b.sort_order
  })

  const currentIdx = sortedLessons.findIndex(l => l.id === lessonId)

  return {
    lesson: { ...lesson, completed: !!prog },
    module,
    week,
    prev_lesson_id: currentIdx > 0 ? sortedLessons[currentIdx - 1].id : null,
    next_lesson_id: currentIdx < sortedLessons.length - 1 ? sortedLessons[currentIdx + 1].id : null,
  }
}

export async function markLessonComplete(glowGirlId: string, lessonId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('journey_progress')
    .upsert(
      { glow_girl_id: glowGirlId, lesson_id: lessonId },
      { onConflict: 'glow_girl_id,lesson_id' }
    )

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function markLessonIncomplete(glowGirlId: string, lessonId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('journey_progress')
    .delete()
    .eq('glow_girl_id', glowGirlId)
    .eq('lesson_id', lessonId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getJourneyProgressSummary(glowGirlId: string): Promise<{ completed: number; total: number }> {
  const supabase = await createClient()

  const { count: total } = await supabase
    .from('journey_lessons')
    .select('*', { count: 'exact', head: true })

  const { count: completed } = await supabase
    .from('journey_progress')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirlId)

  return { completed: completed || 0, total: total || 0 }
}
