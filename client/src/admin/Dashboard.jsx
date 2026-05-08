import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import Card from '../components/Card'
import { StatusBadge, PaymentBadge } from '../components/Badges'
import { bookings as initialBookings } from '../data/bookings'
import "../admin.css";
const TODAY = new Date().toISOString().split('T')[0]

export default function Dashboard() {
  const stats = useMemo(() => {
    const total = initialBookings.length
    const todayCount = initialBookings.filter(b => b.date === TODAY).length
    const revenue = initialBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.amount, 0)
    const pending = initialBookings.filter(b => b.status === 'pending').length
    return { total, todayCount, revenue, pending }
  }, [])

  const recent = initialBookings.slice(0, 5)

  return (
    <AdminLayout>
      <div className="fade-up">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <Link to="/control-panel-7x92/bookings" className="btn-secondary">
            View all bookings →
          </Link>
        </div>

        {/* Stats grid */}
        <div style={s.statsGrid}>
          <Card
            label="Total Bookings"
            value={stats.total}
            sub="All time"
            accent
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
          />
          <Card
            label="Today's Bookings"
            value={stats.todayCount}
            sub={stats.todayCount === 0 ? 'No events today' : 'Events scheduled'}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
          />
          <Card
            label="Revenue Collected"
            value={`₹${stats.revenue.toLocaleString('en-IN')}`}
            sub="From paid bookings"
            trend="up"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            }
          />
          <Card
            label="Pending Confirmations"
            value={stats.pending}
            sub="Requires action"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
        </div>

        {/* Recent Bookings */}
        <div style={{ marginBottom: 28 }}>
          <div style={s.sectionHeader}>
            <h2 className="section-title">Recent Bookings</h2>
            <Link to="/control-panel-7x92/bookings" style={s.seeAll}>See all</Link>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {['ID', 'Guest', 'Theme', 'Date', 'Status', 'Payment'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span style={s.idCell}>{b.id}</span>
                    </td>
                    <td>
                      <div style={s.guestName}>{b.name}</div>
                      <div style={s.guestPhone}>{b.phone}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.theme}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: 13 }}>
                        {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>{b.slot}</div>
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><PaymentBadge status={b.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two-col bottom section */}
        <div style={s.twoCol}>
          <ThemeBreakdown />
          <UpcomingSlots bookings={initialBookings} />
        </div>
      </div>
    </AdminLayout>
  )
}

/* ── Sub-components ───────────────────────────────────── */

function ThemeBreakdown() {
  const data = [
    { label: 'Romantic Experience',  count: 3, color: '#d94f4f' },
    { label: 'Birthday Celebration', count: 3, color: 'var(--gold)' },
    { label: 'Surprise Experience',  count: 2, color: 'var(--blue)' },
  ]
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={s.panelTitle}>Theme Distribution</div>
      <div style={s.barStack}>
        {data.map(d => (
          <div
            key={d.label}
            style={{ flex: d.count, background: d.color, borderRadius: 4, height: 8, opacity: 0.75 }}
            title={d.label}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 16 }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ ...s.themeRow, borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              {d.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {total}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpcomingSlots({ bookings }) {
  const upcoming = bookings
    .filter(b => b.date >= TODAY && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4)

  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={s.panelTitle}>Upcoming Events</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {upcoming.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming events.</p>
        )}
        {upcoming.map((b, i) => (
          <div key={b.id} style={{ ...s.upcomingRow, borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={s.upcomingDate}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)', lineHeight: 1 }}>
                {new Date(b.date).getDate()}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, marginTop: 2 }}>
                {new Date(b.date).toLocaleDateString('en-IN', { month: 'short' })}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{b.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{b.theme} · {b.slot}</div>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Styles ───────────────────────────────────────────── */
const s = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 16,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  pageDate: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  viewAllBtn: {
    background: 'transparent',
    border: '1.5px solid var(--purple-border)',
    color: 'var(--purple)',
    borderRadius: 'var(--radius)',
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    transition: 'all 0.18s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
    marginBottom: 32,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 12.5,
    color: 'var(--purple)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  idCell: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'var(--text-muted)',
    background: 'var(--bg-muted)',
    padding: '2px 8px',
    borderRadius: 4,
  },
  guestName: {
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: 13.5,
  },
  guestPhone: {
    color: 'var(--text-muted)',
    fontSize: 12,
    marginTop: 1,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
  },
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 24px',
    boxShadow: 'var(--shadow-sm)',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 16,
    letterSpacing: '-0.01em',
  },
  barStack: {
    display: 'flex',
    gap: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  themeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
  },
  upcomingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '11px 0',
  },
  upcomingDate: {
    width: 42,
    height: 42,
    background: 'var(--bg-muted)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}
