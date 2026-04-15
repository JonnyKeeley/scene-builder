import { useState, useCallback } from 'react'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (uploadFn: () => Promise<string>): Promise<string | null> => {
    setUploading(true)
    setError(null)
    try {
      const url = await uploadFn()
      return url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploading, error, upload }
}
