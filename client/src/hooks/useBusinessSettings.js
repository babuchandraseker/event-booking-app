/**
 * useBusinessSettings — fetches business settings ONCE on mount.
 *
 * Fix: removed the 5-second polling interval and focus-listener that caused
 * 5 simultaneous polling loops (one per consuming component: Navbar, Footer,
 * CtaSection, TrustSection, Sidebar). Settings are static enough that a
 * single fetch per page-load is sufficient. Admins see updated values after
 * saving (Settings page writes directly to the server and updates locally).
 */
import { useEffect, useState } from 'react'
import { DEFAULT_BUSINESS_SETTINGS, fetchBusinessSettings } from '../data/businessSettings'

// Module-level cache so all consuming components share one fetch result.
let _cached = null
let _fetchPromise = null

function getOrFetch() {
  if (_cached) return Promise.resolve(_cached)
  if (_fetchPromise) return _fetchPromise
  _fetchPromise = fetchBusinessSettings()
    .then((data) => {
      _cached = data
      _fetchPromise = null
      return data
    })
    .catch((err) => {
      _fetchPromise = null
      throw err
    })
  return _fetchPromise
}

export function invalidateBusinessSettingsCache() {
  _cached = null
  _fetchPromise = null
}

export default function useBusinessSettings() {
  const [settings, setSettings] = useState(_cached || DEFAULT_BUSINESS_SETTINGS)

  useEffect(() => {
    let ignore = false
    getOrFetch()
      .then((data) => { if (!ignore) setSettings(data) })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  return settings
}
