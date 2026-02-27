import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Creator, UserRole } from '@/types/database'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== role) {
    redirect('/')
  }

  return { user, profile }
}

export async function requireAdmin() {
  return requireRole('ADMIN')
}

export async function requireCreator(): Promise<{ user: Awaited<ReturnType<typeof requireAuth>>; profile: Profile; creator: Creator }> {
  const { user, profile } = await requireRole('CREATOR')
  const supabase = await createClient()
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!creator) {
    redirect('/creator/onboarding')
  }

  return { user, profile, creator }
}

export async function getCreatorForUser(userId: string): Promise<Creator | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data
}
