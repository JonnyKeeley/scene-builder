import { supabase } from './supabase'

export async function uploadPanorama(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('panoramas')
    .upload(fileName, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('panoramas')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function uploadMedia(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/media/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('panoramas')
    .upload(fileName, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('panoramas')
    .getPublicUrl(fileName)

  return data.publicUrl
}
