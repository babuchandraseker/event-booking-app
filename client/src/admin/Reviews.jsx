import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../data/packageCatalog'

/* ─── helpers ─── */
const token = () => localStorage.getItem('adminToken')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
})

const EMPTY_FORM = {
  customerName: '',
  eventType: '',
  rating: 5,
  message: '',
  active: true,
}

const EVENT_TYPES = [
  'Romantic Surprise',
  'Anniversary Celebration',
  'Surprise Proposal',
  'Birthday Grand Package',
  'Private Birthday',
  'Romantic Anniversary',
  'Surprise Celebration',
  'Anniversary - Velvet Theme',
  'Custom Event',
]

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            padding: '2px 3px',
            color: star <= (hovered || value) ? '#E2C46E' : 'rgba(200,168,75,0.25)',
            transition: 'color 0.15s ease',
          }}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function Toast({ message, type }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      padding: '12px 20px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: 'var(--font-body)',
      color: type === 'error' ? 'var(--red)' : 'var(--text-primary)',
      background: type === 'error' ? 'var(--red-dim)' : 'rgba(14,12,34,0.96)',
      border: `1px solid ${type === 'error' ? 'rgba(248,113,113,0.25)' : 'rgba(200,168,75,0.25)'}`,
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.25s ease',
      maxWidth: 340,
    }}>
      {type !== 'error' && <span style={{ color: 'var(--gold)', marginRight: 8 }}>✦</span>}
      {message}
    </div>
  )
}

