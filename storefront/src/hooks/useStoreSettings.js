import { useEffect, useState } from 'react'
import { storeApi } from '../lib/services'

export function useStoreSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    storeApi
      .settings()
      .then(({ data }) => {
        if (alive) setSettings(data.data || null)
      })
      .catch(() => {
        if (alive) setSettings(null)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return { settings, loading }
}
