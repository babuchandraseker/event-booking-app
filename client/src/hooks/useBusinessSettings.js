import { useEffect, useState } from 'react'
import { DEFAULT_BUSINESS_SETTINGS, fetchBusinessSettings } from '../data/businessSettings'

export default function useBusinessSettings() {
  const [settings, setSettings] = useState(DEFAULT_BUSINESS_SETTINGS)

  useEffect(() => {
    let ignore = false

    const loadSettings = () => {
      fetchBusinessSettings()
        .then((data) => {
          if (!ignore) setSettings(data)
        })
        .catch(() => {})
    }

    loadSettings()
    const intervalId = window.setInterval(loadSettings, 5000)

    return () => {
      ignore = true
      window.clearInterval(intervalId)
    }
  }, [])

  return settings
}
