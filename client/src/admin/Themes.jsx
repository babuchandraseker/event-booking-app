import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/* ─── Scrollytelling media slots for each theme ──────────────────────────── */
const SCROLLY_SLOTS = {
  romantic: [
    { slot: 'video',  kind: 'video', label: 'Intro Video',              hint: 'Full-screen cinematic intro video (mp4)',          defaultSrc: '/themes/romantic/romantic.mp4'  },
    { slot: 'scene1', kind: 'image', label: 'Scene 1 – Rose Setup',     hint: 'Background image for scene 1',                    defaultSrc: '/themes/romantic/romantic1.jpg' },
    { slot: 'scene2', kind: 'image', label: 'Scene 2 – Candlelit Table',hint: 'Background image for scene 2',                    defaultSrc: '/themes/romantic/romantic2.jpg' },
    { slot: 'scene3', kind: 'image', label: 'Scene 3 – Petal Arrangement', hint: 'Background image for scene 3',                 defaultSrc: '/themes/romantic/romantic3.jpg' },
    { slot: 'scene4', kind: 'image', label: 'Scene 4 – Intimate Corner',hint: 'Background image for scene 4 (CTA)',              defaultSrc: '/themes/romantic/romantic4.jpg' },
  ],
  birthday: [
    { slot: 'video',  kind: 'video', label: 'Intro Video',   hint: 'Full-screen cinematic intro video (mp4)',  defaultSrc: '/themes/birthday/bday.mp4'   },
    { slot: 'scene1', kind: 'image', label: 'Scene 1',       hint: 'Background image for scene 1',            defaultSrc: '/themes/birthday/bday1.jpeg' },
    { slot: 'scene2', kind: 'image', label: 'Scene 2',       hint: 'Background image for scene 2',            defaultSrc: '/themes/birthday/bday2.jpeg' },
    { slot: 'scene3', kind: 'image', label: 'Scene 3',       hint: 'Background image for scene 3',            defaultSrc: '/themes/birthday/bday3.jpeg' },
    { slot: 'scene4', kind: 'image', label: 'Scene 4',       hint: 'Background image for scene 4',            defaultSrc: '/themes/birthday/bday4.jpeg' },
    { slot: 'scene5', kind: 'image', label: 'Scene 5 (CTA)', hint: 'Background image for scene 5 (CTA)',      defaultSrc: '/themes/birthday/bday5.jpeg' },
  ],
  surprise: [
    { slot: 'video',  kind: 'video', label: 'Intro Video',   hint: 'Full-screen cinematic intro video (mp4)',  defaultSrc: '/themes/surprise/surprise.mp4'   },
    { slot: 'scene1', kind: 'image', label: 'Scene 1',       hint: 'Background image for scene 1',            defaultSrc: '/themes/surprise/surprise1.jpeg' },
    { slot: 'scene2', kind: 'image', label: 'Scene 2',       hint: 'Background image for scene 2',            defaultSrc: '/themes/surprise/surprise2.jpeg' },
    { slot: 'scene3', kind: 'image', label: 'Scene 3',       hint: 'Background image for scene 3',            defaultSrc: '/themes/surprise/surprise3.jpeg' },
    { slot: 'scene4', kind: 'image', label: 'Scene 4 (CTA)', hint: 'Background image for scene 4 (CTA)',      defaultSrc: '/themes/surprise/surprise4.jpeg' },
  ],
}

const DEFAULT_THEMES = [
  {
    id: 'romantic', key: 'romantic', title: 'Heart Theme', tag: '🌹 Romantic',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance.',
    features: 'Candles, Rose petals, Music', img: '/themes/romantic/romantic1.jpg',
    videoSrc: '/themes/romantic/romantic.mp4', emoji: '', active: true, scrollyMedia: {},
  },
  {
    id: 'birthday', key: 'birthday', title: 'Balloon Theme', tag: '🎉 Birthday',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory.',
    features: 'Balloons, Custom banner, Cake', img: '', videoSrc: '/themes/birthday/bday.mp4',
    emoji: '🎂', active: true, scrollyMedia: {},
  },
  {
    id: 'surprise', key: 'surprise', title: 'Partition Theme', tag: '✨ Surprise',
    desc: 'A perfectly orchestrated surprise that leaves them breathless.',
    features: 'Secret setup, Reveal décor, Timing', img: '', videoSrc: '/themes/surprise/surprise.mp4',
    emoji: '🎁', active: true, scrollyMedia: {},
  },
]

