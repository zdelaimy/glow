import { createClient } from '@/lib/supabase/server'

export async function uploadToStorage(
  glowGirlId: string,
  projectId: string,
  fileName: string,
  file: Buffer,
  contentType: string
) {
  const supabase = await createClient()
  const ext = fileName.split('.').pop() || ''
  const uniqueName = `${crypto.randomUUID()}.${ext}`
  const path = `${glowGirlId}/${projectId}/${uniqueName}`

  const { error } = await supabase.storage
    .from('ai-studio')
    .upload(path, file, { contentType, upsert: false })

  if (error) throw error
  return path
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('ai-studio')
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

export async function downloadAsBase64(path: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('ai-studio')
    .download(path)

  if (error) throw error
  const buffer = Buffer.from(await data.arrayBuffer())
  return buffer.toString('base64')
}

export async function deleteFromStorage(path: string) {
  const supabase = await createClient()
  const { error } = await supabase.storage
    .from('ai-studio')
    .remove([path])

  if (error) throw error
}

export async function deleteProjectFiles(glowGirlId: string, projectId: string) {
  const supabase = await createClient()
  const { data: files } = await supabase.storage
    .from('ai-studio')
    .list(`${glowGirlId}/${projectId}`)

  if (files && files.length > 0) {
    const paths = files.map(f => `${glowGirlId}/${projectId}/${f.name}`)
    await supabase.storage.from('ai-studio').remove(paths)
  }
}
