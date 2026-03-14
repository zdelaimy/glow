'use server'

import { createClient } from '@/lib/supabase/server'
import type { Template } from '@/types/database'

export interface TemplateFilters {
  category?: string
  platform?: string
  funnel_stage?: string
  search?: string
}

export async function getTemplates(filters?: TemplateFilters): Promise<Template[]> {
  const supabase = await createClient()

  let query = supabase
    .from('templates')
    .select('*')
    .eq('active', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.platform) {
    query = query.eq('platform', filters.platform)
  }
  if (filters?.funnel_stage) {
    query = query.eq('funnel_stage', filters.funnel_stage)
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return (data || []) as Template[]
}

export async function getFavoriteIds(glowGirlId: string): Promise<Set<string>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('template_favorites')
    .select('template_id')
    .eq('glow_girl_id', glowGirlId)

  return new Set((data || []).map(f => f.template_id))
}

export async function toggleFavorite(glowGirlId: string, templateId: string): Promise<boolean> {
  const supabase = await createClient()

  // Check if exists
  const { data: existing } = await supabase
    .from('template_favorites')
    .select('id')
    .eq('glow_girl_id', glowGirlId)
    .eq('template_id', templateId)
    .single()

  if (existing) {
    await supabase
      .from('template_favorites')
      .delete()
      .eq('id', existing.id)
    return false // unfavorited
  } else {
    await supabase
      .from('template_favorites')
      .insert({ glow_girl_id: glowGirlId, template_id: templateId })
    return true // favorited
  }
}

export async function getTemplateCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('templates')
    .select('category')
    .eq('active', true)

  const cats = new Set((data || []).map(t => t.category))
  return Array.from(cats).sort()
}
