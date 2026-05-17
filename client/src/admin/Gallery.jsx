import { useState, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import { useGallery } from '../hooks/useGallery'

const CATEGORIES = ['Romantic', 'Birthday', 'Luxury Surprise', 'Proposal', 'Anniversary']

const CATEGORY_EMOJI = {
  Romantic: '🌹',
  Birthday: '🎂',
  'Luxury Surprise': '✨',
  Proposal: '💍',
  Anniversary: '🥂',
}

// ─── Sub-components ───────────────────────────────────────────────────────

function GalleryItemRow({ item, index, total, onEdit, onDelete, onToggleVisible, onToggleFeatured, onMoveUp, onMoveDown }) {
  return (
    <div style={rowStyles.row}>
      {/* Drag handle / order */}
      <div style={rowStyles.orderCell}>
        <span style={rowStyles.orderNum}>{index + 1}</span>
        <div style={rowStyles.arrowGroup}>
          <button
            style={{ ...rowStyles.arrowBtn, opacity: index === 0 ? 0.3 : 1 }}
            onClick={onMoveUp}
            disabled={index === 0}
            title="Move up"
          >▲</button>
          <button
            style={{ ...rowStyles.arrowBtn, opacity: index === total - 1 ? 0.3 : 1 }}
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Move down"
          >▼</button>
        </div>
      </div>

      {/* Thumbnail */}
      <div style={rowStyles.thumbCell}>
        {item.src ? (
          <img
            src={item.src}
            alt={item.alt || item.title}
            style={rowStyles.thumb}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={rowStyles.thumbFallback}>
            {CATEGORY_EMOJI[item.category] || '✦'}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={rowStyles.infoCell}>
        <div style={rowStyles.infoTitle}>{item.title || '(No title)'}</div>
        <div style={rowStyles.infoCaption}>{item.caption || <em style={{ opacity: 0.45 }}>No caption</em>}</div>
        <div style={rowStyles.infoMeta}>
          <span style={{ ...rowStyles.catTag, background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
            {CATEGORY_EMOJI[item.category]} {item.category}
          </span>
          {item.addedAt && (
            <span style={rowStyles.metaDate}>
              {new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div style={rowStyles.toggleCell}>
        <label style={rowStyles.toggleLabel}>
          <span style={rowStyles.toggleText}>Featured</span>
          <button
            style={{ ...rowStyles.toggleBtn, background: item.featured ? '#c9a84c' : 'var(--border)' }}
            onClick={onToggleFeatured}
            title={item.featured ? 'Unmark featured' : 'Mark as featured'}
          >
            <span style={{ ...rowStyles.toggleDot, transform: item.featured ? 'translateX(18px)' : 'translateX(0)' }} />
          </button>
        </label>
        <label style={rowStyles.toggleLabel}>
          <span style={rowStyles.toggleText}>Visible</span>
          <button
            style={{ ...rowStyles.toggleBtn, background: item.visible !== false ? '#4ade80' : 'var(--border)' }}
            onClick={onToggleVisible}
            title={item.visible !== false ? 'Hide from gallery' : 'Show in gallery'}
          >
            <span style={{ ...rowStyles.toggleDot, transform: item.visible !== false ? 'translateX(18px)' : 'translateX(0)' }} />
          </button>
        </label>
      </div>

      {/* Actions */}
      <div style={rowStyles.actionCell}>
        <button style={rowStyles.editBtn} onClick={onEdit}>Edit</button>
        <button style={rowStyles.deleteBtn} onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

function ItemModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    src: item?.src || '',
    alt: item?.alt || '',
    title: item?.title || '',
    caption: item?.caption || '',
    category: item?.category || 'Romantic',
    featured: item?.featured ?? false,
    visible: item?.visible ?? true,
    imageDataUrl: '',
  })
  const fileRef = useRef(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      setForm(prev => ({ ...prev, src: dataUrl, imageDataUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!form.title.trim()) { alert('Please add a title.'); return }
    if (!form.category) { alert('Please select a category.'); return }
    onSave(form)
  }

  return (
    <div style={modalStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{item ? 'Edit Gallery Item' : 'Add New Image'}</h3>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalStyles.body}>
          {/* Image preview / upload */}
          <div style={modalStyles.imageSection}>
            <div style={modalStyles.imagePreview}>
              {form.src ? (
                <img src={form.src} alt="Preview" style={modalStyles.previewImg}
                  onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div style={modalStyles.previewPlaceholder}>
                  <span style={{ fontSize: 32, opacity: 0.3 }}>🖼️</span>
                  <span style={{ fontSize: 12, opacity: 0.4, marginTop: 8 }}>No image selected</span>
                </div>
              )}
            </div>
            <div style={modalStyles.imageControls}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button style={modalStyles.uploadBtn} onClick={() => fileRef.current?.click()}>
                📁 Choose Image File
              </button>
              <div style={modalStyles.orDivider}>— or paste URL —</div>
              <input
                style={modalStyles.input}
                type="text"
                placeholder="https://... or /themes/romantic/..."
                value={form.src}
                onChange={e => update('src', e.target.value)}
              />
              <p style={modalStyles.hint}>
                💡 For production: connect Firebase Storage for real file uploads.
              </p>
            </div>
          </div>

          {/* Fields */}
          <div style={modalStyles.fields}>
            <div style={modalStyles.fieldGroup}>
              <label style={modalStyles.label}>Title *</label>
              <input
                style={modalStyles.input}
                type="text"
                placeholder="e.g. A Night of Pure Romance"
                value={form.title}
                onChange={e => update('title', e.target.value)}
              />
            </div>

            <div style={modalStyles.fieldGroup}>
              <label style={modalStyles.label}>Caption</label>
              <input
                style={modalStyles.input}
                type="text"
                placeholder="Short emotional caption"
                value={form.caption}
                onChange={e => update('caption', e.target.value)}
              />
            </div>

            <div style={modalStyles.fieldGroup}>
              <label style={modalStyles.label}>Alt Text</label>
              <input
                style={modalStyles.input}
                type="text"
                placeholder="Describe the image for accessibility"
                value={form.alt}
                onChange={e => update('alt', e.target.value)}
              />
            </div>

            <div style={modalStyles.fieldGroup}>
              <label style={modalStyles.label}>Category *</label>
              <select
                style={modalStyles.select}
                value={form.category}
                onChange={e => update('category', e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                ))}
              </select>
            </div>

            <div style={modalStyles.toggleRow}>
              <label style={modalStyles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => update('featured', e.target.checked)}
                  style={modalStyles.checkbox}
                />
                <span>★ Mark as Featured (shows as large card)</span>
              </label>
              <label style={modalStyles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={e => update('visible', e.target.checked)}
                  style={modalStyles.checkbox}
                />
                <span>👁 Visible in gallery</span>
              </label>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={modalStyles.saveBtn} onClick={handleSubmit}>
            {item ? 'Save Changes' : 'Add to Gallery'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Gallery Admin ───────────────────────────────────────────────────

export default function GalleryAdmin() {
  const {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleVisibility,
    toggleFeatured,
    reorderItems,
    resetToDefaults,
  } = useGallery()

  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', item?: object }
  const [filterCat, setFilterCat] = useState('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  async function handleSave(formData) {
    try {
      if (modal.mode === 'add') {
        await addItem(formData)
        showToast('Image added to gallery ✓')
      } else {
        await updateItem(modal.item.id, formData)
        showToast('Image updated ✓')
      }
      setModal(null)
    } catch (error) {
      showToast(error.message || 'Could not save gallery image')
    }
  }

  async function handleDelete(id) {
    const item = items.find(i => i.id === id)
    if (!confirm(`Delete "${item?.title || 'this image'}"? This cannot be undone.`)) return
    try {
      await deleteItem(id)
      showToast('Image removed from gallery')
    } catch (error) {
      showToast(error.message || 'Could not delete image')
    }
  }

  async function moveItem(index, direction) {
    const sorted = [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    const newIdx = index + direction
    if (newIdx < 0 || newIdx >= sorted.length) return
    const ids = sorted.map(i => i.id)
    const temp = ids[index]
    ids[index] = ids[newIdx]
    ids[newIdx] = temp
    try {
      await reorderItems(ids)
      showToast('Order updated ✓')
    } catch (error) {
      showToast(error.message || 'Could not update order')
    }
  }

  // Filtered + searched view
  const sortedItems = [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  const displayed = sortedItems.filter(item => {
    const matchesCat = filterCat === 'All' || item.category === filterCat
    const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.caption?.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const stats = {
    total: items.length,
    visible: items.filter(i => i.visible !== false).length,
    featured: items.filter(i => i.featured).length,
  }

  return (
    <div style={pageStyles.layout}>
      <Sidebar />

      <main style={pageStyles.main}>
        {/* Header */}
        <div style={pageStyles.pageHeader}>
          <div>
            <h1 style={pageStyles.pageTitle}>Gallery Manager</h1>
            <p style={pageStyles.pageSubtitle}>
              Manage the "Real Celebrations" luxury image gallery.
              Changes reflect on the homepage instantly.
            </p>
          </div>
          <button style={pageStyles.addBtn} onClick={() => setModal({ mode: 'add' })}>
            + Add Image
          </button>
        </div>

        {/* Stats row */}
        <div style={pageStyles.statsRow}>
          {[
            { label: 'Total Images', value: stats.total, icon: '🖼️' },
            { label: 'Visible', value: stats.visible, icon: '👁' },
            { label: 'Featured', value: stats.featured, icon: '★' },
            { label: 'Hidden', value: stats.total - stats.visible, icon: '🚫' },
          ].map(s => (
            <div key={s.label} style={pageStyles.statCard}>
              <span style={pageStyles.statIcon}>{s.icon}</span>
              <span style={pageStyles.statValue}>{s.value}</span>
              <span style={pageStyles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={pageStyles.filterBar}>
          <input
            style={pageStyles.searchInput}
            type="text"
            placeholder="Search by title or caption..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={pageStyles.catFilters}>
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                style={{
                  ...pageStyles.catBtn,
                  ...(filterCat === cat ? pageStyles.catBtnActive : {}),
                }}
                onClick={() => setFilterCat(cat)}
              >
                {cat !== 'All' && CATEGORY_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
          <button style={pageStyles.resetBtn} onClick={() => {
            if (confirm('Reset gallery to default images? All custom items will be lost.')) {
              resetToDefaults()
                .then(() => showToast('Gallery reset to defaults'))
                .catch((error) => showToast(error.message || 'Could not reset gallery'))
            }
          }}>
            Reset Defaults
          </button>
        </div>

        {/* Table */}
        <div style={pageStyles.tableWrap}>
          <div style={pageStyles.tableHeader}>
            <span style={pageStyles.thOrder}>#</span>
            <span style={pageStyles.thThumb}>Image</span>
            <span style={pageStyles.thInfo}>Details</span>
            <span style={pageStyles.thToggles}>Status</span>
            <span style={pageStyles.thActions}>Actions</span>
          </div>

          {loading ? (
            <div style={pageStyles.loading}>Loading gallery…</div>
          ) : displayed.length === 0 ? (
            <div style={pageStyles.empty}>
              <span style={{ fontSize: 32, opacity: 0.3 }}>🖼️</span>
              <p>No images found. {filterCat !== 'All' || search ? 'Try clearing filters.' : 'Add your first image above.'}</p>
            </div>
          ) : (
            displayed.map((item) => {
              // Find real index in sortedItems for move operations
              const realIdx = sortedItems.findIndex(x => x.id === item.id)
              return (
                <GalleryItemRow
                  key={item.id}
                  item={item}
                  index={realIdx}
                  total={sortedItems.length}
                  onEdit={() => setModal({ mode: 'edit', item })}
                  onDelete={() => handleDelete(item.id)}
                  onToggleVisible={() => {
                    toggleVisibility(item.id)
                      .then(() => showToast('Visibility updated'))
                      .catch((error) => showToast(error.message || 'Could not update visibility'))
                  }}
                  onToggleFeatured={() => {
                    toggleFeatured(item.id)
                      .then(() => showToast('Featured status updated'))
                      .catch((error) => showToast(error.message || 'Could not update featured status'))
                  }}
                  onMoveUp={() => moveItem(realIdx, -1)}
                  onMoveDown={() => moveItem(realIdx, 1)}
                />
              )
            })
          )}
        </div>

        {/* Firebase info banner */}
        <div style={pageStyles.firebaseBanner}>
          <strong>🔥 Firebase Ready:</strong> To enable cloud storage & real-time sync, replace{' '}
          <code>localStorage</code> in <code>src/hooks/useGallery.js</code> with Firestore{' '}
          <code>onSnapshot</code> and Firebase Storage for image uploads. All hook-in points are
          commented inline.
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <ItemModal
          item={modal.item}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={pageStyles.toast}>{toast}</div>
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────

const pageStyles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
    fontFamily: 'var(--font-body)',
  },
  main: {
    flex: 1,
    padding: '32px 28px',
    overflowY: 'auto',
    maxWidth: 'calc(100vw - var(--sidebar-width))',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
    margin: '6px 0 0',
    maxWidth: 480,
  },
  addBtn: {
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.02em',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statIcon: { fontSize: 18, lineHeight: 1 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 },
  statLabel: { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchInput: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 13,
    padding: '8px 12px',
    width: 220,
    fontFamily: 'var(--font-body)',
    outline: 'none',
  },
  catFilters: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  catBtn: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 99,
    color: 'var(--text-secondary)',
    fontSize: 12,
    padding: '5px 12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.15s',
  },
  catBtnActive: {
    background: 'rgba(201,168,76,0.15)',
    border: '1px solid rgba(201,168,76,0.5)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  resetBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: 12,
    padding: '7px 12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  tableWrap: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '60px 90px 1fr 130px 120px',
    gap: 0,
    background: 'var(--bg-3)',
    borderBottom: '1px solid var(--border)',
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  thOrder: {},
  thThumb: {},
  thInfo: {},
  thToggles: {},
  thActions: {},
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 14,
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
  },
  firebaseBanner: {
    background: 'rgba(255,165,0,0.06)',
    border: '1px solid rgba(255,165,0,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  toast: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    background: '#1a1a1a',
    border: '1px solid rgba(201,168,76,0.4)',
    color: 'var(--accent)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 20px',
    fontSize: 13,
    fontWeight: 500,
    zIndex: 9999,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.2s ease',
  },
}

const rowStyles = {
  row: {
    display: 'grid',
    gridTemplateColumns: '60px 90px 1fr 130px 120px',
    alignItems: 'center',
    gap: 0,
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
  },
  orderCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  orderNum: {
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 600,
    width: 20,
    textAlign: 'center',
  },
  arrowGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 9,
    padding: '1px 3px',
    lineHeight: 1,
    transition: 'color 0.15s',
  },
  thumbCell: {
    width: 64,
    height: 48,
  },
  thumb: {
    width: 64,
    height: 48,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid var(--border)',
  },
  thumbFallback: {
    width: 64,
    height: 48,
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  infoCell: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    marginBottom: 2,
  },
  infoCaption: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.3,
    marginBottom: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 320,
  },
  infoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  catTag: {
    fontSize: 10.5,
    padding: '2px 8px',
    borderRadius: 99,
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  metaDate: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  toggleCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  toggleText: {
    fontSize: 11,
    color: 'var(--text-muted)',
    width: 52,
  },
  toggleBtn: {
    width: 36,
    height: 18,
    borderRadius: 99,
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.2s',
    display: 'block',
    flexShrink: 0,
  },
  actionCell: {
    display: 'flex',
    gap: 6,
  },
  editBtn: {
    background: 'rgba(201,168,76,0.12)',
    border: '1px solid rgba(201,168,76,0.25)',
    color: 'var(--accent)',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg-2)',
    zIndex: 1,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
  body: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  imageSection: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  imagePreview: {
    width: 160,
    height: 120,
    borderRadius: 8,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    background: 'var(--bg-3)',
    flexShrink: 0,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageControls: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 200,
  },
  uploadBtn: {
    background: 'var(--bg-3)',
    border: '1px dashed var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 16px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    textAlign: 'left',
  },
  orDivider: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
  hint: {
    fontSize: 11,
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.5,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 13.5,
    padding: '9px 12px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 13.5,
    padding: '9px 12px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  toggleRow: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: '#c9a84c',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    position: 'sticky',
    bottom: 0,
    background: 'var(--bg-2)',
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 18px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  saveBtn: {
    background: 'var(--accent)',
    border: 'none',
    color: '#000',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
}
