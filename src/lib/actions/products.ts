'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProductInput {
  name: string
  slug: string
  tagline?: string | null
  description?: string | null
  price_cents: number
  compare_at_price_cents?: number | null
  image_url?: string | null
  ingredients?: string[]
  category?: string | null
  sku?: string | null
  weight_oz?: number | null
  sort_order?: number
  stripe_price_id?: string | null
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Not authorized')
  return supabase
}

export async function createProduct(input: ProductInput) {
  const supabase = await requireAdmin()

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...input,
      active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/shop')
  return data
}

export async function updateProduct(productId: string, input: Partial<ProductInput>) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('products')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/shop')
}

export async function deactivateProduct(productId: string) {
  const supabase = await requireAdmin()

  const { error } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/shop')
}
