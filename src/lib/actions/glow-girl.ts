'use server'

import { createClient } from '@/lib/supabase/server'
import { glowGirlSignatureSchema, glowGirlApplicationSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { GlowGirlSignatureInput, GlowGirlApplicationInput } from '@/lib/validations'

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

  // If a referral code was provided, store it in user metadata so
  // createGlowGirlProfile can pick it up during onboarding
  if (parsed.referral_code) {
    await supabase.auth.updateUser({
      data: { referred_by_code: parsed.referral_code },
    })
  }

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

  // If approved, update user role and auto-create glow_girls record
  if (status === 'APPROVED') {
    await supabase
      .from('profiles')
      .update({ role: 'GLOW_GIRL' })
      .eq('id', application.user_id)

    // Auto-generate slug from full_name
    const baseSlug = application.full_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 28)

    // Ensure uniqueness by appending random suffix if needed
    let slug = baseSlug
    const { data: existing } = await supabase
      .from('glow_girls')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    // Generate unique referral code
    const referralCode = slug.toUpperCase().replace(/-/g, '').slice(0, 6) +
      Math.random().toString(36).slice(2, 6).toUpperCase()

    // Check for referred_by_code from user metadata
    const { data: { user: applicantUser } } = await supabase.auth.admin.getUserById(application.user_id)
    const referredByCode = (applicantUser?.user_metadata?.referred_by_code as string) || null

    // Create glow girl record
    const { data: glowGirl, error: insertErr } = await supabase
      .from('glow_girls')
      .insert({
        user_id: application.user_id,
        slug,
        brand_name: application.full_name,
        referral_code: referralCode,
        referred_by_code: referredByCode,
        approved: true,
      })
      .select()
      .single()

    if (insertErr) throw new Error(insertErr.message)

    // If referred by someone, create the referral relationship
    if (referredByCode && glowGirl) {
      const { data: referrer } = await supabase
        .from('glow_girls')
        .select('id')
        .eq('referral_code', referredByCode)
        .single()

      if (referrer && referrer.id !== glowGirl.id) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 12)

        await supabase.from('glow_girl_referrals').insert({
          referrer_id: referrer.id,
          referred_id: glowGirl.id,
          match_expires_at: expiresAt.toISOString(),
        })

        // Auto-join the referrer's pod if they lead one
        const { data: referrerPod } = await supabase
          .from('pod_memberships')
          .select('pod_id')
          .eq('glow_girl_id', referrer.id)
          .eq('role', 'LEADER')
          .is('left_at', null)
          .single()

        if (referrerPod) {
          await supabase.from('pod_memberships').insert({
            pod_id: referrerPod.pod_id,
            glow_girl_id: glowGirl.id,
            role: 'MEMBER',
          })
        }
      }
    }
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
