import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const DEFAULT_THEMES = [
  {
    id: 'romantic',
    key: 'romantic',
    title: 'Heart Theme',
    tag: '🌹 Romantic',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.',
    features: 'Candles, Rose petals, Music',
    img: '/themes/romantic/romantic1.jpg',
    emoji: '',
    active: true,
  },
  {
    id: 'birthday',
    key: 'birthday',
    title: 'Balloon Theme',
    tag: '🎉 Birthday',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.',
    features: 'Balloons, Custom banner, Cake',
    img: '',
    emoji: '🎂',
    active: true,
  },
  {
    id: 'surprise',
    key: 'surprise',
    title: 'Partition Theme',
    tag: '✨ Surprise',
    desc: 'A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.',
    features: 'Secret setup, Reveal décor, Timing',
    img: '',
    emoji: '🎁',
    active: true,
  },
]

function themeToForm(t) {
  return {
    ...t,
    features: Array.isArray(t.features) ? t.features.join(', ') : (t.features || ''),
  }
}

function formToPayload(f) {
  return {
    ...f,
    features: f.features
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

function isBuiltin(id) {
  return ['romantic', 'birthday', 'surprise'].includes(id)
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

const BLANK_THEME = {
  id: '',
  key: '',
  title: '',
  tag: '',
  desc: '',
  features: '',
  img: '',
  emoji: '',
  active: true,
}

export default function Themes() {
  const [themes, setThemes] = useState(DEFAULT_THEMES.map(themeToForm))
  const [activeId, setActiveId] = useState('romantic')
  const [status, setStatus] = useState({ msg: '', type: 'info' })
  const [isSaving, setIsSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newTheme, setNewTheme] = useState({ ...BLANK_THEME })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    let ignore = false
    apiFetch('/themes')
      .then((data) => {
        if (!ignore && data.data?.length) setThemes(data.data.map(themeToForm))
      })
      .catch(() => {
        if (!ignore) setStatus({ msg: 'Using local defaults. Backend not connected.', type: 'warn' })
      })
    return () => { ignore = true }
  }, [])

  const active = themes.find((t) => t.id === activeId) || themes[0]

  function updateActive(field, value) {
    setThemes((prev) => prev.map((t) => (t.id === activeId ? { ...t, [field]: value } : t)))
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
      setStatus({ msg: `"${data.data.title}" saved. Theme section on the website will reflect this now.`, type: 'ok' })
    } catch (err) {
      setStatus({ msg: err.message || 'Could not save theme.', type: 'err' })
    } finally {
      setIsSaving(false)
    }
  }

  async function createTheme() {
    if (!newTheme.title.trim() || !newTheme.key.trim()) {
      setStatus({ msg: 'Theme key and title are required.', type: 'err' })
      return
    }
    setIsSaving(true)
    setStatus({ msg: '', type: 'info' })
    try {
      const payload = formToPayload(newTheme)
      const data = await apiFetch('/themes', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setThemes((prev) => [...prev, themeToForm(data.data)])
      setActiveId(data.data.id)
      setIsAdding(false)
      setNewTheme({ ...BLANK_THEME })
      setStatus({ msg: `New theme "${data.data.title}" created and live on the website.`, type: 'ok' })
    } catch (err) {
      setStatus({ msg: err.message || 'Could not create theme.', type: 'err' })
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteTheme(id) {
    setIsSaving(true)
    setStatus({ msg: '', type: 'info' })
    try {
      await apiFetch(`/themes/${id}`, { method: 'DELETE' })
      const remaining = themes.filter((t) => t.id !== id)
      setThemes(remaining)
      setActiveId(remaining[0]?.id || '')
      setDeleteConfirm(null)
      setStatus({ msg: 'Theme removed from the website.', type: 'ok' })
    } catch (err) {
      setStatus({ msg: err.message || 'Could not delete theme.', type: 'err' })
    } finally {
      setIsSaving(false)
    }
  }

  const editForm = isAdding ? newTheme : active
  const setEditForm = isAdding
    ? (updater) => setNewTheme((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    : (updater) => {
        if (typeof updater === 'function') {
          // not used but safe fallback
        } else {
          Object.entries(updater).forEach(([k, v]) => updateActive(k, v))
        }
      }

  function fieldSetter(field) {
    return (e) => {
      if (isAdding) setNewTheme((prev) => ({ ...prev, [field]: e.target.value }))
      else updateActive(field, e.target.value)
    }
  }
  function checkSetter(field) {
    return (e) => {
      if (isAdding) setNewTheme((prev) => ({ ...prev, [field]: e.target.checked }))
      else updateActive(field, e.target.checked)
    }
  }

  const currentForm = isAdding ? newTheme : active

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Theme Manager</h1>
            <p style={s.pageSub}>
              Edit existing themes or introduce new ones — changes reflect live on the website's theme section.
            </p>
          </div>
          <div style={s.headerActions}>
            <button
              onClick={() => { setIsAdding(true); setActiveId(null) }}
              style={s.addBtn}
              disabled={isAdding}
            >
              + New Theme
            </button>
            {!isAdding && (
              <button onClick={saveTheme} disabled={isSaving} style={s.saveBtn}>
                {isSaving ? 'Saving…' : 'Save Theme'}
              </button>
            )}
            {isAdding && (
              <>
                <button onClick={() => { setIsAdding(false); setActiveId(themes[0]?.id) }} style={s.cancelBtn}>
                  Cancel
                </button>
                <button onClick={createTheme} disabled={isSaving} style={s.saveBtn}>
                  {isSaving ? 'Creating…' : 'Create Theme'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Theme tabs */}
        {!isAdding && (
          <div style={s.tabs}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{ ...s.tab, ...(t.id === activeId ? s.activeTab : {}) }}
              >
                <span style={s.tabEmoji}>{t.emoji || '🎨'}</span>
                <span style={s.tabLabel}>{t.title || t.tag || t.id}</span>
                {!t.active && <span style={s.inactiveDot} title="Hidden on website" />}
              </button>
            ))}
          </div>
        )}

        {isAdding && (
          <div style={s.newBadge}>✦ Creating a new theme</div>
        )}

        {/* Editor + Preview */}
        {currentForm && (
          <div style={s.editorGrid}>
            {/* Left: form fields */}
            <div style={s.formCol}>
              <section style={s.panel}>
                <h2 style={s.panelTitle}>Theme Identity</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Theme Key
                    <span style={s.hint}>Unique slug (e.g. "romantic") — used in URLs & experience page</span>
                    <input
                      style={{ ...s.input, ...(isBuiltin(currentForm.id) && !isAdding ? s.inputReadonly : {}) }}
                      value={currentForm.key}
                      onChange={fieldSetter('key')}
                      readOnly={isBuiltin(currentForm.id) && !isAdding}
                      placeholder="e.g. graduation"
                    />
                  </label>
                  <label style={s.field}>
                    Display Title
                    <input
                      style={s.input}
                      value={currentForm.title}
                      onChange={fieldSetter('title')}
                      placeholder="e.g. Graduation Gala"
                    />
                  </label>
                  <label style={s.field}>
                    Tag Label
                    <span style={s.hint}>Shown as the category chip (emoji + label)</span>
                    <input
                      style={s.input}
                      value={currentForm.tag}
                      onChange={fieldSetter('tag')}
                      placeholder="e.g. 🎓 Graduation"
                    />
                  </label>
                  <label style={s.field}>
                    Emoji (if no image)
                    <input
                      style={s.input}
                      value={currentForm.emoji}
                      onChange={fieldSetter('emoji')}
                      placeholder="e.g. 🎓"
                    />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Content</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Description
                    <textarea
                      style={{ ...s.input, minHeight: 90, resize: 'vertical' }}
                      value={currentForm.desc}
                      onChange={fieldSetter('desc')}
                      placeholder="Short paragraph shown on the theme card…"
                    />
                  </label>
                  <label style={s.field}>
                    Feature Chips
                    <span style={s.hint}>Comma-separated list shown as feature badges</span>
                    <input
                      style={s.input}
                      value={currentForm.features}
                      onChange={fieldSetter('features')}
                      placeholder="e.g. Candles, Rose petals, Music"
                    />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Media</h2>
                <div style={s.fieldGrid}>
                  <label style={s.field}>
                    Image Path
                    <span style={s.hint}>
                      Path relative to <code style={s.code}>/public</code> — e.g.{' '}
                      <code style={s.code}>/themes/romantic/romantic1.jpg</code>
                    </span>
                    <input
                      style={s.input}
                      value={currentForm.img}
                      onChange={fieldSetter('img')}
                      placeholder="/themes/mytheme/cover.jpg"
                    />
                  </label>
                  <label style={s.field}>
                    Video Path (optional)
                    <span style={s.hint}>
                      Used on the experience / scrollytelling page — e.g.{' '}
                      <code style={s.code}>/themes/romantic/romantic.mp4</code>
                    </span>
                    <input
                      style={s.input}
                      value={currentForm.videoSrc || ''}
                      onChange={fieldSetter('videoSrc')}
                      placeholder="/themes/mytheme/cover.mp4"
                    />
                  </label>
                </div>
              </section>

              <section style={s.panel}>
                <h2 style={s.panelTitle}>Visibility</h2>
                <label style={s.toggleRow}>
                  <input
                    type="checkbox"
                    checked={currentForm.active !== false}
                    onChange={checkSetter('active')}
                    style={s.checkbox}
                  />
                  <span style={s.toggleLabel}>
                    {currentForm.active !== false ? '✅ Visible on website' : '🚫 Hidden from website'}
                  </span>
                </label>
                <p style={s.hint}>
                  Uncheck to temporarily hide this theme from the public theme section without deleting it.
                </p>
              </section>

              {/* Delete — only non-builtins */}
              {!isAdding && !isBuiltin(currentForm.id) && (
                <section style={{ ...s.panel, borderColor: '#6b2222' }}>
                  <h2 style={{ ...s.panelTitle, color: '#e57373' }}>Danger Zone</h2>
                  {deleteConfirm === currentForm.id ? (
                    <div style={s.deleteConfirmBox}>
                      <p style={s.deleteConfirmText}>
                        Are you sure? This will permanently remove the theme from the website.
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => deleteTheme(currentForm.id)} disabled={isSaving} style={s.deleteBtn}>
                          {isSaving ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} style={s.cancelBtn}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(currentForm.id)} style={s.deleteOutlineBtn}>
                      Delete This Theme
                    </button>
                  )}
                </section>
              )}
            </div>

            {/* Right: live preview */}
            <div style={s.previewCol}>
              <div style={s.previewHeader}>
                <span style={s.previewLabel}>Live Preview</span>
                <span style={s.previewSub}>How this card appears on the website</span>
              </div>
              <ThemeCardPreview theme={currentForm} />

              <div style={s.noteBox}>
                <span style={s.noteIcon}>ℹ</span>
                <div>
                  <strong>After saving</strong>, the theme section on your homepage will automatically use the new data.
                  For new themes, also add their media files to <code style={s.code}>client/public/themes/&lt;key&gt;/</code> and
                  create a corresponding experience page component in <code style={s.code}>client/src/components/</code>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status bar */}
        {status.msg && (
          <div style={{ ...s.statusBar, ...(status.type === 'err' ? s.statusErr : status.type === 'warn' ? s.statusWarn : s.statusOk) }}>
            {status.msg}
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Inline Preview Card ── */
function ThemeCardPreview({ theme }) {
  const features = typeof theme.features === 'string'
    ? theme.features.split(',').map((f) => f.trim()).filter(Boolean)
    : (theme.features || [])

  return (
    <div style={preview.card}>
      {/* Media */}
      <div style={preview.media}>
        {theme.img ? (
          <img
            src={theme.img}
            alt={theme.title}
            style={preview.img}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : theme.emoji ? (
          <div style={preview.emojiBox}>{theme.emoji}</div>
        ) : (
          <div style={preview.emojiBox}>🎨</div>
        )}
        <div style={preview.overlay} />
        <div style={preview.tag}>{theme.tag || '🎨 Theme'}</div>
        {!theme.active && (
          <div style={preview.hiddenBadge}>Hidden</div>
        )}
      </div>

      {/* Body */}
      <div style={preview.body}>
        <h3 style={preview.title}>{theme.title || 'Theme Title'}</h3>
        <p style={preview.desc}>{theme.desc || 'Theme description will appear here.'}</p>
        <div style={preview.features}>
          {features.length > 0
            ? features.map((f) => (
                <span key={f} style={preview.chip}>{f}</span>
              ))
            : <span style={preview.chip}>Feature</span>}
        </div>
        <button style={preview.btn}>Explore Experience →</button>
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4, maxWidth: 480 },
  headerActions: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  addBtn: { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, position: 'relative' },
  activeTab: { color: 'var(--accent)', background: 'var(--accent-dim)', borderColor: 'var(--accent)' },
  tabEmoji: { fontSize: 16 },
  tabLabel: {},
  inactiveDot: { width: 7, height: 7, borderRadius: '50%', background: '#e57373', display: 'inline-block' },
  newBadge: { display: 'inline-block', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '6px 14px', fontSize: 13, fontWeight: 600, marginBottom: 20 },
  editorGrid: { display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: 20, alignItems: 'start' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  previewCol: { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px' },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 14, fontWeight: 700 },
  fieldGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 },
  hint: { color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 },
  code: { fontFamily: 'monospace', background: 'var(--bg-3)', padding: '1px 4px', borderRadius: 3, fontSize: 10 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13, outline: 'none' },
  inputReadonly: { opacity: 0.5, cursor: 'not-allowed' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 },
  checkbox: { width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' },
  toggleLabel: { fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 },
  deleteConfirmBox: { background: 'rgba(229,115,115,0.08)', border: '1px solid #6b2222', borderRadius: 'var(--radius-sm)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 },
  deleteConfirmText: { color: '#e57373', fontSize: 13 },
  deleteBtn: { background: '#c62828', border: 'none', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  deleteOutlineBtn: { background: 'transparent', border: '1px solid #6b2222', color: '#e57373', borderRadius: 'var(--radius-sm)', padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  previewHeader: { display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 },
  previewLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 },
  previewSub: { fontSize: 11, color: 'var(--text-muted)' },
  noteBox: { display: 'flex', gap: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 },
  noteIcon: { fontSize: 15, flexShrink: 0, opacity: 0.6 },
  statusBar: { marginTop: 20, padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13 },
  statusOk: { background: 'rgba(67,160,71,0.12)', color: '#81c784', border: '1px solid rgba(67,160,71,0.3)' },
  statusErr: { background: 'rgba(229,115,115,0.12)', color: '#e57373', border: '1px solid rgba(229,115,115,0.3)' },
  statusWarn: { background: 'rgba(255,183,77,0.1)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.25)' },
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