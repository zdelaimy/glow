'use server'

import { createClient } from '@/lib/supabase/server'
import { glowGirlBrandSchema, glowGirlSignatureSchema, glowGirlApplicationSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { GlowGirlBrandInput, GlowGirlSignatureInput, GlowGirlApplicationInput } from '@/lib/validations'

export async function createGlowGirlProfile(input: GlowGirlBrandInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = glowGirlBrandSchema.parse(input)

  // Update profile role to GLOW_GIRL
  await supabase
    .from('profiles')
    .update({ role: 'GLOW_GIRL' })
    .eq('id', user.id)

  // Generate unique referral code
  const referralCode = parsed.slug.toUpperCase().replace(/-/g, '').slice(0, 6) +
    Math.random().toString(36).slice(2, 6).toUpperCase()

  // Check for referred_by_code from user metadata (set during auth callback)
  const referredByCode = (user.user_metadata?.referred_by_code as string) || null

  // Create glow girl record
  const { data, error } = await supabase
    .from('glow_girls')
    .insert({
      user_id: user.id,
      slug: parsed.slug,
      brand_name: parsed.brand_name,
      hero_headline: parsed.hero_headline,
      benefits: parsed.benefits,
      story: parsed.story,
      label_template: parsed.label_template,
      accent_color: parsed.accent_color,
      referral_code: referralCode,
      referred_by_code: referredByCode,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('This handle is already taken')
    throw new Error(error.message)
  }

  // If referred by someone, create the referral relationship
  if (referredByCode) {
    const { data: referrer } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('referral_code', referredByCode)
      .single()

    if (referrer && referrer.id !== data.id) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 12)

      await supabase.from('glow_girl_referrals').insert({
        referrer_id: referrer.id,
        referred_id: data.id,
        match_expires_at: expiresAt.toISOString(),
      })
    }
  }

  revalidatePath('/glow-girl')
  return data
}

export async function updateGlowGirlBrand(glowGirlId: string, input: Partial<GlowGirlBrandInput> & { logo_url?: string; hero_image_url?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('glow_girls')
    .update(input)
    .eq('id', glowGirlId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/glow-girl')
}

export async function createSignature(glowGirlId: string, input: GlowGirlSignatureInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = glowGirlSignatureSchema.parse(input)

  const { data, error } = await supabase
    .from('glow_girl_signatures')
    .insert({
      glow_girl_id: glowGirlId,
      ...parsed,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/glow-girl')
  return data
}

export async function updateSignature(signatureId: string, input: Partial<GlowGirlSignatureInput> & { publish_status?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership via join
  const { data: sig } = await supabase
    .from('glow_girl_signatures')
    .select('glow_girl_id, glow_girls!inner(user_id)')
    .eq('id', signatureId)
    .single()

  if (!sig || (sig.glow_girls as unknown as { user_id: string }).user_id !== user.id) {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('glow_girl_signatures')
    .update(input)
    .eq('id', signatureId)

  if (error) throw new Error(error.message)
  revalidatePath('/glow-girl')
}

export async function submitApplication(input: GlowGirlApplicationInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const parsed = glowGirlApplicationSchema.parse(input)

  // Update profile full_name
  await supabase
    .from('profiles')
    .update({ full_name: parsed.full_name })
    .eq('id', user.id)

  const { data, error } = await supabase
    .from('glow_girl_applications')
    .insert({
      user_id: user.id,
      ...parsed,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('You have already submitted an application')
    throw new Error(error.message)
  }

  revalidatePath('/apply')
  return data
}

export async function getMyApplication() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('glow_girl_applications')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function reviewApplication(applicationId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Not authorized')

  // Get the application
  const { data: application } = await supabase
    .from('glow_girl_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (!application) throw new Error('Application not found')

  // Update application status
  const { error } = await supabase
    .from('glow_girl_applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)

  // If approved, update user role to GLOW_GIRL
  if (status === 'APPROVED') {
    await supabase
      .from('profiles')
      .update({ role: 'GLOW_GIRL' })
      .eq('id', application.user_id)
  }

  revalidatePath('/admin')
  revalidatePath('/apply')
}

export async function approveGlowGirl(glowGirlId: string, approved: boolean) {
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
    .from('glow_girls')
    .update({ approved })
    .eq('id', glowGirlId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