function themeToForm(t) {
  return {
    ...t,
    features: Array.isArray(t.features) ? t.features.join(', ') : (t.features || ''),
    scrollyMedia: t.scrollyMedia || {},
  }
}

function formToPayload(f) {
  return {
    ...f,
    features: f.features.split(',').map((s) => s.trim()).filter(Boolean),
  }
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('adminToken')
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed')
  return data
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('Read failed'))
    r.readAsDataURL(file)
  })
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Themes() {
  const [themes, setThemes] = useState(DEFAULT_THEMES.map(themeToForm))
  const [activeId, setActiveId] = useState('romantic')
  const [status, setStatus] = useState({ msg: '', type: 'info' })
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [activeTab, setActiveTab] = useState('identity')

  useEffect(() => {
    let ignore = false
    apiFetch('/themes')
      .then((data) => {
        if (!ignore && data.data?.length) setThemes(data.data.map(themeToForm))
      })
      .catch(() => {
        if (!ignore) setStatus({ msg: 'Using local defaults — backend not connected.', type: 'warn' })
      })
    return () => { ignore = true }
  }, [])

  const active = themes.find((t) => t.id === activeId) || themes[0]

  function updateActive(field, value) {
    setHasUnsaved(true)
    setThemes((prev) => prev.map((t) => (t.id === activeId ? { ...t, [field]: value } : t)))
  }

  function updateScrollyMedia(slot, url) {
    setThemes((prev) => prev.map((t) =>
      t.id === activeId
        ? { ...t, scrollyMedia: { ...(t.scrollyMedia || {}), [slot]: url } }
        : t
    ))
  }

  function switchTheme(id) {
    setActiveId(id)
    setHasUnsaved(false)
    setStatus({ msg: '', type: 'info' })
    setActiveTab('identity')
  }

  async function saveTheme() {
    setIsSaving(true)
    setStatus({ msg: '', type: 'info' })
    try {
      const payload = formToPayload(active)
      const data = await apiFetch(`/themes/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      setThemes((prev) => prev.map((t) => (t.id === activeId ? themeToForm(data.data) : t)))
      setHasUnsaved(false)
      setStatus({ msg: `✓ "${data.data.title}" saved — changes are now live on the website.`, type: 'ok' })
    } catch (err) {
      setStatus({ msg: err.message || 'Could not save theme.', type: 'err' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Theme Editor</h1>
            <p style={s.pageSub}>
              Edit theme details and upload scrollytelling media — all changes reflect live on the website.
            </p>
          </div>
          <div style={s.headerActions}>
            {hasUnsaved && <span style={s.unsavedBadge}>● Unsaved changes</span>}
            <button
              onClick={saveTheme}
              disabled={isSaving || !hasUnsaved}
              style={{ ...s.saveBtn, opacity: (!hasUnsaved || isSaving) ? 0.5 : 1, cursor: (!hasUnsaved || isSaving) ? 'not-allowed' : 'pointer' }}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Live banner */}
        <div style={s.liveBanner}>
          <span style={s.liveDot} />
          <span>
            <strong>Media uploads</strong> take effect on the scrollytelling page immediately after uploading.&nbsp;
            <strong>Theme details</strong> (title, description, features) update after clicking Save Changes.
          </span>
        </div>

        {/* Theme selector tabs */}
        <div style={s.tabs}>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTheme(t.id)}
              style={{ ...s.tab, ...(t.id === activeId ? s.activeTab : {}) }}
            >
              <span style={s.tabEmoji}>{t.emoji || '🎨'}</span>
              <div style={s.tabMeta}>
                <span style={s.tabLabel}>{t.title || t.id}</span>
                <span style={s.tabTag}>{t.tag}</span>
              </div>
              {!t.active && <span style={s.inactiveDot} title="Hidden on website" />}
            </button>
          ))}
        </div>

        {/* Section tabs */}
        {active && (
          <div style={s.sectionTabs}>
            <button
              onClick={() => setActiveTab('identity')}
              style={{ ...s.sectionTab, ...(activeTab === 'identity' ? s.sectionTabActive : {}) }}
            >
              📝 Theme Details
            </button>
            <button
              onClick={() => setActiveTab('media')}
              style={{ ...s.sectionTab, ...(activeTab === 'media' ? s.sectionTabActive : {}) }}
            >
              🎬 Scrollytelling Media
              {Object.keys(active.scrollyMedia || {}).filter(k => active.scrollyMedia[k]).length > 0 && (
                <span style={s.mediaBadge}>
                  {Object.keys(active.scrollyMedia).filter(k => active.scrollyMedia[k]).length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Theme Details Tab */}
        {active && activeTab === 'identity' && (
          <div style={s.editorGrid}>
            <div style={s.formCol}>
              <section style={s.panel}>
                <h2 style={s.panelTitle}>Theme Identity</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Theme Key
                    <span style={s.hint}>Unique slug — locked for built-in themes</span>
                    <input style={{ ...s.input, opacity: 0.5, cursor: 'not-allowed' }} value={active.key} readOnly />
                  </label>
                  <label style={s.field}>
                    Display Title
                    <input style={s.input} value={active.title} onChange={(e) => updateActive('title', e.target.value)} placeholder="e.g. Heart Theme" />
                  </label>
                  <label style={s.field}>
                    Tag Label
                    <span style={s.hint}>Category chip shown on the website (emoji + label)</span>
                    <input style={s.input} value={active.tag} onChange={(e) => updateActive('tag', e.target.value)} placeholder="e.g. 🌹 Romantic" />
                  </label>
                  <label style={s.field}>
                    Emoji (shown when no cover image)
                    <input style={s.input} value={active.emoji} onChange={(e) => updateActive('emoji', e.target.value)} placeholder="e.g. 🎂" />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Content</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Description
                    <span style={s.hint}>Paragraph shown on the theme card</span>
                    <textarea
                      style={{ ...s.input, minHeight: 100, resize: 'vertical' }}
                      value={active.desc}
                      onChange={(e) => updateActive('desc', e.target.value)}
                      placeholder="Short paragraph shown on the theme card…"
                    />
                  </label>
                  <label style={s.field}>
                    Feature Chips
                    <span style={s.hint}>Comma-separated — shown as feature badges</span>
                    <input style={s.input} value={active.features} onChange={(e) => updateActive('features', e.target.value)} placeholder="e.g. Candles, Rose petals, Music" />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Card Media (Theme Section)</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Cover Image Path
                    <span style={s.hint}>Shown on the theme selection card — e.g. <code style={s.code}>/themes/romantic/romantic1.jpg</code></span>
                    <input style={s.input} value={active.img} onChange={(e) => updateActive('img', e.target.value)} placeholder="/themes/romantic/cover.jpg" />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Visibility</h2>
                <label style={s.toggleRow}>
                  <input
                    type="checkbox"
                    checked={active.active !== false}
                    onChange={(e) => updateActive('active', e.target.checked)}
                    style={s.checkbox}
                  />
                  <span style={s.toggleLabel}>
                    {active.active !== false ? '✅ Visible on website' : '🚫 Hidden from website'}
                  </span>
                </label>
                <p style={s.hint}>Uncheck to temporarily hide this theme without losing its settings.</p>
              </section>
            </div>

            {/* Right: live preview */}
            <div style={s.previewCol}>
              <div style={s.previewHeader}>
                <span style={s.previewLabel}>Live Preview</span>
                <span style={s.previewSub}>How this card appears on the website</span>
              </div>
              <ThemeCardPreview theme={active} />
              <div style={s.noteBox}>
                <span style={s.noteIcon}>ℹ</span>
                <div>
                  Switch to <strong>Scrollytelling Media</strong> tab to upload replacement images &amp; videos for the experience page.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollytelling Media Tab */}
        {active && activeTab === 'media' && (
          <ScrollyMediaEditor
            theme={active}
            slots={SCROLLY_SLOTS[active.key] || []}
            onUpdate={updateScrollyMedia}
            onThemeRefresh={(updated) => setThemes((prev) => prev.map((t) => t.id === updated.id ? themeToForm(updated) : t))}
          />
        )}

        {/* Status bar */}
        {status.msg && (
          <div style={{
            ...s.statusBar,
            ...(status.type === 'err' ? s.statusErr : status.type === 'warn' ? s.statusWarn : s.statusOk),
          }}>
            {status.msg}
          </div>
        )}
      </main>
    </div>
  )
}

/* ─── Scrollytelling Media Editor ────────────────────────────────────────── */
function ScrollyMediaEditor({ theme, slots, onUpdate, onThemeRefresh }) {
  const [uploading, setUploading]       = useState({})
  const [uploadStatus, setUploadStatus] = useState({})
  const [localPreviews, setLocalPreviews] = useState({})
  const fileRefs = useRef({})

  if (!slots.length) {
    return (
      <div style={s.panel}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          No scrollytelling slots configured for this theme.
        </p>
      </div>
    )
  }

  async function handleUpload(slot, kind, file) {
    if (!file) return
    const maxMB = kind === 'video' ? 130 : 12
    if (file.size > maxMB * 1024 * 1024) {
      setUploadStatus((p) => ({ ...p, [slot]: { type: 'err', msg: `File too large — max ${maxMB} MB` } }))
      return
    }

    setUploading((p) => ({ ...p, [slot]: true }))
    setUploadStatus((p) => ({ ...p, [slot]: { type: 'info', msg: 'Uploading…' } }))

    try {
      const dataUrl = await fileToDataUrl(file)

      // Show local data URL as instant preview while upload is in flight
      setLocalPreviews((p) => ({ ...p, [slot]: dataUrl }))

      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_BASE_URL}/themes/${theme.id}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ dataUrl, kind, slot }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed')

      const { url, theme: updatedTheme } = data.data

      // Replace local data-URL preview with the real served path
      setLocalPreviews((p) => { const n = { ...p }; delete n[slot]; return n })

      // Update the slot URL in the parent's state
      onUpdate(slot, url)

      // Refresh the full theme so scrollyMedia is in sync
      if (updatedTheme) onThemeRefresh(updatedTheme)

      setUploadStatus((p) => ({ ...p, [slot]: { type: 'ok', msg: '✓ Uploaded & live — visible on the scrollytelling page now.' } }))
    } catch (err) {
      setLocalPreviews((p) => { const n = { ...p }; delete n[slot]; return n })
      setUploadStatus((p) => ({ ...p, [slot]: { type: 'err', msg: err.message || 'Upload failed' } }))
    } finally {
      setUploading((p) => ({ ...p, [slot]: false }))
    }
  }

  async function clearSlot(slot) {
    setUploadStatus((p) => ({ ...p, [slot]: { type: 'info', msg: 'Reverting…' } }))
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`${API_BASE_URL}/themes/${theme.id}/media/${slot}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Revert failed')

      // Sync parent state with the authoritative theme returned by the server
      if (data.data?.theme) onThemeRefresh(data.data.theme)
      onUpdate(slot, '')
      setLocalPreviews((p) => { const n = { ...p }; delete n[slot]; return n })
      if (fileRefs.current[slot]) fileRefs.current[slot].value = ''
      setUploadStatus((p) => ({ ...p, [slot]: { type: 'info', msg: 'Reverted — default image is now shown.' } }))
    } catch (err) {
      setUploadStatus((p) => ({ ...p, [slot]: { type: 'err', msg: err.message || 'Revert failed' } }))
    }
  }

  const currentMedia = theme.scrollyMedia || {}

  return (
    <div style={s.scrollyGrid}>
      <div style={s.scrollyInfo}>
        <div style={s.infoCard}>
          <span style={{ fontSize: 24 }}>🎬</span>
          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>Scrollytelling Media</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
              Upload replacement images and videos for the <strong>{theme.title}</strong> experience page.
              Files are saved directly to the website — <strong>no Save Changes needed</strong>.
              The scrollytelling page will show the new image as soon as the visitor refreshes.
            </p>
            <div style={s.slotLegend}>
              <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#43a047' }} />Custom (uploaded)</span>
              <span style={s.legendItem}><span style={{ ...s.legendDot, background: 'var(--border)' }} />Default (built-in)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.slotList}>
        {slots.map((slotDef) => {
          const { slot, kind, label, hint, defaultSrc } = slotDef
          const customUrl   = currentMedia[slot] || ''
          const localPreview = localPreviews[slot] || ''
          // Preview priority: local data URL (instant) > saved server path > default
          const previewSrc  = localPreview || customUrl || defaultSrc
          const isCustom    = Boolean(customUrl) || Boolean(localPreview)
          const isUploading = uploading[slot]
          const slotStatus  = uploadStatus[slot]
          const accept      = kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif'
          // Display path — never show raw base64
          const displayPath = localPreview
            ? '(uploading…)'
            : customUrl || defaultSrc || '(none)'

          return (
            <div key={slot} style={{ ...s.slotCard, ...(isCustom ? s.slotCardCustom : {}) }}>
              {/* Left: preview thumbnail */}
              <div style={s.slotPreview}>
                {isCustom && !localPreview && <span style={s.customBadge}>Custom</span>}
                {localPreview && <span style={{ ...s.customBadge, background: '#ffb74d', color: '#000' }}>Uploading…</span>}
                <MediaPreview src={previewSrc} kind={kind} />
              </div>

              {/* Right: info + upload controls */}
              <div style={s.slotInfo}>
                <div style={s.slotHeader}>
                  <span style={s.slotLabel}>{label}</span>
                  <span style={{ ...s.kindChip, ...(kind === 'video' ? s.kindChipVideo : s.kindChipImage) }}>
                    {kind === 'video' ? '🎥 Video' : '🖼 Image'}
                  </span>
                </div>
                <p style={s.slotHint}>{hint}</p>

                <div style={s.slotCurrent}>
                  <span style={s.slotCurrentLabel}>File:</span>
                  <code style={s.slotCurrentPath}>{displayPath}</code>
                </div>

                {slotStatus && (
                  <div style={{
                    ...s.slotStatus,
                    ...(slotStatus.type === 'ok' ? s.slotStatusOk : slotStatus.type === 'err' ? s.slotStatusErr : s.slotStatusInfo),
                  }}>
                    {slotStatus.msg}
                  </div>
                )}

                <div style={s.slotActions}>
                  <input
                    ref={(el) => { fileRefs.current[slot] = el }}
                    type="file"
                    accept={accept}
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(slot, kind, e.target.files?.[0])}
                  />
                  <button
                    onClick={() => fileRefs.current[slot]?.click()}
                    disabled={isUploading}
                    style={{ ...s.uploadBtn, opacity: isUploading ? 0.6 : 1 }}
                  >
                    {isUploading ? '⏳ Uploading…' : customUrl ? '🔄 Replace File' : '⬆ Upload File'}
                  </button>
                  {customUrl && !localPreview && (
                    <button onClick={() => clearSlot(slot)} style={s.clearBtn} title="Revert to default">
                      ✕ Revert to Default
                    </button>
                  )}
                </div>

                <p style={s.slotSizeHint}>
                  Max size: {kind === 'video' ? '130 MB (mp4, webm)' : '12 MB (jpg, png, webp, gif)'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Media Preview ──────────────────────────────────────────────────────── */
function MediaPreview({ src, kind }) {
  const [err, setErr] = useState({ src, failed: false })
  const hasError = err.src === src && err.failed
  const markError = () => setErr({ src, failed: true })

  if (!src) {
    return (
      <div style={mp.placeholder}>
        <span style={{ fontSize: 28 }}>{kind === 'video' ? '🎥' : '🖼'}</span>
        <span style={mp.placeholderText}>No file</span>
      </div>
    )
  }

  if (kind === 'video') {
    return (
      <video key={src} style={mp.video} muted autoPlay loop playsInline onError={markError}>
        <source src={src} />
        <div style={mp.placeholder}><span>🎥</span></div>
      </video>
    )
  }

  if (hasError) {
    return (
      <div style={mp.placeholder}>
        <span style={{ fontSize: 28 }}>🖼</span>
        <span style={mp.placeholderText}>Preview N/A</span>
      </div>
    )
  }

  return <img src={src} alt="preview" style={mp.img} onError={markError} />
}

/* ─── Theme Card Preview ─────────────────────────────────────────────────── */
function ThemeCardPreview({ theme }) {
  const features = typeof theme.features === 'string'
    ? theme.features.split(',').map((f) => f.trim()).filter(Boolean)
    : (theme.features || [])

  return (
    <div style={preview.card}>
      <div style={preview.media}>
        {theme.img ? (
          <img src={theme.img} alt={theme.title} style={preview.img} onError={(e) => { e.target.style.display = 'none' }} />
        ) : theme.emoji ? (
          <div style={preview.emojiBox}>{theme.emoji}</div>
        ) : (
          <div style={preview.emojiBox}>🎨</div>
        )}
        <div style={preview.overlay} />
        <div style={preview.tag}>{theme.tag || '🎨 Theme'}</div>
        {!theme.active && <div style={preview.hiddenBadge}>Hidden</div>}
      </div>
      <div style={preview.body}>
        <h3 style={preview.title}>{theme.title || 'Theme Title'}</h3>
        <p style={preview.desc}>{theme.desc || 'Theme description will appear here.'}</p>
        <div style={preview.features}>
          {features.length > 0
            ? features.map((f) => <span key={f} style={preview.chip}>{f}</span>)
            : <span style={preview.chip}>Feature</span>}
        </div>
        <button style={preview.btn}>Explore Experience →</button>
      </div>
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4, maxWidth: 560 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 },
  unsavedBadge: { fontSize: 12, color: '#ffb74d', fontWeight: 600 },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 20px', fontSize: 13, fontWeight: 700, transition: 'opacity 0.2s' },
  liveBanner: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(67,160,71,0.08)', border: '1px solid rgba(67,160,71,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#81c784', marginBottom: 20, lineHeight: 1.7 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#43a047', flexShrink: 0, boxShadow: '0 0 6px #43a047' },
  tabs: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, position: 'relative' },
  activeTab: { color: 'var(--accent)', background: 'var(--accent-dim)', borderColor: 'var(--accent)' },
  tabEmoji: { fontSize: 18 },
  tabMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 },
  tabLabel: { fontWeight: 700, fontSize: 13 },
  tabTag: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 },
  inactiveDot: { width: 7, height: 7, borderRadius: '50%', background: '#e57373', display: 'inline-block', position: 'absolute', top: 8, right: 8 },
  sectionTabs: { display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  sectionTab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, padding: '8px 14px', cursor: 'pointer', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6 },
  sectionTabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  mediaBadge: { background: 'var(--accent)', color: 'var(--bg-1)', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px' },
  editorGrid: { display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: 20, alignItems: 'start' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  previewCol: { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 14, fontWeight: 700 },
  fieldGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 },
  hint: { color: 'var(--text-muted)', fontWeight: 400, fontSize: 11, marginTop: 1 },
  code: { fontFamily: 'monospace', background: 'var(--bg-3)', padding: '1px 4px', borderRadius: 3, fontSize: 10 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 },
  checkbox: { width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' },
  toggleLabel: { fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 },
  previewHeader: { display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 },
  previewLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 },
  previewSub: { fontSize: 11, color: 'var(--text-muted)' },
  noteBox: { display: 'flex', gap: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 },
  noteIcon: { fontSize: 15, flexShrink: 0, opacity: 0.6 },
  statusBar: { marginTop: 20, padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13 },
  statusOk: { background: 'rgba(67,160,71,0.12)', color: '#81c784', border: '1px solid rgba(67,160,71,0.3)' },
  statusErr: { background: 'rgba(229,115,115,0.12)', color: '#e57373', border: '1px solid rgba(229,115,115,0.3)' },
  statusWarn: { background: 'rgba(255,183,77,0.1)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.25)' },
  scrollyGrid: { display: 'flex', flexDirection: 'column', gap: 16 },
  scrollyInfo: {},
  infoCard: { display: 'flex', gap: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', alignItems: 'flex-start' },
  slotLegend: { display: 'flex', gap: 16, marginTop: 10 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' },
  legendDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  slotList: { display: 'flex', flexDirection: 'column', gap: 14 },
  slotCard: { display: 'flex', gap: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  slotCardCustom: { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' },
  slotPreview: { position: 'relative', width: 160, minHeight: 110, flexShrink: 0, background: '#0a0a0a' },
  customBadge: { position: 'absolute', top: 8, left: 8, zIndex: 2, background: 'var(--accent)', color: 'var(--bg-1)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 },
  slotInfo: { flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  slotHeader: { display: 'flex', alignItems: 'center', gap: 10 },
  slotLabel: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  kindChip: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, border: '1px solid' },
  kindChipImage: { color: '#64b5f6', borderColor: 'rgba(100,181,246,0.3)', background: 'rgba(100,181,246,0.08)' },
  kindChipVideo: { color: '#ce93d8', borderColor: 'rgba(206,147,216,0.3)', background: 'rgba(206,147,216,0.08)' },
  slotHint: { fontSize: 11, color: 'var(--text-muted)', margin: 0 },
  slotCurrent: { display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11 },
  slotCurrentLabel: { color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600, marginTop: 1 },
  slotCurrentPath: { fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: 11, wordBreak: 'break-all', background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 3 },
  slotStatus: { fontSize: 12, padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid' },
  slotStatusOk: { background: 'rgba(67,160,71,0.1)', color: '#81c784', borderColor: 'rgba(67,160,71,0.3)' },
  slotStatusErr: { background: 'rgba(229,115,115,0.1)', color: '#e57373', borderColor: 'rgba(229,115,115,0.3)' },
  slotStatusInfo: { background: 'rgba(255,183,77,0.08)', color: '#ffb74d', borderColor: 'rgba(255,183,77,0.2)' },
  slotActions: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  uploadBtn: { background: 'var(--accent)', color: 'var(--bg-1)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  clearBtn: { background: 'transparent', color: '#e57373', border: '1px solid rgba(229,115,115,0.35)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  slotSizeHint: { fontSize: 10, color: 'var(--text-muted)', margin: 0 },
}

const mp = {
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 110 },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 110 },
  placeholder: { width: '100%', height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'var(--bg-3)' },
  placeholderText: { fontSize: 10, color: 'var(--text-muted)' },
}

const preview = {
  card: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  media: { position: 'relative', height: 180, background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e)', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  emojiBox: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' },
  tag: { position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,.15)' },
  hiddenBadge: { position: 'absolute', top: 12, right: 12, background: '#c62828', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 },
  body: { padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  title: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  desc: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 },
  features: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11, padding: '3px 9px', borderRadius: 20 },
  btn: { marginTop: 4, background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'default', alignSelf: 'flex-start' },
}