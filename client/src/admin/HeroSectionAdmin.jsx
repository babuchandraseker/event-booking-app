import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { useHeroContent } from '../context/HeroContentContext.jsx'
import { HERO_IDB_PREFIX } from '../lib/hero/constants.js'
import { defaultPanelById } from '../lib/hero/defaultHeroPanels.js'
import { deleteHeroBinaryIfStored, uploadHeroBinary } from '../lib/hero/heroMediaService.js'
import AdminGlassCard from './hero/AdminGlassCard.jsx'
import AdminToggle from './hero/AdminToggle.jsx'
import HeroPreviewStrip from './hero/HeroPreviewStrip.jsx'
import MediaUploadCard from './hero/MediaUploadCard.jsx'

const ADMIN_BASE = '/control-panel-7x9'

export default function HeroSectionAdmin() {
  const {
    ready,
    saveStatus,
    draftRaw,
    resolvedDraft,
    resolvedPublished,
    updateDraftPanel,
    reorderDraft,
    publishLive,
    discardDraftToPublished,
  } = useHeroContent()

  const [previewSource, setPreviewSource] = useState('draft')
  const [message, setMessage] = useState('')
  const [progressMap, setProgressMap] = useState({})
  const [errorMap, setErrorMap] = useState({})
  const [dragIndex, setDragIndex] = useState(null)

  const orderedDraft = useMemo(
    () => [...draftRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [draftRaw],
  )

  const previewPanels = previewSource === 'draft' ? resolvedDraft : resolvedPublished
  const previewLabel =
    previewSource === 'draft' ? 'Showing draft (not yet on the homepage)' : 'Showing published homepage content'

  const setProgress = (key, n) => {
    setProgressMap((m) => ({ ...m, [key]: n }))
  }

  const handleVideo = useCallback(
    async (panelId, file) => {
      const key = `${panelId}-video`
      setErrorMap((m) => ({ ...m, [key]: '' }))
      try {
        const prev = orderedDraft.find((p) => p.id === panelId)?.videoUrl
        const { ref } = await uploadHeroBinary(file, 'video', {
          onProgress: (pct) => setProgress(key, pct),
        })
        if (prev && String(prev).startsWith(HERO_IDB_PREFIX)) await deleteHeroBinaryIfStored(prev)
        updateDraftPanel(panelId, { videoUrl: ref })
        setMessage('Video updated — saved to draft.')
      } catch (e) {
        setErrorMap((m) => ({ ...m, [key]: e.message || 'Upload failed' }))
      } finally {
        setProgress(key, 0)
      }
    },
    [orderedDraft, updateDraftPanel],
  )

  const handlePoster = useCallback(
    async (panelId, file) => {
      const key = `${panelId}-poster`
      setErrorMap((m) => ({ ...m, [key]: '' }))
      try {
        const prev = orderedDraft.find((p) => p.id === panelId)?.posterImage
        const { ref } = await uploadHeroBinary(file, 'image', {
          onProgress: (pct) => setProgress(key, pct),
        })
        if (prev && String(prev).startsWith(HERO_IDB_PREFIX)) await deleteHeroBinaryIfStored(prev)
        updateDraftPanel(panelId, { posterImage: ref })
        setMessage('Poster updated — saved to draft.')
      } catch (e) {
        setErrorMap((m) => ({ ...m, [key]: e.message || 'Upload failed' }))
      } finally {
        setProgress(key, 0)
      }
    },
    [orderedDraft, updateDraftPanel],
  )

  const clearVideo = useCallback(
    async (panelId) => {
      const row = orderedDraft.find((p) => p.id === panelId)
      const def = defaultPanelById(panelId)
      if (!row || !def) return
      if (row.videoUrl && String(row.videoUrl).startsWith(HERO_IDB_PREFIX)) await deleteHeroBinaryIfStored(row.videoUrl)
      updateDraftPanel(panelId, { videoUrl: def.videoUrl })
      setMessage('Video reset to default (draft).')
    },
    [orderedDraft, updateDraftPanel],
  )

  const clearPoster = useCallback(
    async (panelId) => {
      const row = orderedDraft.find((p) => p.id === panelId)
      const def = defaultPanelById(panelId)
      if (!row || !def) return
      if (row.posterImage && String(row.posterImage).startsWith(HERO_IDB_PREFIX)) await deleteHeroBinaryIfStored(row.posterImage)
      updateDraftPanel(panelId, { posterImage: def.posterImage })
      setMessage('Poster reset to default (draft).')
    },
    [orderedDraft, updateDraftPanel],
  )

  const onDragStart = (index) => {
    setDragIndex(index)
  }

  const onDrop = (toIndex) => {
    if (dragIndex === null || dragIndex === toIndex) return
    reorderDraft(dragIndex, toIndex)
    setDragIndex(null)
    setMessage('Panel order updated (draft).')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 }}>
        <div className="fade-up">
          <header style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Hero Section
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, maxWidth: 560 }}>
                Manage cinematic triptych panels, media, copy, and visibility. Draft saves automatically; publish when you are ready for the live site.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {ready ? 'Content ready' : 'Syncing media…'}
                </span>
                {saveStatus === 'saving' && (
                  <span style={{ fontSize: 11, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saving draft…</span>
                )}
                {saveStatus === 'saved' && (
                  <span style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Draft saved</span>
                )}
                <Link to={`${ADMIN_BASE}/dashboard`} style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                  ← Back to dashboard
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', minWidth: 220 }}>
              <button type="button" onClick={publishLive} style={publishBtn}>
                Publish to homepage
              </button>
              <button type="button" onClick={discardDraftToPublished} style={ghostBtn}>
                Discard draft changes
              </button>
            </div>
          </header>

          {message && (
            <div style={{ ...banner, marginBottom: 16 }}>
              {message}
            </div>
          )}

          <AdminGlassCard style={{ padding: '16px 18px', marginBottom: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Preview source</div>
              <div style={{ display: 'flex', gap: 8, background: 'var(--bg-3)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setPreviewSource('draft')}
                  style={previewSource === 'draft' ? pillOn : pillOff}
                >
                  Draft preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSource('published')}
                  style={previewSource === 'published' ? pillOn : pillOff}
                >
                  Published preview
                </button>
              </div>
            </div>
          </AdminGlassCard>

          <div style={{ marginBottom: 22 }}>
            <HeroPreviewStrip panels={previewPanels} modeLabel={previewLabel} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {orderedDraft.map((panel, index) => (
              <AdminGlassCard
                key={panel.id}
                style={{ padding: '20px 22px' }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      type="button"
                      draggable
                      onDragStart={() => onDragStart(index)}
                      onDragEnd={() => setDragIndex(null)}
                      title="Drag to reorder"
                      style={dragHandle}
                    >
                      ⋮⋮
                    </button>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {panel.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Panel ID: <code style={{ color: 'var(--accent)' }}>{panel.id}</code> · Theme key: {panel.themeKey}
                      </div>
                    </div>
                  </div>
                  <AdminToggle
                    checked={panel.isVisible !== false}
                    onChange={(v) => updateDraftPanel(panel.id, { isVisible: v })}
                    label="Visible on site"
                    description="Hide without deleting the panel"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                  <MediaUploadCard
                    label="Panel video"
                    description="MP4 or WebM · max 120 MB (local mock stores in browser)"
                    accept="video/mp4,video/webm,.mp4,.webm"
                    disabled={!ready}
                    progress={progressMap[`${panel.id}-video`]}
                    error={errorMap[`${panel.id}-video`]}
                    currentLabel={panel.videoUrl}
                    onPickFile={(f) => handleVideo(panel.id, f)}
                    onClear={() => clearVideo(panel.id)}
                  />
                  <MediaUploadCard
                    label="Poster / thumbnail"
                    description="JPG, PNG, WebP, or GIF · max 12 MB"
                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    disabled={!ready}
                    progress={progressMap[`${panel.id}-poster`]}
                    error={errorMap[`${panel.id}-poster`]}
                    currentLabel={panel.posterImage}
                    onPickFile={(f) => handlePoster(panel.id, f)}
                    onClear={() => clearPoster(panel.id)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 14 }}>
                  <Field label="Title">
                    <input
                      style={input}
                      value={panel.title}
                      onChange={(e) => updateDraftPanel(panel.id, { title: e.target.value })}
                    />
                  </Field>
                  <Field label="Subtitle">
                    <input
                      style={input}
                      value={panel.subtitle}
                      onChange={(e) => updateDraftPanel(panel.id, { subtitle: e.target.value })}
                    />
                  </Field>
                  <Field label="CTA label">
                    <input
                      style={input}
                      value={panel.buttonText || ''}
                      onChange={(e) => updateDraftPanel(panel.id, { buttonText: e.target.value })}
                    />
                  </Field>
                  <Field label="CTA link (optional)" hint="Leave blank to scroll to themes. Use https://… or #section">
                    <input
                      style={input}
                      value={panel.buttonLink || ''}
                      onChange={(e) => updateDraftPanel(panel.id, { buttonLink: e.target.value })}
                    />
                  </Field>
                </div>
              </AdminGlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{hint}</span>}
    </label>
  )
}

const input = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'var(--bg-3)',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  fontSize: 13,
  outline: 'none',
}

const publishBtn = {
  background: 'linear-gradient(135deg, #c9a84c, #6b4fb8)',
  color: '#0a0612',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '11px 18px',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
}

const ghostBtn = {
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  borderRadius: 'var(--radius-sm)',
  padding: '9px 16px',
  fontWeight: 600,
  fontSize: 12.5,
  cursor: 'pointer',
}

const dragHandle = {
  cursor: 'grab',
  border: '1px solid var(--border)',
  background: 'var(--bg-3)',
  borderRadius: 8,
  width: 36,
  height: 36,
  fontSize: 14,
  color: 'var(--text-muted)',
}

const pillOn = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, rgba(201,168,76,0.35), rgba(107,79,184,0.35))',
  color: 'var(--text-primary)',
}

const pillOff = {
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  background: 'transparent',
  color: 'var(--text-muted)',
}

const banner = {
  background: 'rgba(107, 79, 184, 0.12)',
  border: '1px solid rgba(201,168,76,0.25)',
  color: 'var(--text-secondary)',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 13,
  animation: 'fade-up 0.4s ease',
}
