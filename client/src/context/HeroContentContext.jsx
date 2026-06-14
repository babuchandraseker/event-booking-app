import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HeroContentContext } from './HeroContentContextValue.js'
import { loadHeroStore, loadHeroStoreFromApi, publishDraft, saveDraftOnly } from '../lib/hero/heroPanelRepository.js'
import { panelToDisplayFields, resolveHeroMediaUrl, revokeAllHeroBlobs } from '../lib/hero/resolveHeroMediaUrl.js'
import { HERO_IDB_PREFIX } from '../lib/hero/constants.js'

async function resolvePanel(panel) {
  const [videoSrc, poster] = await Promise.all([
    resolveHeroMediaUrl(panel.videoUrl),
    resolveHeroMediaUrl(panel.posterImage),
  ])
  return panelToDisplayFields(panel, videoSrc, poster)
}

export function HeroContentProvider({ children }) {
  const initialStore = useMemo(() => loadHeroStore(), [])
  const [publishedRaw, setPublishedRaw] = useState(initialStore.published)
  const [draftRaw, setDraftRaw] = useState(initialStore.draft)

  // Synchronously resolve local static assets for initial render
  const initialResolvedPublished = useMemo(() => {
    return initialStore.published.map((p) => {
      const videoSrc = (!p.videoUrl || p.videoUrl.startsWith(HERO_IDB_PREFIX)) ? '' : p.videoUrl
      const poster = (!p.posterImage || p.posterImage.startsWith(HERO_IDB_PREFIX)) ? '' : p.posterImage
      return panelToDisplayFields(p, videoSrc, poster)
    })
  }, [initialStore.published])

  const [resolvedPublished, setResolvedPublished] = useState(initialResolvedPublished)
  const [resolvedDraft, setResolvedDraft] = useState([])
  const [ready, setReady] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const saveTimer = useRef(null)
  const isAdminRoute = useMemo(
    () => typeof window !== 'undefined' && window.location.pathname.includes('/control-panel-7x9'),
    [],
  )

  const reloadFromStorage = useCallback(() => {
    const { published, draft } = loadHeroStore()
    setPublishedRaw(published)
    setDraftRaw(draft)
  }, [isAdminRoute])

  const reloadFromApi = useCallback(async () => {
    const { published, draft } = await loadHeroStoreFromApi()
    setPublishedRaw(published)
    setDraftRaw(draft)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { published, draft } = await loadHeroStoreFromApi()
        if (cancelled) return
        setPublishedRaw(published)
        setDraftRaw(draft)
      } catch {
        // Keep local defaults/local draft if the API is unavailable.
      }
    }

    load()
    if (!isAdminRoute) return () => {
      cancelled = true
    }

    // Poll every 30s (not 5s) — prevents re-renders that interrupt video playback
    const timer = window.setInterval(load, 30_000)
    window.addEventListener('focus', load)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    revokeAllHeroBlobs()
    const pubSorted = [...publishedRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const draftSorted = isAdminRoute ? [...draftRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
    ;(async () => {
      const pub = await Promise.all(pubSorted.map((p) => resolvePanel(p)))
      if (cancelled) return
      setResolvedPublished(pub)
      setReady(true)
      if (!isAdminRoute) {
        setResolvedDraft([])
        return
      }
      const dr = await Promise.all(draftSorted.map((p) => resolvePanel(p)))
      if (cancelled) return
      setResolvedDraft(dr)
    })()
    return () => {
      cancelled = true
    }
  }, [publishedRaw, draftRaw, isAdminRoute])

  const visiblePanelsForSite = useMemo(() => {
    const sorted = [...resolvedPublished].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const vis = sorted.filter((p) => p.isVisible !== false)
    if (vis.length > 0) return vis
    return sorted
  }, [resolvedPublished])

  const scheduleDraftPersist = useCallback((nextDraft) => {
    setSaveStatus('saving')
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveDraftOnly(nextDraft)
        .then(() => {
          setSaveStatus('saved')
          window.setTimeout(() => setSaveStatus('idle'), 1600)
        })
        .catch(() => {
          setSaveStatus('idle')
        })
    }, 420)
  }, [])

  const updateDraftPanel = useCallback(
    (id, patch) => {
      setDraftRaw((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        scheduleDraftPersist(next)
        return next
      })
    },
    [scheduleDraftPersist],
  )

  const setDraftPanels = useCallback(
    (panelsOrFn) => {
      setDraftRaw((prev) => {
        const next = typeof panelsOrFn === 'function' ? panelsOrFn(prev) : panelsOrFn
        scheduleDraftPersist(next)
        return next
      })
    },
    [scheduleDraftPersist],
  )

  const reorderDraft = useCallback(
    (fromIndex, toIndex) => {
      setDraftRaw((prev) => {
        const sorted = [...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const item = sorted.splice(fromIndex, 1)[0]
        if (!item) return prev
        sorted.splice(toIndex, 0, item)
        const next = sorted.map((p, i) => ({ ...p, order: i }))
        scheduleDraftPersist(next)
        return next
      })
    },
    [scheduleDraftPersist],
  )

  const publishLive = useCallback(async () => {
    const next = await publishDraft(draftRaw)
    setPublishedRaw(next)
    setDraftRaw(next.map((p) => ({ ...p })))
    setSaveStatus('saved')
  }, [draftRaw])

  const discardDraftToPublished = useCallback(() => {
    const { published } = loadHeroStore()
    const copy = published.map((p) => ({ ...p }))
    setDraftRaw(copy)
    saveDraftOnly(copy)
    setSaveStatus('idle')
  }, [])

  const value = useMemo(
    () => ({
      ready,
      saveStatus,
      publishedRaw,
      draftRaw,
      resolvedPublished,
      resolvedDraft,
      visiblePanelsForSite,
      reloadFromStorage,
      reloadFromApi,
      updateDraftPanel,
      setDraftPanels,
      reorderDraft,
      publishLive,
      discardDraftToPublished,
    }),
    [
      ready,
      saveStatus,
      publishedRaw,
      draftRaw,
      resolvedPublished,
      resolvedDraft,
      visiblePanelsForSite,
      reloadFromStorage,
      reloadFromApi,
      updateDraftPanel,
      setDraftPanels,
      reorderDraft,
      publishLive,
      discardDraftToPublished,
    ],
  )

  return <HeroContentContext.Provider value={value}>{children}</HeroContentContext.Provider>
}
