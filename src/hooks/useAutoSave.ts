import { useEffect, useRef, useState, useCallback } from 'react'

export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  delay = 1500
) {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      setSaving(true)
      setError(null)
      try {
        await saveFn(value)
        setLastSaved(new Date())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      } finally {
        setSaving(false)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delay])

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setSaving(true)
    setError(null)
    try {
      await saveFn(value)
      setLastSaved(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [value, saveFn])

  return { saving, lastSaved, error, saveNow }
}
