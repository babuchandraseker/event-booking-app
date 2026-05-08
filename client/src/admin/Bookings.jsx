import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import "../admin.css";
/* ── Status config ──────────────────────────────────── */
const STATUS_CONFIG = {
  advance_paid: {
    label: 'Advance Paid',
    color: 'var(--gold)',
    bg: 'var(--gold-dim)',
    border: 'var(--gold-border)',
  },
  refunded: {
    label: 'Refunded',
    color: 'var(--red)',
    bg: 'var(--red-dim)',
    border: 'rgba(217,79,79,0.3)',
  },
  pending: {
    label: 'Pending',
    color: 'var(--text-muted)',
    bg: 'var(--bg-muted)',
    border: 'var(--border)',
  },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`badge badge-${status || 'pending'}`}>
      {cfg.label}
    </span>
  )
}

/* ── Filter label map ───────────────────────────────── */
const FILTER_LABELS = {
  all:          'All',
  pending:      'Pending',
  advance_paid: 'Advance Paid',
  refunded:     'Refunded',
}

/* ── Initial data ───────────────────────────────────── */
const INITIAL = [
  { id: 1, name: 'Arjun Kumar',  date: '2025-06-10', time: '10:00 AM', service: 'Consultation', status: 'pending' },
  { id: 2, name: 'Priya Nair',   date: '2025-06-11', time: '2:00 PM',  service: 'Workshop',     status: 'advance_paid' },
  { id: 3, name: 'Rahul Sharma', date: '2025-06-12', time: '4:00 PM',  service: 'Consultation', status: 'refunded' },
]

export default function Bookings() {
  const [bookings, setBookings] = useState(INITIAL)
  const [filter, setFilter]   = useState('all')

  const changeStatus = (id, status) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  return (
    <AdminLayout>
      <div className="fade-up">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">Manage all customer reservations</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`filter-tab${filter === key ? ' active' : ''}`}
            >
              {label}
              <span className="filter-tab-count">
                {key === 'all'
                  ? bookings.length
                  : bookings.filter(b => b.status === key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {['Name', 'Date', 'Time', 'Service', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => (
                <tr key={booking.id}>
                  {/* Name + avatar */}
                  <td>
                    <div style={s.nameCell}>
                      <div style={s.avatar}>{booking.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{booking.name}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td>
                    <span style={s.datePill}>{booking.date}</span>
                  </td>

                  {/* Time */}
                  <td>
                    <span style={{ color: 'var(--purple)', fontWeight: 500 }}>{booking.time}</span>
                  </td>

                  {/* Service */}
                  <td>{booking.service}</td>

                  {/* Status badge */}
                  <td><StatusBadge status={booking.status} /></td>

                  {/* Actions */}
                  <td>
                    <div style={s.actionRow}>
                      {booking.status !== 'advance_paid' && (
                        <button
                          onClick={() => changeStatus(booking.id, 'advance_paid')}
                          className="btn-primary"
                          style={{ padding: '5px 11px', fontSize: 12 }}
                        >
                          ✓ Mark Paid
                        </button>
                      )}
                      {booking.status !== 'refunded' && (
                        <button
                          onClick={() => changeStatus(booking.id, 'refunded')}
                          className="btn-danger"
                          style={{ padding: '5px 11px', fontSize: 12 }}
                        >
                          ↩ Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

const s = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
    background: 'var(--purple-dim)',
    border: '1.5px solid var(--purple-border)',
    color: 'var(--purple)',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePill: {
    background: 'var(--bg-muted)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '3px 9px',
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontFamily: 'monospace',
  },
  actionRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
}
