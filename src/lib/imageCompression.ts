const MAX_WIDTH = 8192
const JPEG_QUALITY = 0.85

export async function compressImage(file: File): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  // Skip if already within bounds
  if (width <= MAX_WIDTH) {
    bitmap.close()
    // Still convert to JPEG if it's a PNG (PNGs are huge for photos)
    if (file.type === 'image/jpeg') return file
  }

  const scale = Math.min(1, MAX_WIDTH / width)
  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  const canvas = new OffscreenCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })
  const name = file.name.replace(/\.[^.]+$/, '.jpg')

  return new File([blob], name, { type: 'image/jpeg' })
}
