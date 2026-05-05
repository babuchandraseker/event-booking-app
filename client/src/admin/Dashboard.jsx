import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import { StatusBadge, PaymentBadge } from '../components/Badges'
import { bookings as initialBookings } from '../data/bookings'

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
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div className="fade-up">
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Dashboard</h1>
              <p style={styles.pageDate}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link to="/control-panel-7x92/bookings" style={styles.newBtn}>
              View all bookings →
            </Link>
          </div>

          {/* Stats grid */}
          <div style={styles.statsGrid}>
            <Card
              label="Total Bookings"
              value={stats.total}
              sub="All time"
              accent
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
            <Card
              label="Today's Bookings"
              value={stats.todayCount}
              sub={stats.todayCount === 0 ? 'No events today' : 'Events scheduled'}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            />
            <Card
              label="Revenue Collected"
              value={`₹${stats.revenue.toLocaleString('en-IN')}`}
              sub="From paid bookings"
              trend="up"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            />
            <Card
              label="Pending Confirmations"
              value={stats.pending}
              sub="Requires action"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            />
          </div>

          {/* Divider */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Bookings</h2>
              <Link to="/control-panel-7x92/bookings" style={styles.seeAll}>See all</Link>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['ID', 'Guest', 'Theme', 'Date', 'Status', 'Payment'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b, i) => (
                    <tr key={b.id} style={{ ...styles.tr, animationDelay: `${i * 50}ms` }}>
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
                        <div style={styles.dateCell}>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        <div style={styles.slotCell}>{b.slot}</div>
                      </td>
                      <td style={styles.td}><StatusBadge status={b.status} /></td>
                      <td style={styles.td}><PaymentBadge status={b.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theme breakdown */}
          <div style={styles.twoCol}>
            <ThemeBreakdown />
            <UpcomingSlots bookings={initialBookings} />
          </div>
        </div>
      </main>
    </div>
  )
}

function ThemeBreakdown() {
  const data = [
    { label: 'Romantic Experience', count: 3, color: 'var(--red)' },
    { label: 'Birthday Celebration', count: 3, color: 'var(--amber)' },
    { label: 'Surprise Experience', count: 2, color: 'var(--blue)' },
  ]
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Theme Distribution</div>
      <div style={styles.barStack}>
        {data.map(d => (
          <div key={d.label} style={{ flex: d.count, background: d.color, borderRadius: 4, height: 6, opacity: 0.8 }} title={d.label} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {data.map(d => (
          <div key={d.label} style={styles.themeRow}>
            <div style={{ ...styles.themeDot, background: d.color }} />
            <span style={styles.themeRowLabel}>{d.label}</span>
            <span style={styles.themeRowCount}>{d.count} <span style={{ color: 'var(--text-muted)' }}>/ {total}</span></span>
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
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Upcoming Events</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {upcoming.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming events.</p>
        )}
        {upcoming.map(b => (
          <div key={b.id} style={styles.upcomingRow}>
            <div style={styles.upcomingDate}>
              <div style={styles.upcomingDay}>{new Date(b.date).getDate()}</div>
              <div style={styles.upcomingMonth}>{new Date(b.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.upcomingName}>{b.name}</div>
              <div style={styles.upcomingTheme}>{b.theme} · {b.slot}</div>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
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
    overflowX: 'hidden',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
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
  pageDate: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginTop: 4,
  },
  newBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 18px',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  seeAll: {
    fontSize: 12.5,
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  tableWrap: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
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
    transition: 'background 0.1s ease',
  },
  td: {
    padding: '13px 16px',
    verticalAlign: 'middle',
    fontSize: 13.5,
  },
  idCell: {
    fontFamily: 'monospace',
    fontSize: 12,
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
    marginTop: 1,
  },
  themeCell: {
    color: 'var(--text-secondary)',
    fontSize: 13,
  },
  dateCell: {
    color: 'var(--text-primary)',
    fontWeight: 500,
    fontSize: 13,
  },
  slotCell: {
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
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 24px',
  },
  panelTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
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
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  themeRowLabel: {
    flex: 1,
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  themeRowCount: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  upcomingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  upcomingDate: {
    width: 40,
    height: 40,
    background: 'var(--bg-4)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  upcomingDay: {
    fontFamily: 'var(--font-display)',
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--accent)',
    lineHeight: 1,
  },
  upcomingMonth: {
    fontSize: 9,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1,
    marginTop: 2,
  },
  upcomingName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  upcomingTheme: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 1,
  },
}
