import { useState, useMemo, Fragment } from 'react'
import Sidebar from '../components/Sidebar'
import { StatusBadge, PaymentBadge } from '../components/Badges'
import { bookings as initial } from '../data/bookings'

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function Bookings() {
  const [bookings, setBookings] = useState(initial)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter
      const matchDate = !dateFilter || b.date === dateFilter
      const q = search.toLowerCase()
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.id.toLowerCase().includes(q) || b.theme.toLowerCase().includes(q)
      return matchStatus && matchDate && matchSearch
    })
  }, [bookings, statusFilter, dateFilter, search])

  function updateStatus(id, newStatus) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
  }

  function clearFilters() {
    setStatusFilter('all')
    setDateFilter('')
    setSearch('')
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
            {filtered.length === 0 ? (
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
                          <div style={styles.dateVal}>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
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