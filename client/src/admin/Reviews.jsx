import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../data/packageCatalog'

const emptyForm = {
  customerName: '',
  eventType: '',
  rating: 5,
  message: '',
  active: true,
  imageDataUrl: '',
}

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '')

function resolveImageUrl(url) {
  if (!url) return ''
  return url.startsWith('/uploads/') ? `${API_ORIGIN}${url}` : url
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${API_BASE_URL}/reviews?all=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json()
    if (result.success) setReviews(result.data)
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setStatus('Image must be 4MB or smaller.')
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    updateField('imageDataUrl', dataUrl)
  }

  async function saveReview() {
    setIsSaving(true)
    setStatus('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not save review.')
      }

      setForm(emptyForm)
      setStatus('Review added. Moments Remembered will show it on the frontend.')
      await loadReviews()
    } catch (err) {
      setStatus(err.message || 'Could not save review.')
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleReview(review) {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${API_BASE_URL}/reviews/${review.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: review.active === false }),
    })

    if (response.ok) await loadReviews()
  }

  async function deleteReview(id) {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) await loadReviews()
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Customer Reviews</h1>
            <p style={styles.pageSub}>Upload customer photos from gallery and publish them in Moments Remembered.</p>
          </div>
          <button onClick={saveReview} disabled={isSaving} style={styles.saveBtn}>
            {isSaving ? 'Saving...' : 'Add Review'}
          </button>
        </div>

        <div style={styles.grid}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>New Review</h2>
            <label style={styles.field}>
              Customer photo
              <input style={styles.fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
            </label>
            {form.imageDataUrl && <img src={form.imageDataUrl} alt="Preview" style={styles.preview} />}

            <label style={styles.field}>
              Customer name
              <input style={styles.input} value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} placeholder="Priya & Arjun" />
            </label>
            <label style={styles.field}>
              Event type
              <input style={styles.input} value={form.eventType} onChange={(e) => updateField('eventType', e.target.value)} placeholder="Anniversary - Romantic Theme" />
            </label>
            <label style={styles.field}>
              Rating
              <select style={styles.input} value={form.rating} onChange={(e) => updateField('rating', Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
            </label>
            <label style={styles.field}>
              Review message
              <textarea style={styles.textarea} value={form.message} onChange={(e) => updateField('message', e.target.value)} placeholder="Write the customer review..." />
            </label>
            <label style={styles.checkbox}>
              <input type="checkbox" checked={form.active} onChange={(e) => updateField('active', e.target.checked)} />
              Show on frontend
            </label>
          </section>

          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Saved Reviews</h2>
            <div style={styles.list}>
              {reviews.length === 0 && <p style={styles.empty}>No reviews yet.</p>}
              {reviews.map((review) => (
                <div key={review.id} style={styles.reviewRow}>
                  <img src={resolveImageUrl(review.imageUrl)} alt={review.customerName} style={styles.avatar} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.reviewName}>{review.customerName}</div>
                    <div style={styles.reviewMeta}>{'★'.repeat(Number(review.rating || 5))} · {review.eventType}</div>
                    <div style={styles.reviewMessage}>{review.message}</div>
                  </div>
                  <button onClick={() => toggleReview(review)} style={styles.smallBtn}>
                    {review.active === false ? 'Show' : 'Hide'}
                  </button>
                  <button onClick={() => deleteReview(review.id)} style={styles.dangerBtn}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {status && <p style={styles.status}>{status}</p>}
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) minmax(420px, 1fr)', gap: 16, alignItems: 'start' },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 14 },
  field: { display: 'grid', gap: 6, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 12 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13 },
  fileInput: { color: 'var(--text-secondary)', fontSize: 13 },
  textarea: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: 12, minHeight: 120, resize: 'vertical' },
  preview: { width: 96, height: 96, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 14 },
  checkbox: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 },
  list: { display: 'grid', gap: 10 },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
  reviewRow: { display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12, background: 'var(--bg-3)' },
  avatar: { width: 52, height: 52, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-4)' },
  reviewName: { color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 },
  reviewMeta: { color: 'var(--accent)', fontSize: 12, marginTop: 2 },
  reviewMessage: { color: 'var(--text-muted)', fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  smallBtn: { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', cursor: 'pointer' },
  dangerBtn: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', cursor: 'pointer' },
  status: { color: 'var(--accent)', fontSize: 13, marginTop: 14 },
}