/* ─── Edit Modal ─── */
function EditModal({ review, onSave, onClose }) {
  const [form, setForm] = useState({
    customerName: review.customerName || '',
    eventType: review.eventType || '',
    rating: review.rating || 5,
    message: review.message || '',
    active: review.active !== false,
  })
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await onSave(review.id, form)
    setSaving(false)
  }

  return (
    <div style={modal.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal.box}>
        <div style={modal.header}>
          <h3 style={modal.title}>Edit Review</h3>
          <button onClick={onClose} style={modal.closeBtn} aria-label="Close">✕</button>
        </div>

        <div style={modal.body}>
          <label style={f.label}>
            Customer Name
            <input
              style={f.input}
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder="e.g. Arun Kumar"
            />
          </label>

          <label style={f.label}>
            Event Type
            <select style={f.input} value={form.eventType} onChange={(e) => set('eventType', e.target.value)}>
              <option value="">Select event type…</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value={form.eventType}>{!EVENT_TYPES.includes(form.eventType) && form.eventType ? form.eventType : ''}</option>
            </select>
            <input
              style={{ ...f.input, marginTop: 6, fontSize: 12 }}
              value={form.eventType}
              onChange={(e) => set('eventType', e.target.value)}
              placeholder="Or type a custom event type"
            />
          </label>

          <label style={f.label}>
            Star Rating
            <StarPicker value={form.rating} onChange={(v) => set('rating', v)} />
          </label>

          <label style={f.label}>
            Review Text
            <textarea
              style={{ ...f.input, minHeight: 100, resize: 'vertical', lineHeight: 1.55 }}
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Customer's review text…"
            />
          </label>

          <label style={{ ...f.label, flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
              style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Visible on website</span>
          </label>
        </div>

        <div style={modal.footer}>
          <button onClick={onClose} style={btn.ghost}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={btn.primary}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Review Row ─── */
function ReviewRow({ review, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) {
  const stars = '★'.repeat(Math.min(5, review.rating || 5))
  const isHidden = review.active === false

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 12,
      padding: '16px 18px',
      borderRadius: 12,
      border: `1px solid ${isHidden ? 'rgba(80,80,80,0.2)' : 'var(--border)'}`,
      background: isHidden ? 'rgba(10,9,18,0.5)' : 'var(--bg-3)',
      opacity: isHidden ? 0.62 : 1,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ color: '#E2C46E', fontSize: 12, letterSpacing: 2 }}>{stars}</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isHidden ? 'var(--text-muted)' : 'var(--gold)',
            padding: '2px 8px',
            borderRadius: 99,
            border: `1px solid ${isHidden ? 'rgba(120,120,120,0.2)' : 'rgba(200,168,75,0.2)'}`,
            background: isHidden ? 'transparent' : 'var(--accent-dim)',
          }}>
            {review.eventType}
          </span>
          {isHidden && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>hidden</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, fontStyle: 'italic' }}>
          "{review.message?.slice(0, 90)}{(review.message?.length || 0) > 90 ? '…' : ''}"
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          — {review.customerName}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
        {/* Reorder buttons */}
        <div style={{ display: 'flex', gap: 3 }}>
          <button onClick={onMoveUp} disabled={isFirst} style={{ ...btn.icon, opacity: isFirst ? 0.3 : 1 }} title="Move up">↑</button>
          <button onClick={onMoveDown} disabled={isLast} style={{ ...btn.icon, opacity: isLast ? 0.3 : 1 }} title="Move down">↓</button>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={onEdit} style={btn.ghost} title="Edit review">Edit</button>
          <button onClick={onToggle} style={btn.ghost} title={isHidden ? 'Show review' : 'Hide review'}>
            {isHidden ? 'Show' : 'Hide'}
          </button>
          <button onClick={onDelete} style={btn.danger} title="Delete review">Delete</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingReview, setEditingReview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'add'

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3200)
  }

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews?all=true`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const result = await res.json()
      if (result.success) {
        const sorted = [...(result.data || [])].sort((a, b) => {
          const orderA = a.order ?? Infinity
          const orderB = b.order ?? Infinity
          if (orderA !== orderB) return orderA - orderB
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        })
        setReviews(sorted)
      }
    } catch {
      showToast('Failed to load reviews.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(loadReviews)
  }, [loadReviews])

  function setField(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleAdd() {
    if (!form.customerName.trim() || !form.message.trim()) {
      showToast('Customer name and review text are required.', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          customerName: form.customerName,
          eventType: form.eventType || 'Event',
          rating: form.rating,
          message: form.message,
          active: form.active,
          order: reviews.length,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to add.')
      setForm(EMPTY_FORM)
      await loadReviews()
      setActiveTab('list')
      showToast('Review added successfully.')
    } catch (e) {
      showToast(e.message || 'Could not save review.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update.')
      await loadReviews()
      setEditingReview(null)
      showToast('Review updated.')
    } catch (e) {
      showToast(e.message || 'Could not update review.', 'error')
    }
  }

  async function handleToggle(review) {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${review.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ active: review.active === false }),
      })
      if (!res.ok) throw new Error('Failed to toggle.')
      await loadReviews()
      showToast(review.active === false ? 'Review is now visible.' : 'Review hidden from website.')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this review? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (!res.ok) throw new Error('Failed to delete.')
      await loadReviews()
      showToast('Review deleted.')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleMove(index, direction) {
    const newReviews = [...reviews]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newReviews.length) return

    // Swap
    ;[newReviews[index], newReviews[targetIndex]] = [newReviews[targetIndex], newReviews[index]]

    // Optimistic update
    setReviews(newReviews)

    // Persist order for both affected reviews
    try {
      await Promise.all([
        fetch(`${API_BASE_URL}/reviews/${newReviews[index].id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ order: index }),
        }),
        fetch(`${API_BASE_URL}/reviews/${newReviews[targetIndex].id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ order: targetIndex }),
        }),
      ])
    } catch {
      // Revert on failure
      await loadReviews()
      showToast('Could not save order.', 'error')
    }
  }

  const visible = reviews.filter((r) => r.active !== false)
  const hidden = reviews.filter((r) => r.active === false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '28px 32px', minWidth: 0, overflowX: 'hidden' }}>
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Reviews
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 5 }}>
              Manage testimonials shown in the "Memories That Became Magic" carousel
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab(activeTab === 'add' ? 'list' : 'add')}
              style={activeTab === 'add' ? btn.ghostActive : btn.primary}
            >
              {activeTab === 'add' ? '← Back to List' : '+ Add Review'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total Reviews', value: reviews.length },
            { label: 'Visible', value: visible.length },
            { label: 'Hidden', value: hidden.length },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: '14px 18px',
              borderRadius: 12,
              border: 'var(--border) 1px solid',
              background: 'var(--bg-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add Review Tab */}
        {activeTab === 'add' && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, maxWidth: 560, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>
              New Review
            </h2>

            <label style={f.label}>
              Customer Name *
              <input
                style={f.input}
                value={form.customerName}
                onChange={(e) => setField('customerName', e.target.value)}
                placeholder="e.g. Arun Kumar"
              />
            </label>

            <label style={f.label}>
              Event Type
              <select style={f.input} value={form.eventType} onChange={(e) => setField('eventType', e.target.value)}>
                <option value="">Select or type below…</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                style={{ ...f.input, marginTop: 6, fontSize: 12 }}
                value={form.eventType}
                onChange={(e) => setField('eventType', e.target.value)}
                placeholder="Or type a custom event type"
              />
            </label>

            <label style={f.label}>
              Star Rating
              <StarPicker value={form.rating} onChange={(v) => setField('rating', v)} />
            </label>

            <label style={f.label}>
              Review Text *
              <textarea
                style={{ ...f.input, minHeight: 110, resize: 'vertical', lineHeight: 1.6 }}
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                placeholder="Write the customer's review…"
              />
            </label>

            <label style={{ ...f.label, flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
                style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Show on website immediately</span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setActiveTab('list')} style={btn.ghost}>Cancel</button>
              <button onClick={handleAdd} disabled={saving} style={btn.primary}>
                {saving ? 'Adding…' : 'Add Review'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {activeTab === 'list' && (
          <div>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Loading reviews…
              </div>
            ) : reviews.length === 0 ? (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                border: '1px dashed rgba(200,168,75,0.18)',
                borderRadius: 16,
                color: 'var(--text-muted)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>✦</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  No reviews yet
                </div>
                <div style={{ fontSize: 13 }}>Click "Add Review" to create your first testimonial.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {/* Visible reviews */}
                {visible.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 2 }}>
                      Visible on website ({visible.length})
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {reviews.map((review, index) =>
                        review.active === false ? null : (
                          <ReviewRow
                            key={review.id}
                            review={review}
                            onEdit={() => setEditingReview(review)}
                            onDelete={() => handleDelete(review.id)}
                            onToggle={() => handleToggle(review)}
                            onMoveUp={() => handleMove(index, -1)}
                            onMoveDown={() => handleMove(index, 1)}
                            isFirst={index === 0}
                            isLast={index === reviews.length - 1}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden reviews */}
                {hidden.length > 0 && (
                  <div style={{ marginTop: visible.length > 0 ? 20 : 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 2 }}>
                      Hidden ({hidden.length})
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {reviews.map((review, index) =>
                        review.active !== false ? null : (
                          <ReviewRow
                            key={review.id}
                            review={review}
                            onEdit={() => setEditingReview(review)}
                            onDelete={() => handleDelete(review.id)}
                            onToggle={() => handleToggle(review)}
                            onMoveUp={() => handleMove(index, -1)}
                            onMoveDown={() => handleMove(index, 1)}
                            isFirst={index === 0}
                            isLast={index === reviews.length - 1}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingReview && (
        <EditModal
          review={editingReview}
          onSave={handleEdit}
          onClose={() => setEditingReview(null)}
        />
      )}

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} />
    </div>
  )
}

/* ─── Shared style tokens ─── */
const f = {
  label: {
    display: 'grid',
    gap: 6,
    fontSize: 11.5,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  input: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '10px 12px',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s ease',
  },
}

const btn = {
  primary: {
    background: 'var(--accent)',
    color: '#0A0812',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'opacity 0.2s ease',
    whiteSpace: 'nowrap',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: 12.5,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  ghostActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    border: '1px solid rgba(200,168,75,0.25)',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  danger: {
    background: 'var(--red-dim)',
    color: 'var(--red)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 8,
    padding: '9px 14px',
    fontSize: 12.5,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  icon: {
    background: 'var(--bg-3)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    lineHeight: 1,
    transition: 'all 0.15s ease',
  },
}

const modal = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    animation: 'fadeIn 0.2s ease',
  },
  box: {
    background: 'var(--bg-2)',
    border: '1px solid rgba(200,168,75,0.2)',
    borderRadius: 18,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 32px 90px rgba(0,0,0,0.7)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 0',
    marginBottom: 0,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
  },
  body: {
    padding: '20px 24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '0 24px 20px',
    borderTop: '1px solid var(--border)',
    paddingTop: 16,
    marginTop: 4,
  },
}
