import { supabase } from './supabase'
import { compressImage } from './imageCompression'

export async function uploadPanorama(file: File, userId: string): Promise<string> {
  const compressed = await compressImage(file)
  const ext = compressed.name.split('.').pop()
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('panoramas')
    .upload(fileName, compressed, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('panoramas')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function uploadMedia(file: File, userId: string): Promise<string> {
  // Compress images, pass through video files
  const processed = file.type.startsWith('image/') ? await compressImage(file) : file
  const ext = processed.name.split('.').pop()
  const fileName = `${userId}/media/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('panoramas')
    .upload(fileName, processed, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('panoramas')
    .getPublicUrl(fileName)

  return data.publicUrl
}
