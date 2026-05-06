import { useState, useMemo, Fragment, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { StatusBadge, PaymentBadge } from '../components/Badges'

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'local-admin-123'
const PACKAGE_AMOUNTS = {
  signature: 5999,
  romantic: 4999,
  birthday: 6499,
  surprise: 5999,
}

function cellText(value) {
  return Array.isArray(value)
    ? value.join(', ')
    : value === null || value === undefined
      ? ''
      : String(value)
}

function htmlCell(value) {
  return cellText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function downloadExcel(filename, content) {
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function formatPackageName(packageId) {
  if (!packageId) return 'Private event'
  return String(packageId)
    .replaceAll('-', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function normalizeBooking(booking) {
  const packageId = booking.packageId || ''

  return {
    ...booking,
    id: booking.id || '',
    name: booking.name || '',
    phone: booking.phone || '',
    theme: booking.theme || booking.eventType || formatPackageName(packageId),
    date: booking.date || booking.eventDate || '',
    slot: booking.slot || booking.eventTime || '',
    guests: booking.guests ?? booking.guestCount ?? 1,
    amount: booking.amount ?? PACKAGE_AMOUNTS[packageId] ?? 0,
    paymentStatus: booking.paymentStatus === 'not_started' ? 'unpaid' : (booking.paymentStatus || 'unpaid'),
    status: booking.status || 'pending',
    addons: Array.isArray(booking.addons) ? booking.addons : [],
    notes: booking.notes || '',
  }
}

function buildLocalBookingsExcel(bookings) {
  const headers = [
    'Booking ID',
    'Name',
    'Phone',
    'Theme',
    'Date',
    'Slot',
    'Guests',
    'Amount',
    'Payment Status',
    'Status',
    'Add-ons',
    'Notes',
  ]

  const rows = bookings.map(b => [b.id, b.name, b.phone, b.theme, b.date, b.slot, b.guests, b.amount, b.paymentStatus, b.status, b.addons, b.notes])
  const headerHtml = headers.map(h => `<th>${htmlCell(h)}</th>`).join('')
  const rowsHtml = rows
    .map(row => `<tr>${row.map(value => `<td class="text">${htmlCell(value)}</td>`).join('')}</tr>`)
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
    th { background: #f2f2f2; font-weight: 700; }
    th, td { border: 1px solid #d9d9d9; padding: 6px 8px; mso-number-format: "\\@"; white-space: nowrap; }
    .text { mso-number-format: "\\@"; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadBookings() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
          headers: {
            'x-admin-api-key': ADMIN_API_KEY,
          },
        })
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not load bookings.')
        }

        if (!ignore) {
          setBookings(result.data.map(normalizeBooking))
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Could not load bookings.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter
      const matchDate = !dateFilter || b.date === dateFilter
      const q = search.toLowerCase()
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.id.toLowerCase().includes(q) || b.theme.toLowerCase().includes(q)
      return matchStatus && matchDate && matchSearch
    })
  }, [bookings, statusFilter, dateFilter, search])

  async function updateStatus(id, newStatus) {
    const previous = bookings
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not update booking status.')
      }

      setBookings(prev => prev.map(b => b.id === id ? normalizeBooking(result.data) : b))
    } catch (err) {
      setBookings(previous)
      alert(err.message || 'Could not update booking status.')
    }
  }

  function clearFilters() {
    setStatusFilter('all')
    setDateFilter('')
    setSearch('')
  }

  async function exportExcel() {
    const filename = `bookings-${new Date().toISOString().slice(0, 10)}.xls`

    try {
      const response = await fetch(`${API_BASE_URL}/admin/bookings/export`, {
        headers: {
          'x-admin-api-key': ADMIN_API_KEY,
        },
      })

      if (response.ok) {
        const excel = await response.text()
        downloadExcel(filename, excel)
        return
      }
    } catch {
      // Fall back to the bookings already loaded in the admin table.
    }

    downloadExcel(filename, buildLocalBookingsExcel(filtered))
  }

  const hasFilters = statusFilter !== 'all' || dateFilter || search

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div className="fade-up">
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Bookings</h1>
              <p style={styles.pageSub}>{filtered.length} of {bookings.length} bookings</p>
            </div>
            <button onClick={exportExcel} style={styles.exportBtn}>
              Export Excel
            </button>
          </div>

          {/* Filters bar */}
          <div style={styles.filtersBar}>
            {/* Search */}
            <div style={styles.searchWrap}>
              <svg style={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search name, phone, ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Status tabs */}
            <div style={styles.statusTabs}>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    ...styles.tabBtn,
                    ...(statusFilter === s ? styles.tabBtnActive : {}),
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={styles.dateInput}
            />

            {hasFilters && (
              <button onClick={clearFilters} style={styles.clearBtn}>
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div style={styles.tableWrap}>
            {isLoading ? (
              <div style={styles.empty}>
                <p>Loading bookings...</p>
              </div>
            ) : error ? (
              <div style={styles.empty}>
                <p>{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={styles.empty}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No bookings match your filters.</p>
                <button onClick={clearFilters} style={styles.clearBtn}>Clear filters</button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['ID', 'Guest', 'Theme', 'Date & Slot', 'Guests', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <Fragment key={b.id}>
                      <tr
                        style={styles.tr}
                        onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                      >
                        <td style={styles.td}>
                          <span style={styles.idCell}>{b.id}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.guestName}>{b.name}</div>
                          <div style={styles.guestPhone}>{b.phone}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.themeCell}>{b.theme}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateVal}>{b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                          <div style={styles.slotVal}>{b.slot}</div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                          {b.guests}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                          ₹{b.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={styles.td}><PaymentBadge status={b.paymentStatus} /></td>
                        <td style={styles.td}><StatusBadge status={b.status} /></td>
                        <td style={styles.td} onClick={e => e.stopPropagation()}>
                          <ActionButtons booking={b} onUpdate={updateStatus} />
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expanded === b.id && (
                        <tr key={`${b.id}-detail`} style={styles.expandRow}>
                          <td colSpan={9} style={styles.expandCell}>
                            <div style={styles.expandContent}>
                              <div style={styles.expandItem}>
                                <span style={styles.expandLabel}>Add-ons</span>
                                <span style={styles.expandVal}>
                                  {b.addons.length > 0 ? b.addons.join(', ') : '—'}
                                </span>
                              </div>
                              <div style={styles.expandItem}>
                                <span style={styles.expandLabel}>Notes</span>
                                <span style={styles.expandVal}>{b.notes || '—'}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p style={styles.hint}>↑ Click any row to view add-ons & notes</p>
        </div>
      </main>
    </div>
  )
}

function ActionButtons({ booking, onUpdate }) {
  const { id, status } = booking

  const actions = {
    pending: [
      { label: 'Confirm', next: 'confirmed', color: 'var(--green)', bg: 'var(--green-dim)' },
      { label: 'Cancel',  next: 'cancelled', color: 'var(--red)',   bg: 'var(--red-dim)' },
    ],
    confirmed: [
      { label: 'Complete', next: 'completed', color: 'var(--blue)',  bg: 'var(--blue-dim)' },
      { label: 'Cancel',   next: 'cancelled', color: 'var(--red)',   bg: 'var(--red-dim)' },
    ],
    completed: [],
    cancelled: [
      { label: 'Restore', next: 'pending', color: 'var(--amber)', bg: 'var(--amber-dim)' },
    ],
  }

  const btns = actions[status] || []

  if (btns.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
      {btns.map(({ label, next, color, bg }) => (
        <button
          key={label}
          onClick={() => onUpdate(id, next)}
          style={{
            background: bg,
            color,
            border: `1px solid ${color}22`,
            borderRadius: 'var(--radius-sm)',
            padding: '5px 12px',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    padding: '32px 36px',
    overflowX: 'auto',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  pageSub: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 4,
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 14px 9px 36px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
    width: 220,
    fontFamily: 'var(--font-body)',
  },
  statusTabs: {
    display: 'flex',
    gap: 4,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: 3,
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: 5,
    padding: '5px 12px',
    fontSize: 12,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    background: 'var(--bg-4)',
    color: 'var(--text-primary)',
  },
  dateInput: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--text-secondary)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    colorScheme: 'dark',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: 12.5,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  exportBtn: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'var(--bg-1)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 16px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 900,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 10.5,
    color: 'var(--text-muted)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-3)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.1s ease',
  },
  td: {
    padding: '13px 16px',
    verticalAlign: 'middle',
    fontSize: 13.5,
  },
  idCell: {
    fontFamily: 'monospace',
    fontSize: 11.5,
    color: 'var(--text-muted)',
    background: 'var(--bg-4)',
    padding: '2px 8px',
    borderRadius: 4,
  },
  guestName: {
    color: 'var(--text-primary)',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  guestPhone: {
    color: 'var(--text-muted)',
    fontSize: 12,
    marginTop: 2,
  },
  themeCell: {
    color: 'var(--text-secondary)',
    fontSize: 13,
  },
  dateVal: {
    color: 'var(--text-primary)',
    fontWeight: 500,
    fontSize: 13,
  },
  slotVal: {
    color: 'var(--text-muted)',
    fontSize: 12,
    marginTop: 2,
  },
  expandRow: {
    background: 'var(--bg-3)',
    borderBottom: '1px solid var(--border)',
  },
  expandCell: {
    padding: '12px 20px',
  },
  expandContent: {
    display: 'flex',
    gap: 32,
    flexWrap: 'wrap',
  },
  expandItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  expandLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
    paddingTop: 1,
    whiteSpace: 'nowrap',
  },
  expandVal: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '60px 20px',
    color: 'var(--text-muted)',
    fontSize: 13.5,
  },
  hint: {
    marginTop: 10,
    fontSize: 11.5,
    color: 'var(--text-muted)',
    textAlign: 'right',
    padding: '0 4px',
  },
}
