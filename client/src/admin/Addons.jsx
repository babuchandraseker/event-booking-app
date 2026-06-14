import { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL, DEFAULT_PACKAGES, fetchPackages, formatMoney } from '../data/packageCatalog'

const MAX_EXTRA_ADDONS = 3

/* ── Emoji picker options for add-ons ── */
const ADDON_EMOJIS = [
  '🎈','🎁','💐','🎂','🕯️','🎬','🌫️','🟥','🖼️','🎊',
  '🌹','🍰','🥂','✨','🎶','🎠','🎀','🪄','🧨','🎇',
  '🫶','💍','🌺','🪷','🦋','🎭','🎪','🍾','🪩','💫',
  '🌟','⭐','💎','👑','🏆','🎯','🔮','🪅','🎻','🎸',
  '📸','🤳','🎥','📷','🎙️','🎤','🎹','🥁','🪘','🎺',
]

/* ── Emoji Picker component ── */
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Pick an emoji"
        style={{
          width: 48, height: 38, fontSize: 20, textAlign: 'center',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s',
          ...(open ? { borderColor: 'var(--accent)' } : {}),
        }}
      >
        {value || '✦'}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: 'var(--bg-2)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)', padding: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'grid', gridTemplateColumns: 'repeat(10, 30px)', gap: 4, width: 360,
        }}>
          <div style={{ gridColumn: '1 / -1', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
            Pick an emoji for this add-on
          </div>
          {ADDON_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => { onChange(em); setOpen(false) }}
              title={em}
              style={{
                width: 30, height: 30, fontSize: 16, background: value === em ? 'var(--accent-dim)' : 'transparent',
                border: value === em ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {em}
            </button>
          ))}
          <div style={{ gridColumn: '1 / -1', marginTop: 6, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
            <input
              style={{
                width: '100%', background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '6px 10px',
                fontSize: 16, outline: 'none', boxSizing: 'border-box',
              }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or type / paste any emoji…"
              maxLength={4}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarDateTimeInput({ value, onChange, min }) {
  return (
    <div style={s.calendarBox}>
      <input
        style={s.calendarInput}
        type="datetime-local"
        value={toDateTimeInputValue(value)}
        min={min}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* ── helpers ── */
function toForm(pkg) {
  return {
    ...pkg,
    // Offer price fields
    offerEnabled:   pkg.offerEnabled   ?? false,
    offerPrice:     pkg.offerPrice     ?? '',
    offerStart:     pkg.offerStart     ?? '',
    offerEnd:       pkg.offerEnd       ?? '',
    // Visibility
    visible:        pkg.visible        ?? true,
    // Stamp _originalName on each addon when first loaded from the server.
    // This lets the UI correctly classify an addon as "builtin" even after
    // the admin renames it — the rename should NOT turn it into a new extra addon.
    addons: (pkg.addons || []).map((a) => ({
      ...a,
      _originalName: a._originalName || a.name,
    })),
  }
}

function toDateTimeInputValue(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return value.slice(0, 16)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getNowDateTimeInput() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getMinDateTimeInput(...dates) {
  return dates.filter(Boolean).sort().at(-1) || getNowDateTimeInput()
}

function getOfferBoundaryTime(value, boundary = 'start') {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const suffix = boundary === 'end' ? 'T23:59:59' : 'T00:00:00'
    return new Date(`${value}${suffix}`).getTime()
  }
  return new Date(value).getTime()
}

/* ── Offer status helper ── */
function getOfferStatus(pkg) {
  if (!pkg.offerEnabled || !pkg.offerPrice) return null
  const now   = Date.now()
  const start = getOfferBoundaryTime(pkg.offerStart, 'start')
  const end   = getOfferBoundaryTime(pkg.offerEnd, 'end')
  if (start && now < start) return 'scheduled'
  if (end   && now > end)   return 'expired'
  return 'active'
}

/* ── Image upload helper ── */
async function uploadAddonImage(file, token) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const dataUrl = reader.result  // full data:image/jpeg;base64,... string
        const response = await fetch(`${API_BASE_URL}/upload/addon-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataUrl }),  // server expects { dataUrl }
        })
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.message || 'Upload failed.')
        resolve(result.path)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

/* ── API ── */
async function savePackageAPI(pkg) {
  const token = localStorage.getItem('adminToken')
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 12000)

  const payload = {
    title: pkg.title,
    price: Number(pkg.price || 0),
    duration: pkg.duration,
    maxGuests: Number(pkg.maxGuests || 1),
    popular: pkg.popular === true,
    active: true,
    visible: pkg.visible ?? true,
    offerEnabled: pkg.offerEnabled ?? false,
    offerPrice:   pkg.offerPrice   ? Number(pkg.offerPrice) : null,
    offerStart:   pkg.offerStart   || null,
    offerEnd:     pkg.offerEnd     || null,
    included: pkg.included,
    addons: (pkg.addons || []).map((a) => ({
      ...a,
      img: a.img || '',
      emoji: a.emoji || '',
      _originalName: a._originalName || a.name,
    })),
  }

  try {
    const response = await fetch(`${API_BASE_URL}/packages/${pkg.id}`, {
      method: 'PATCH',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.message || 'Could not save package.')
    return result.data
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/* ── Component ── */
export default function Addons() {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES.map(toForm))
  const [activeId, setActiveId] = useState('basic')
  const [status, setStatus] = useState({ msg: '', type: 'info' })
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const [newAddon, setNewAddon] = useState({ name: '', price: '', desc: '', img: '', emoji: '' })
  const [addingAddon, setAddingAddon] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(null)
  const [localPreviews, setLocalPreviews] = useState({})

  useEffect(() => {
    let ignore = false
    fetchPackages()
      .then((data) => { if (!ignore) setPackages(data.map(toForm)) })
      .catch(() => {
        if (!ignore) setStatus({ msg: 'Using local defaults — start backend to load saved edits.', type: 'warn' })
      })
    return () => { ignore = true }
  }, [])

  const activePkg = packages.find((p) => p.id === activeId) || packages[0]
  const nowOfferDateTime = getNowDateTimeInput()

  function switchTab(id) {
    setActiveId(id)
    setHasUnsaved(false)
    setAddingAddon(false)
    setNewAddon({ name: '', price: '', desc: '', img: '', emoji: '' })
    setLocalPreviews({})
    setStatus({ msg: '', type: 'info' })
  }

  function updateField(field, value) {
    setHasUnsaved(true)
    setPackages((prev) => prev.map((p) => p.id === activePkg.id ? { ...p, [field]: value } : p))
  }

  // ── included items ──
  function updateIncluded(index, field, value) {
    setHasUnsaved(true)
    setPackages((prev) => prev.map((p) => {
      if (p.id !== activePkg.id) return p
      const included = p.included.map((item, i) => i === index ? { ...item, [field]: field === 'price' ? Number(value) : value } : item)
      return { ...p, included }
    }))
  }

  function removeIncluded(index) {
    setHasUnsaved(true)
    setPackages((prev) => prev.map((p) => {
      if (p.id !== activePkg.id) return p
      return { ...p, included: p.included.filter((_, i) => i !== index) }
    }))
  }

  // ── addons ──
  const defaultAddonNames = new Set(
    (DEFAULT_PACKAGES.find((p) => p.id === activeId)?.addons || []).map((a) => a.name)
  )
  // An addon is "builtin" if its _originalName (the name it had when loaded from server)
  // matches a default addon name. This means renames stay classified as builtin.
  const builtinAddons = activePkg.addons
    .map((a, i) => ({ ...a, globalIndex: i }))
    .filter((a) => defaultAddonNames.has(a._originalName || a.name))
  const extraAddons = activePkg.addons
    .map((a, i) => ({ ...a, globalIndex: i }))
    .filter((a) => !defaultAddonNames.has(a._originalName || a.name))

  function updateAddon(globalIndex, field, value) {
    setHasUnsaved(true)
    // Use _originalName (the name the addon had when loaded) as the cross-package
    // lookup key so that renames still propagate to all packages.
    const originalName = activePkg.addons[globalIndex]?._originalName || activePkg.addons[globalIndex]?.name
    setPackages((prev) => prev.map((p) => {
      if (p.id === activePkg.id) {
        const addons = p.addons.map((a, i) => i === globalIndex ? { ...a, [field]: field === 'price' ? Number(value) : value } : a)
        return { ...p, addons }
      }
      if (originalName) {
        const addons = p.addons.map((a) => {
          const aOriginal = a._originalName || a.name
          if (aOriginal !== originalName) return a
          return { ...a, [field]: field === 'price' ? Number(value) : value }
        })
        return { ...p, addons }
      }
      return p
    }))
  }

  function removeAddon(globalIndex) {
    setHasUnsaved(true)
    setPackages((prev) => prev.map((p) => {
      if (p.id !== activePkg.id) return p
      return { ...p, addons: p.addons.filter((_, i) => i !== globalIndex) }
    }))
  }

  function addExtraAddon() {
    const name = newAddon.name.trim()
    const price = Number(newAddon.price)
    if (!name) { setStatus({ msg: 'Addon name is required.', type: 'err' }); return }
    if (!newAddon.price || isNaN(price) || price < 0) { setStatus({ msg: 'Enter a valid price.', type: 'err' }); return }
    if (activePkg.addons.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      setStatus({ msg: 'An addon with this name already exists.', type: 'err' }); return
    }
    setHasUnsaved(true)
    setPackages((prev) => prev.map((p) => {
      if (p.id !== activePkg.id) return p
      return { ...p, addons: [...p.addons, { name, price, desc: newAddon.desc.trim(), img: newAddon.img.trim(), emoji: newAddon.emoji.trim() }] }
    }))
    setNewAddon({ name: '', price: '', desc: '', img: '', emoji: '' })
    setAddingAddon(false)
    setStatus({ msg: '', type: 'info' })
  }

  // ── image upload ──
  async function handleAddonImageUpload(file, globalIndex) {
    if (!file) return
    const token = localStorage.getItem('adminToken')
    const previewUrl = URL.createObjectURL(file)
    setLocalPreviews((prev) => ({ ...prev, [globalIndex]: previewUrl }))
    setUploadingImg(globalIndex)
    setStatus({ msg: '', type: 'info' })
    try {
      const imgPath = await uploadAddonImage(file, token)
      const originalName = activePkg.addons[globalIndex]?._originalName || activePkg.addons[globalIndex]?.name

      // Update React state for ALL packages (matched by _originalName)
      let updatedPackages = []
      setPackages((prev) => {
        const next = prev.map((p) => {
          if (p.id === activePkg.id) {
            const addons = p.addons.map((a, i) => i === globalIndex ? { ...a, img: imgPath } : a)
            return { ...p, addons }
          }
          if (originalName) {
            const addons = p.addons.map((a) => {
              const aOriginal = a._originalName || a.name
              return aOriginal === originalName ? { ...a, img: imgPath } : a
            })
            return { ...p, addons }
          }
          return p
        })
        updatedPackages = next
        return next
      })

      setStatus({ msg: '✓ Image uploaded — saving to all packages…', type: 'info' })

      // Auto-save ALL packages so the new image persists on the server
      await Promise.all(updatedPackages.map((pkg) => savePackageAPI(pkg)))

      // Only clear local preview AFTER save completes so no flash
      setLocalPreviews((prev) => { const n = { ...prev }; delete n[globalIndex]; return n })
      setHasUnsaved(false)
      setStatus({ msg: '✓ Image saved and visible on the main website.', type: 'ok' })
      window.dispatchEvent(new CustomEvent('packagesUpdated'))
    } catch (err) {
      setLocalPreviews((prev) => { const n = { ...prev }; delete n[globalIndex]; return n })
      setStatus({ msg: err.message || 'Image upload failed.', type: 'err' })
    } finally {
      setUploadingImg(null)
    }
  }

  async function handleNewAddonImageUpload(file) {
    if (!file) return
    const token = localStorage.getItem('adminToken')
    const previewUrl = URL.createObjectURL(file)
    setLocalPreviews((prev) => ({ ...prev, new: previewUrl }))
    setUploadingImg('new')
    setStatus({ msg: '', type: 'info' })
    try {
      const imgPath = await uploadAddonImage(file, token)
      setNewAddon((p) => ({ ...p, img: imgPath }))
      setLocalPreviews((prev) => { const n = { ...prev }; delete n.new; return n })
    } catch (err) {
      setStatus({ msg: err.message || 'Image upload failed.', type: 'err' })
    } finally {
      setUploadingImg(null)
    }
  }

  async function savePackage() {
    setIsSaving(true)
    setStatus({ msg: '', type: 'info' })
    try {
      // Save ALL packages so that addon changes (name, price, desc, img) are
      // reflected across Silver, Gold and Platinum — not just the active tab.
      const results = await Promise.all(packages.map((pkg) => savePackageAPI(pkg)))

      // Merge server responses back into local state
      setPackages((prev) => prev.map((p) => {
        const saved = results.find((r) => r.id === p.id)
        if (!saved) return p
        const mergedAddons = (saved.addons || []).map((serverAddon, i) => {
          const localAddon = p.addons[i] || {}
          return {
            ...serverAddon,
            img: serverAddon.img || localAddon.img || '',
            emoji: serverAddon.emoji !== undefined ? serverAddon.emoji : (localAddon.emoji || ''),
            _originalName: serverAddon._originalName || localAddon._originalName || serverAddon.name,
          }
        })
        return { ...toForm(saved), addons: mergedAddons }
      }))

      setHasUnsaved(false)
      setStatus({ msg: `✓ All packages saved — add-on changes are now live across all packages on the website.`, type: 'ok' })
      window.dispatchEvent(new CustomEvent('packagesUpdated'))
    } catch (err) {
      setStatus({
        msg: err.name === 'AbortError'
          ? 'Save is taking too long — check backend connection and try again.'
          : (err.message || 'Could not save packages.'),
        type: 'err',
      })
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
            <h1 style={s.pageTitle}>Package & Add-ons Editor</h1>
            <p style={s.pageSub}>
              Edit package details, manage what's included, and control add-ons for each package. Changes reflect live on the website.
            </p>
          </div>
          <div style={s.headerActions}>
            {hasUnsaved && <span style={s.unsavedBadge}>● Unsaved changes</span>}
            <button
              onClick={savePackage}
              disabled={isSaving || !hasUnsaved}
              style={{
                ...s.saveBtn,
                opacity: (!hasUnsaved || isSaving) ? 0.5 : 1,
                cursor: (!hasUnsaved || isSaving) ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving…' : 'Save Package'}
            </button>
          </div>
        </div>

        {/* Live banner */}
        <div style={s.liveBanner}>
          <span style={s.liveDot} />
          <span>Changes saved here update the package cards and booking flow on the website immediately.</span>
        </div>

        {/* Package tabs */}
        <div style={s.tabs}>
          {packages.map((pkg) => {
            const offerStatus = getOfferStatus(pkg)
            return (
              <button
                key={pkg.id}
                onClick={() => switchTab(pkg.id)}
                style={{ ...s.tab, ...(pkg.id === activeId ? s.activeTab : {}), ...(pkg.visible === false ? { opacity: 0.55 } : {}) }}
              >
                <span style={s.tabTitle}>{pkg.title}</span>
                <span style={s.tabPrice}>
                  {offerStatus === 'active' && pkg.offerPrice ? (
                    <>
                      <span style={{ textDecoration: 'line-through', marginRight: 4, opacity: 0.6 }}>Rs {formatMoney(pkg.price)}</span>
                      <span style={{ color: '#81c784' }}>Rs {formatMoney(pkg.offerPrice)}</span>
                    </>
                  ) : (
                    `Rs ${formatMoney(pkg.price)}`
                  )}
                </span>
                {pkg.popular && <span style={s.popularBadge}>Popular</span>}
                {offerStatus === 'active'    && <span style={{ ...s.popularBadge, background: '#43a047', top: pkg.popular ? 26 : 8 }}>Sale</span>}
                {offerStatus === 'scheduled' && <span style={{ ...s.popularBadge, background: '#f57c00', top: pkg.popular ? 26 : 8 }}>Soon</span>}
                {pkg.visible === false       && <span style={{ ...s.popularBadge, background: '#555', top: (pkg.popular || offerStatus) ? 44 : 8 }}>Hidden</span>}
              </button>
            )
          })}
        </div>

        {activePkg && (
          <div style={s.columns}>

            {/* Column 1: Package Details */}
            <section style={s.panel}>
              <h2 style={s.panelTitle}>Package Details</h2>
              <div style={s.fieldStack}>
                <label style={s.field}>
                  Package Name
                  <input
                    style={s.input}
                    value={activePkg.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </label>
                <label style={s.field}>
                  Price (Rs)
                  <input
                    style={s.input}
                    type="number"
                    value={activePkg.price}
                    onChange={(e) => updateField('price', e.target.value)}
                  />
                </label>
                <label style={s.field}>
                  Duration
                  <input
                    style={s.input}
                    value={activePkg.duration}
                    onChange={(e) => updateField('duration', e.target.value)}
                    placeholder="e.g. 1.5 hours"
                  />
                </label>
                <label style={s.field}>
                  Max Guests
                  <input
                    style={s.input}
                    type="number"
                    value={activePkg.maxGuests}
                    onChange={(e) => updateField('maxGuests', e.target.value)}
                  />
                </label>
                <label style={s.toggleRow}>
                  <input
                    type="checkbox"
                    checked={activePkg.popular === true}
                    onChange={(e) => updateField('popular', e.target.checked)}
                    style={s.checkbox}
                  />
                  <span style={s.toggleLabel}>Mark as Popular</span>
                </label>
              </div>

              {/* ── Offer Price ── */}
              {(() => {
                const offerStatus = getOfferStatus(activePkg)
                const statusColors = {
                  active:    { bg: 'rgba(67,160,71,0.1)',  border: 'rgba(67,160,71,0.3)',  text: '#81c784', label: '🟢 Offer Active' },
                  scheduled: { bg: 'rgba(255,183,77,0.1)', border: 'rgba(255,183,77,0.3)', text: '#ffb74d', label: '🕐 Scheduled' },
                  expired:   { bg: 'rgba(229,115,115,0.1)',border: 'rgba(229,115,115,0.3)',text: '#e57373', label: '⛔ Expired' },
                }
                const sc = offerStatus ? statusColors[offerStatus] : null
                return (
                  <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <h3 style={s.subTitle}>🏷️ Offer Price</h3>
                      {sc && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                          {sc.label}
                        </span>
                      )}
                    </div>
                    <p style={s.hint}>
                      Show a limited-time sale price. The original price will appear with a strikethrough and the offer price is shown in its place on the package card.
                    </p>

                    {/* Enable toggle */}
                    <label style={{ ...s.toggleRow, marginBottom: 14 }}>
                      <input
                        type="checkbox"
                        checked={activePkg.offerEnabled === true}
                        onChange={(e) => updateField('offerEnabled', e.target.checked)}
                        style={s.checkbox}
                      />
                      <span style={s.toggleLabel}>Enable Offer Price</span>
                    </label>

                    {activePkg.offerEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Offer price input */}
                        <label style={s.field}>
                          Offer Price (Rs)
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              style={{ ...s.input, flex: 1 }}
                              type="number"
                              value={activePkg.offerPrice}
                              onChange={(e) => updateField('offerPrice', e.target.value)}
                              placeholder="e.g. 1499"
                            />
                            {/* Live preview */}
                            {activePkg.offerPrice && Number(activePkg.offerPrice) < Number(activePkg.price) && (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '6px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', flexShrink: 0 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                  Rs {activePkg.price}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#81c784' }}>
                                  Rs {activePkg.offerPrice}
                                </span>
                              </div>
                            )}
                          </div>
                          {activePkg.offerPrice && Number(activePkg.offerPrice) >= Number(activePkg.price) && (
                            <span style={{ fontSize: 11, color: '#e57373', marginTop: 3 }}>⚠ Offer price must be less than the regular price.</span>
                          )}
                        </label>

                        {/* Date range */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <label style={s.field}>
                            Offer Starts
                            <CalendarDateTimeInput
                              value={activePkg.offerStart}
                              min={nowOfferDateTime}
                              onChange={(value) => updateField('offerStart', value)}
                            />
                          </label>
                          <label style={s.field}>
                            Offer Ends
                            <CalendarDateTimeInput
                              value={activePkg.offerEnd}
                              min={getMinDateTimeInput(nowOfferDateTime, toDateTimeInputValue(activePkg.offerStart))}
                              onChange={(value) => updateField('offerEnd', value)}
                            />
                          </label>
                        </div>
                        <p style={{ ...s.hint, marginBottom: 0 }}>
                          Leave both dates empty to run the offer indefinitely. The offer price is only shown while the current date is within the selected window.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── Visibility ── */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h3 style={{ ...s.subTitle, marginBottom: 6 }}>Visibility</h3>
                <label style={s.toggleRow}>
                  <input
                    type="checkbox"
                    checked={activePkg.visible !== false}
                    onChange={(e) => updateField('visible', e.target.checked)}
                    style={s.checkbox}
                  />
                  <span style={{ ...s.toggleLabel, color: activePkg.visible !== false ? '#81c784' : 'var(--text-muted)' }}>
                    {activePkg.visible !== false ? '✅ Visible on website' : '🚫 Hidden from website'}
                  </span>
                </label>
                <p style={{ ...s.hint, marginTop: 6, marginBottom: 0 }}>
                  Uncheck to temporarily hide this package without losing its settings.
                </p>
              </div>

              {/* Included items */}
              <div style={{ marginTop: 24 }}>
                <h3 style={s.subTitle}>What's Included</h3>
                <p style={s.hint}>Items shown in the "Included" list on the website's package cards.</p>
                <div style={s.itemList}>
                  {activePkg.included.map((item, i) => (
                    <div key={i} style={s.itemRow}>
                      <div style={s.itemMain}>
                        <input
                          style={{ ...s.input, flex: 1 }}
                          value={item.name}
                          onChange={(e) => updateIncluded(i, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                        <input
                          style={{ ...s.input, width: 90 }}
                          value={item.note || ''}
                          onChange={(e) => updateIncluded(i, 'note', e.target.value)}
                          placeholder="Note (optional)"
                        />
                      </div>
                      <button
                        onClick={() => removeIncluded(i)}
                        style={s.removeBtn}
                        title="Remove this included item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setHasUnsaved(true)
                    setPackages((prev) => prev.map((p) =>
                      p.id === activePkg.id
                        ? { ...p, included: [...p.included, { name: '', note: '' }] }
                        : p
                    ))
                  }}
                  style={{ ...s.addAddonBtn, marginTop: 10 }}
                >
                  + Add Included Item
                </button>
              </div>
            </section>

            {/* Column 2: Add-ons */}
            <section style={s.panel}>
              <div style={s.addonHeader}>
                <div>
                  <h2 style={s.panelTitle}>Paid Add-ons</h2>
                  <p style={s.hint}>
                    Add-ons customers can purchase with this package. You can add up to{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{MAX_EXTRA_ADDONS}</strong> extra add-ons beyond the defaults.
                  </p>
                </div>
              </div>

              {/* Built-in addons */}
              {builtinAddons.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={s.addonGroupLabel}>Default Add-ons</div>
                  <div style={s.itemList}>
                    {builtinAddons.map((addon) => (
                      <div key={addon.globalIndex} style={{ ...s.addonRow, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <EmojiPicker
                            value={addon.emoji || ''}
                            onChange={(val) => updateAddon(addon.globalIndex, 'emoji', val)}
                          />
                          <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              style={{ ...s.input, flex: 1, minWidth: 120 }}
                              value={addon.name}
                              onChange={(e) => updateAddon(addon.globalIndex, 'name', e.target.value)}
                              placeholder="Add-on name"
                            />
                            <div style={s.addonPriceRow}>
                              <span style={s.addonRs}>Rs</span>
                              <input
                                style={{ ...s.input, width: 80 }}
                                type="number"
                                value={addon.price}
                                onChange={(e) => updateAddon(addon.globalIndex, 'price', e.target.value)}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeAddon(addon.globalIndex)}
                            style={s.removeBtn}
                            title="Remove this add-on"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          style={{ ...s.input, width: '100%' }}
                          value={addon.desc || ''}
                          onChange={(e) => updateAddon(addon.globalIndex, 'desc', e.target.value)}
                          placeholder="Description shown on the card (e.g. Transform your room into…)"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(localPreviews[addon.globalIndex] || addon.img) && (
                            <img
                              src={localPreviews[addon.globalIndex] || addon.img}
                              alt={addon.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid var(--border)' }}
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          )}
                          <label style={s.uploadLabel} title="Click to upload a new image">
                            <input
                              key={addon.img || addon.globalIndex}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: 'none' }}
                              onChange={(e) => { handleAddonImageUpload(e.target.files[0], addon.globalIndex); e.target.value = '' }}
                            />
                            {uploadingImg === addon.globalIndex
                              ? <span style={s.uploadingText}>Uploading…</span>
                              : <span style={s.uploadBtn}>📷 {(localPreviews[addon.globalIndex] || addon.img) ? 'Replace Photo' : 'Upload Photo'}</span>
                            }
                          </label>
                          {addon.img && !localPreviews[addon.globalIndex] && (
                            <span style={s.imgPathText} title={addon.img}>{addon.img.split('/').pop()}</span>
                          )}
                          {localPreviews[addon.globalIndex] && (
                            <span style={{ ...s.imgPathText, color: '#ffb74d' }}>Uploading…</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra (admin-added) addons */}
              <div>
                <div style={s.addonGroupLabel}>
                  Extra Add-ons
                  <span style={s.addonCount}>
                    {extraAddons.length} / {MAX_EXTRA_ADDONS} used
                  </span>
                </div>

                {extraAddons.length === 0 && (
                  <div style={s.emptySlots}>
                    No extra add-ons added yet. You can add up to {MAX_EXTRA_ADDONS} extra add-ons to this package.
                  </div>
                )}

                <div style={s.itemList}>
                  {extraAddons.map((addon) => (
                    <div key={addon.globalIndex} style={{ ...s.addonRow, flexDirection: 'column', alignItems: 'stretch', gap: 10, borderColor: 'var(--accent)', background: 'rgba(var(--accent-rgb, 180,140,90),0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <EmojiPicker
                          value={addon.emoji || ''}
                          onChange={(val) => updateAddon(addon.globalIndex, 'emoji', val)}
                        />
                        <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            style={{ ...s.input, flex: 1, minWidth: 120 }}
                            value={addon.name}
                            onChange={(e) => updateAddon(addon.globalIndex, 'name', e.target.value)}
                            placeholder="Add-on name"
                          />
                          <div style={s.addonPriceRow}>
                            <span style={s.addonRs}>Rs</span>
                            <input
                              style={{ ...s.input, width: 80 }}
                              type="number"
                              value={addon.price}
                              onChange={(e) => updateAddon(addon.globalIndex, 'price', e.target.value)}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeAddon(addon.globalIndex)}
                          style={{ ...s.removeBtn, color: '#e57373', borderColor: 'rgba(229,115,115,0.3)' }}
                          title="Remove this extra add-on"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        style={{ ...s.input, width: '100%' }}
                        value={addon.desc || ''}
                        onChange={(e) => updateAddon(addon.globalIndex, 'desc', e.target.value)}
                        placeholder="Description shown on the card"
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(localPreviews[addon.globalIndex] || addon.img) && (
                          <img
                            src={localPreviews[addon.globalIndex] || addon.img}
                            alt={addon.name}
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid var(--border)' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <label style={s.uploadLabel} title="Click to upload a new image">
                          <input
                            key={addon.img || addon.globalIndex}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => { handleAddonImageUpload(e.target.files[0], addon.globalIndex); e.target.value = '' }}
                          />
                          {uploadingImg === addon.globalIndex
                            ? <span style={s.uploadingText}>Uploading…</span>
                            : <span style={s.uploadBtn}>📷 {(localPreviews[addon.globalIndex] || addon.img) ? 'Replace Photo' : 'Upload Photo'}</span>
                          }
                        </label>
                        {addon.img && !localPreviews[addon.globalIndex] && (
                          <span style={s.imgPathText} title={addon.img}>{addon.img.split('/').pop()}</span>
                        )}
                        {localPreviews[addon.globalIndex] && (
                          <span style={{ ...s.imgPathText, color: '#ffb74d' }}>Uploading…</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add extra addon form */}
                {extraAddons.length < MAX_EXTRA_ADDONS && (
                  <div style={{ marginTop: 12 }}>
                    {!addingAddon ? (
                      <button
                        onClick={() => setAddingAddon(true)}
                        style={s.addAddonBtn}
                      >
                        + Add Extra Add-on ({MAX_EXTRA_ADDONS - extraAddons.length} slot{MAX_EXTRA_ADDONS - extraAddons.length !== 1 ? 's' : ''} left)
                      </button>
                    ) : (
                      <div style={s.newAddonForm}>
                        <div style={s.newAddonTitle}>New Add-on</div>
                        <div style={s.newAddonFields}>
                          <EmojiPicker
                            value={newAddon.emoji}
                            onChange={(val) => setNewAddon((p) => ({ ...p, emoji: val }))}
                          />
                          <input
                            style={{ ...s.input, flex: 1 }}
                            value={newAddon.name}
                            onChange={(e) => setNewAddon((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Add-on name (e.g. Custom Cake)"
                            autoFocus
                          />
                          <div style={s.addonPriceRow}>
                            <span style={s.addonRs}>Rs</span>
                            <input
                              style={{ ...s.input, width: 90 }}
                              type="number"
                              value={newAddon.price}
                              onChange={(e) => setNewAddon((p) => ({ ...p, price: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <input
                          style={{ ...s.input, width: '100%' }}
                          value={newAddon.desc}
                          onChange={(e) => setNewAddon((p) => ({ ...p, desc: e.target.value }))}
                          placeholder="Description (e.g. Romantic candles lining your path…)"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(localPreviews['new'] || newAddon.img) && (
                            <img
                              src={localPreviews['new'] || newAddon.img}
                              alt="preview"
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid var(--border)' }}
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          )}
                          <label style={s.uploadLabel} title="Click to upload an image">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: 'none' }}
                              onChange={(e) => { handleNewAddonImageUpload(e.target.files[0]); e.target.value = '' }}
                            />
                            {uploadingImg === 'new'
                              ? <span style={s.uploadingText}>Uploading…</span>
                              : <span style={s.uploadBtn}>📷 {(localPreviews['new'] || newAddon.img) ? 'Replace Photo' : 'Upload Photo'}</span>
                            }
                          </label>
                          {newAddon.img && !localPreviews['new'] && (
                            <span style={s.imgPathText} title={newAddon.img}>{newAddon.img.split('/').pop()}</span>
                          )}
                          {localPreviews['new'] && (
                            <span style={{ ...s.imgPathText, color: '#ffb74d' }}>Uploading…</span>
                          )}
                        </div>
                        <div style={s.newAddonActions}>
                          <button onClick={addExtraAddon} style={s.confirmAddBtn}>Add</button>
                          <button
                            onClick={() => { setAddingAddon(false); setNewAddon({ name: '', price: '', desc: '', img: '', emoji: '' }) }}
                            style={s.cancelBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {extraAddons.length >= MAX_EXTRA_ADDONS && (
                  <div style={s.limitReached}>
                    ✓ Maximum of {MAX_EXTRA_ADDONS} extra add-ons reached. Remove one to add another.
                  </div>
                )}
              </div>

              {/* Summary */}
              <div style={s.addonSummary}>
                <div style={s.summaryRow}>
                  <span>Total add-ons</span>
                  <strong>{activePkg.addons.length}</strong>
                </div>
                <div style={s.summaryRow}>
                  <span>Default add-ons</span>
                  <span>{builtinAddons.length}</span>
                </div>
                <div style={s.summaryRow}>
                  <span>Extra add-ons</span>
                  <span style={{ color: extraAddons.length >= MAX_EXTRA_ADDONS ? '#e57373' : 'var(--text-secondary)' }}>
                    {extraAddons.length} / {MAX_EXTRA_ADDONS}
                  </span>
                </div>
              </div>
            </section>
          </div>
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

/* ── Styles ── */
const s = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4, maxWidth: 520 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 },
  unsavedBadge: { fontSize: 12, color: '#ffb74d', fontWeight: 600 },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 20px', fontSize: 13, fontWeight: 700, transition: 'opacity 0.2s' },
  liveBanner: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(67,160,71,0.08)', border: '1px solid rgba(67,160,71,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#81c784', marginBottom: 20 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#43a047', flexShrink: 0, boxShadow: '0 0 6px #43a047' },
  tabs: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 },
  tab: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', cursor: 'pointer', position: 'relative' },
  activeTab: { color: 'var(--accent)', background: 'var(--accent-dim)', borderColor: 'var(--accent)' },
  tabTitle: { fontWeight: 700, fontSize: 14 },
  tabPrice: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  popularBadge: { position: 'absolute', top: 8, right: 8, background: 'var(--accent)', color: 'var(--bg-1)', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 },
  columns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 700 },
  subTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  fieldStack: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 },
  hint: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '9px 11px', fontSize: 13, outline: 'none' },
  calendarBox: { display: 'flex', alignItems: 'center', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 11px', minHeight: 44 },
  calendarInput: { flex: 1, minWidth: 0, background: 'transparent', border: 0, color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', colorScheme: 'dark', cursor: 'pointer' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  checkbox: { width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' },
  toggleLabel: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 },
  itemList: { display: 'flex', flexDirection: 'column', gap: 8 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 8 },
  itemMain: { display: 'flex', gap: 6, flex: 1 },
  addonHeader: { marginBottom: 16 },
  addonGroupLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addonCount: { fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 10 },
  addonRow: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' },
  addonIcon: { width: 28, height: 28, borderRadius: 6, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  addonDetails: { display: 'flex', gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' },
  addonPriceRow: { display: 'flex', alignItems: 'center', gap: 4 },
  addonRs: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 },
  removeBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, flexShrink: 0 },
  emptySlots: { fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-3)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', textAlign: 'center', marginBottom: 10 },
  addAddonBtn: { background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%', textAlign: 'center' },
  newAddonForm: { background: 'var(--bg-3)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 },
  newAddonTitle: { fontSize: 12, fontWeight: 700, color: 'var(--accent)' },
  newAddonFields: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  newAddonActions: { display: 'flex', gap: 8 },
  confirmAddBtn: { background: 'var(--accent)', border: 'none', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  limitReached: { fontSize: 12, color: '#81c784', background: 'rgba(67,160,71,0.08)', border: '1px solid rgba(67,160,71,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginTop: 10 },
  addonSummary: { marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' },
  statusBar: { marginTop: 20, padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13 },
  statusOk: { background: 'rgba(67,160,71,0.12)', color: '#81c784', border: '1px solid rgba(67,160,71,0.3)' },
  statusErr: { background: 'rgba(229,115,115,0.12)', color: '#e57373', border: '1px solid rgba(229,115,115,0.3)' },
  statusWarn: { background: 'rgba(255,183,77,0.1)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.25)' },
  uploadLabel: { display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg-3)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  uploadingText: { display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 12, fontWeight: 600 },
  imgPathText: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, flexShrink: 1 },
}
