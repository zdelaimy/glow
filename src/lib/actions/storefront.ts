'use server'

import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateStorefrontProducts(glowGirlId: string, productIds: string[]) {
  const { glowGirl } = await requireGlowGirl()
  if (glowGirl.id !== glowGirlId) throw new Error('Not authorized')

  const supabase = await createClient()

  const { error } = await supabase
    .from('glow_girls')
    .update({ selected_product_ids: productIds })
    .eq('id', glowGirlId)

  if (error) throw new Error(error.message)

  revalidatePath(`/@${glowGirl.slug}`)
  revalidatePath('/glow-girl/dashboard')
}
