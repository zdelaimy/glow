'use server'

import { createClient } from '@/lib/supabase/server'
import { creatorBrandSchema, creatorSignatureSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { CreatorBrandInput, CreatorSignatureInput } from '@/lib/validations'

export async function createCreatorProfile(input: CreatorBrandInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = creatorBrandSchema.parse(input)

  // Update profile role to CREATOR
  await supabase
    .from('profiles')
    .update({ role: 'CREATOR' })
    .eq('id', user.id)

  // Create creator record
  const { data, error } = await supabase
    .from('creators')
    .insert({
      user_id: user.id,
      slug: parsed.slug,
      brand_name: parsed.brand_name,
      hero_headline: parsed.hero_headline,
      benefits: parsed.benefits,
      story: parsed.story,
      label_template: parsed.label_template,
      accent_color: parsed.accent_color,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('This handle is already taken')
    throw new Error(error.message)
  }

  revalidatePath('/creator')
  return data
}

export async function updateCreatorBrand(creatorId: string, input: Partial<CreatorBrandInput> & { logo_url?: string; hero_image_url?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('creators')
    .update(input)
    .eq('id', creatorId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/creator')
}

export async function createSignature(creatorId: string, input: CreatorSignatureInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = creatorSignatureSchema.parse(input)

  const { data, error } = await supabase
    .from('creator_signatures')
    .insert({
      creator_id: creatorId,
      ...parsed,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/creator')
  return data
}

export async function updateSignature(signatureId: string, input: Partial<CreatorSignatureInput> & { publish_status?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership via join
  const { data: sig } = await supabase
    .from('creator_signatures')
    .select('creator_id, creators!inner(user_id)')
    .eq('id', signatureId)
    .single()

  if (!sig || (sig.creators as unknown as { user_id: string }).user_id !== user.id) {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('creator_signatures')
    .update(input)
    .eq('id', signatureId)

  if (error) throw new Error(error.message)
  revalidatePath('/creator')
}

export async function approveCreator(creatorId: string, approved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Not authorized')

  const { error } = await supabase
    .from('creators')
    .update({ approved })
    .eq('id', creatorId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
