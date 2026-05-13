import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL, DEFAULT_PACKAGES, fetchPackages, formatMoney } from '../data/packageCatalog'

function itemsToText(items = []) {
  return items
    .map((item) => [item.name, item.price || '', item.free ? 'free' : '', item.note || ''].join(' | '))
    .join('\n')
}

function textToItems(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes('|')
        ? line.split('|').map((part) => part.trim())
        : line.trim().split(/\s+/)
      const [name, price, free, note] = line.includes('|')
        ? parts
        : [parts.slice(0, -1).join(' '), parts.at(-1), '', '']

      return {
        name,
        ...(price ? { price: Number(price) } : {}),
        ...(free.toLowerCase() === 'free' ? { free: true } : {}),
        ...(note ? { note } : {}),
      }
    })
    .filter((item) => item.name)
}

function toForm(pkg) {
  return {
    ...pkg,
    includedText: itemsToText(pkg.included),
    addonsText: itemsToText(pkg.addons),
  }
}

export default function Addons() {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES.map(toForm))
  const [activeId, setActiveId] = useState('basic')
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    fetchPackages()
      .then((data) => {
        if (!ignore) setPackages(data.map(toForm))
      })
      .catch(() => {
        if (!ignore) setStatus('Using local defaults. Start backend to load saved package edits.')
      })

    return () => {
      ignore = true
    }
  }, [])

  const activePackage = packages.find((pkg) => pkg.id === activeId) || packages[0]

  function updateActive(field, value) {
    setPackages((prev) => prev.map((pkg) => (
      pkg.id === activePackage.id ? { ...pkg, [field]: value } : pkg
    )))
  }

  async function savePackage() {
    setIsSaving(true)
    setStatus('')
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 12000)

    const payload = {
      title: activePackage.title,
      price: Number(activePackage.price || 0),
      duration: activePackage.duration,
      maxGuests: Number(activePackage.maxGuests || 1),
      popular: activePackage.popular === true,
      active: true,
      included: textToItems(activePackage.includedText),
      addons: textToItems(activePackage.addonsText),
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_BASE_URL}/packages/${activePackage.id}`, {
        method: 'PATCH',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not save package.')
      }

      setPackages((prev) => prev.map((pkg) => (
        pkg.id === activePackage.id ? toForm(result.data) : pkg
      )))
      setStatus(`${result.data.title} updated. Frontend package cards and booking bill will use this now.`)
    } catch (err) {
      setStatus(err.name === 'AbortError' ? 'Save is taking too long. Check backend terminal/Firebase connection and try again.' : (err.message || 'Could not save package.'))
    } finally {
      window.clearTimeout(timeoutId)
      setIsSaving(false)
    }
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Package Add-ons</h1>
            <p style={styles.pageSub}>Edit what is included and paid add-ons for Basic, Premium, and Luxury.</p>
          </div>
          <button onClick={savePackage} disabled={isSaving} style={styles.saveBtn}>
            {isSaving ? 'Saving...' : 'Save Package'}
          </button>
        </div>

        <div style={styles.tabs}>
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setActiveId(pkg.id)}
              style={{ ...styles.tab, ...(pkg.id === activeId ? styles.activeTab : {}) }}
            >
              {pkg.title}
              <span style={styles.tabPrice}>Rs {formatMoney(pkg.price)}</span>
            </button>
          ))}
        </div>

        {activePackage && (
          <div style={styles.editor}>
            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Package Details</h2>
              <div style={styles.grid}>
                <label style={styles.field}>
                  Name
                  <input style={styles.input} value={activePackage.title} onChange={(e) => updateActive('title', e.target.value)} />
                </label>
                <label style={styles.field}>
                  Price
                  <input style={styles.input} type="number" value={activePackage.price} onChange={(e) => updateActive('price', e.target.value)} />
                </label>
                <label style={styles.field}>
                  Duration
                  <input style={styles.input} value={activePackage.duration} onChange={(e) => updateActive('duration', e.target.value)} />
                </label>
                <label style={styles.field}>
                  Max guests
                  <input style={styles.input} type="number" value={activePackage.maxGuests} onChange={(e) => updateActive('maxGuests', e.target.value)} />
                </label>
              </div>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>What's Included</h2>
              <p style={styles.help}>One item per line: name | amount | free | note</p>
              <textarea style={styles.textarea} value={activePackage.includedText} onChange={(e) => updateActive('includedText', e.target.value)} />
            </section>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Paid Add-ons</h2>
              <p style={styles.help}>One add-on per line: name | amount</p>
              <textarea style={styles.textarea} value={activePackage.addonsText} onChange={(e) => updateActive('addonsText', e.target.value)} />
            </section>
          </div>
        )}

        {status && <p style={styles.status}>{status}</p>}
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  tabs: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 18 },
  tab: { display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', cursor: 'pointer', fontWeight: 700 },
  activeTab: { color: 'var(--accent)', background: 'var(--accent-dim)' },
  tabPrice: { color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 },
  editor: { display: 'grid', gridTemplateColumns: 'minmax(260px, 0.8fr) minmax(320px, 1fr) minmax(320px, 1fr)', gap: 14, alignItems: 'start' },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', marginBottom: 12 },
  grid: { display: 'grid', gap: 12 },
  field: { display: 'grid', gap: 6, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13 },
  textarea: { width: '100%', minHeight: 340, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: 12, fontSize: 13, lineHeight: 1.7, resize: 'vertical' },
  help: { color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 },
  status: { marginTop: 16, color: 'var(--accent)', fontSize: 13 },
}
