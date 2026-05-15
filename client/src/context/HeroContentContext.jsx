import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { loadHeroStore, publishDraft, saveDraftOnly } from '../lib/hero/heroPanelRepository.js'
import { panelToDisplayFields, resolveHeroMediaUrl, revokeAllHeroBlobs } from '../lib/hero/resolveHeroMediaUrl.js'

const HeroContentContext = createContext(null)

async function resolvePanel(panel) {
  const [videoSrc, poster] = await Promise.all([
    resolveHeroMediaUrl(panel.videoUrl),
    resolveHeroMediaUrl(panel.posterImage),
  ])
  return panelToDisplayFields(panel, videoSrc, poster)
}

export function HeroContentProvider({ children }) {
  const [publishedRaw, setPublishedRaw] = useState([])
  const [draftRaw, setDraftRaw] = useState([])
  const [resolvedPublished, setResolvedPublished] = useState([])
  const [resolvedDraft, setResolvedDraft] = useState([])
  const [ready, setReady] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const saveTimer = useRef(null)

  const reloadFromStorage = useCallback(() => {
    const { published, draft } = loadHeroStore()
    setPublishedRaw(published)
    setDraftRaw(draft)
  }, [])

  useEffect(() => {
    reloadFromStorage()
  }, [reloadFromStorage])

  useEffect(() => {
    let cancelled = false
    revokeAllHeroBlobs()
    setReady(false)
    const pubSorted = [...publishedRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const draftSorted = [...draftRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    ;(async () => {
      const pub = await Promise.all(pubSorted.map((p) => resolvePanel(p)))
      if (cancelled) return
      setResolvedPublished(pub)
      const dr = await Promise.all(draftSorted.map((p) => resolvePanel(p)))
      if (cancelled) return
      setResolvedDraft(dr)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [publishedRaw, draftRaw])

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
      setSaveStatus('saved')
      window.setTimeout(() => setSaveStatus('idle'), 1600)
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

  const publishLive = useCallback(() => {
    const next = publishDraft(draftRaw)
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
      updateDraftPanel,
      setDraftPanels,
      reorderDraft,
      publishLive,
      discardDraftToPublished,
    ],
  )

  return <HeroContentContext.Provider value={value}>{children}</HeroContentContext.Provider>
}

export function useHeroContent() {
  const ctx = useContext(HeroContentContext)
  if (!ctx) throw new Error('useHeroContent must be used within HeroContentProvider')
  return ctx
}
