import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import { StatusBadge, PaymentBadge } from '../components/Badges'
import { API_BASE_URL } from '../config/api.js'

const TODAY = new Date().toISOString().split('T')[0]
const ADMIN_BASE = '/control-panel-7x9'
const PACKAGE_AMOUNTS = {
  signature: 5999,
  romantic: 4999,
  birthday: 6499,
  surprise: 5999,
  basic: 4999,
  premium: 6999,
  luxury: 9999,
}

const DAILY_SLOT_CAPACITY = 12

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
    packageName: booking.packageTitle || booking.package || formatPackageName(packageId),
    date: booking.date || booking.eventDate || '',
    slot: booking.slot || booking.eventTime || '',
    extraTime: booking.extraTime || booking.extraTimeMinutes || booking.extension || '',
    guests: booking.guests ?? booking.guestCount ?? 1,
    amount: booking.amount ?? PACKAGE_AMOUNTS[packageId] ?? 0,
    paymentStatus: booking.paymentStatus === 'not_started' ? 'unpaid' : (booking.paymentStatus || 'unpaid'),
    status: booking.status || 'pending',
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('adminToken')

    async function loadBookings() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()

        if (response.status === 401) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          navigate(`${ADMIN_BASE}/login`, { replace: true })
          return
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not load dashboard.')
        }

        if (!ignore) {
          setBookings(result.data.map(normalizeBooking))
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Could not load dashboard.')
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
  }, [navigate])

  const stats = useMemo(() => {
    const total = bookings.length
    const todayCount = bookings.filter(b => b.date === TODAY).length
    const upcoming = bookings.filter(b => b.date >= TODAY && b.status !== 'cancelled').length
    const revenue = bookings
      .filter(b => ['paid', 'partial'].includes(b.paymentStatus))
      .reduce((sum, b) => sum + b.amount, 0)
    const pendingPayments = bookings.filter(b => ['unpaid', 'partial', 'not_started'].includes(b.paymentStatus)).length
    const activeOffers = 3
    const occupiedSlots = bookings.filter(b => b.date === TODAY && b.status !== 'cancelled').length
    const availableSlots = Math.max(DAILY_SLOT_CAPACITY - occupiedSlots, 0)

    return { total, todayCount, upcoming, revenue, pendingPayments, activeOffers, availableSlots, occupiedSlots }
  }, [bookings])

  const recent = bookings.slice(0, 5)

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main} aria-label="Admin dashboard">
        <div className="fade-up">
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Dashboard</h1>
              <p style={styles.pageDate}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link to={`${ADMIN_BASE}/bookings`} style={styles.newBtn} aria-label="View all bookings">
              View all bookings -&gt;
            </Link>
          </div>

          <div style={styles.statsGrid}>
            <Card label="Total Bookings" value={isLoading ? '...' : stats.total} sub={error || 'All time'} accent icon={<CalendarIcon color="var(--accent)" />} />
            <Card label="Today Bookings" value={isLoading ? '...' : stats.todayCount} sub={stats.todayCount === 0 ? 'No events today' : 'Events scheduled'} icon={<ClockIcon />} />
            <Card label="Upcoming Events" value={isLoading ? '...' : stats.upcoming} sub="Confirmed and pending" icon={<CalendarIcon />} />
            <Card label="Revenue Overview" value={isLoading ? '...' : `Rs ${stats.revenue.toLocaleString('en-IN')}`} sub="Paid and partial payments" trend="up" icon={<MoneyIcon />} />
            <Card label="Pending Payments" value={isLoading ? '...' : stats.pendingPayments} sub="Unpaid or partial" icon={<MoneyIcon />} />
            <Card label="Active Offers" value={isLoading ? '...' : stats.activeOffers} sub="Visible packages/offers" icon={<CheckIcon />} />
            <Card label="Available Slots" value={isLoading ? '...' : stats.availableSlots} sub={`${stats.occupiedSlots} occupied today`} icon={<ClockIcon />} />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Bookings</h2>
              <Link to={`${ADMIN_BASE}/bookings`} style={styles.seeAll} aria-label="See all bookings">See all</Link>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table} aria-label="Recent bookings">
                <thead>
                  <tr>
                    {['ID', 'Guest', 'Theme', 'Date', 'Status', 'Payment'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && Array.from({ length: 5 }, (_, index) => (
                    <tr key={`loading-${index}`} style={styles.tr}>
                      <td style={styles.td}><span style={{ ...styles.skeleton, width: 78 }} /></td>
                      <td style={styles.td}>
                        <span style={{ ...styles.skeleton, width: 118 }} />
                        <span style={{ ...styles.skeleton, width: 92, marginTop: 6 }} />
                      </td>
                      <td style={styles.td}><span style={{ ...styles.skeleton, width: 104 }} /></td>
                      <td style={styles.td}>
                        <span style={{ ...styles.skeleton, width: 94 }} />
                        <span style={{ ...styles.skeleton, width: 64, marginTop: 6 }} />
                      </td>
                      <td style={styles.td}><span style={{ ...styles.skeleton, width: 72 }} /></td>
                      <td style={styles.td}><span style={{ ...styles.skeleton, width: 76 }} /></td>
                    </tr>
                  ))}

                  {!isLoading && recent.length === 0 && (
                    <tr>
                      <td colSpan={6} style={styles.emptyCell}>
                        {error || 'No bookings yet.'}
                      </td>
                    </tr>
                  )}

                  {!isLoading && recent.map((b, i) => (
                    <tr key={b.id} style={{ ...styles.tr, animationDelay: `${i * 50}ms` }}>
                      <td style={styles.td}><span style={styles.idCell}>{b.id}</span></td>
                      <td style={styles.td}>
                        <div style={styles.guestName}>{b.name}</div>
                        <div style={styles.guestPhone}>{b.phone}</div>
                      </td>
                      <td style={styles.td}><span style={styles.themeCell}>{b.theme}</span></td>
                      <td style={styles.td}>
                        <div style={styles.dateCell}>{b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
                        <div style={styles.slotCell}>{b.slot} {b.extraTime ? `+ ${b.extraTime}` : ''}</div>
                      </td>
                      <td style={styles.td}><StatusBadge status={b.status} /></td>
                      <td style={styles.td}><PaymentBadge status={b.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.widgetsGrid}>
            <ThemeBreakdown bookings={bookings} />
            <SlotOccupancy bookings={bookings} />
            <UpcomingSlots bookings={bookings} />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}

function ThemeBreakdown({ bookings }) {
  const colors = ['var(--red)', 'var(--amber)', 'var(--blue)', 'var(--green)']
  const data = Object.entries(
    bookings.reduce((counts, booking) => {
      counts[booking.theme] = (counts[booking.theme] || 0) + 1
      return counts
    }, {})
  ).map(([label, count], index) => ({ label, count, color: colors[index % colors.length] }))
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Theme Distribution</div>
      {data.length === 0 ? (
        <p style={styles.panelEmpty}>No booking data yet.</p>
      ) : (
        <>
          <div style={styles.barStack}>
            {data.map(d => (
              <div key={d.label} style={{ flex: d.count, background: d.color, borderRadius: 4, height: 6, opacity: 0.8 }} title={d.label} />
            ))}
          </div>
          <div style={styles.themeRows}>
            {data.map(d => (
              <div key={d.label} style={styles.themeRow}>
                <div style={{ ...styles.themeDot, background: d.color }} />
                <span style={styles.themeRowLabel}>{d.label}</span>
                <span style={styles.themeRowCount}>{d.count} <span style={{ color: 'var(--text-muted)' }}>/ {total}</span></span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SlotOccupancy({ bookings }) {
  const occupied = bookings.filter(b => b.date === TODAY && b.status !== 'cancelled').length
  const percent = Math.min(Math.round((occupied / DAILY_SLOT_CAPACITY) * 100), 100)

  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Slot Occupancy</div>
      <div style={styles.occupancyTrack}>
        <div style={{ ...styles.occupancyFill, width: `${percent}%` }} />
      </div>
      <div style={styles.occupancyMeta}>
        <span>{occupied} booked</span>
        <span>{DAILY_SLOT_CAPACITY - occupied} available</span>
      </div>
      <div style={styles.slotGrid}>
        {Array.from({ length: DAILY_SLOT_CAPACITY }).map((_, index) => (
          <span key={index} style={{ ...styles.slotDot, ...(index < occupied ? styles.slotDotBusy : {}) }} />
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
      <div style={styles.upcomingList}>
        {upcoming.length === 0 && (
          <p style={styles.panelEmpty}>No upcoming events.</p>
        )}
        {upcoming.map(b => (
          <div key={b.id} style={styles.upcomingRow}>
            <div style={styles.upcomingDate}>
              <div style={styles.upcomingDay}>{new Date(b.date).getDate()}</div>
              <div style={styles.upcomingMonth}>{new Date(b.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.upcomingName}>{b.name}</div>
              <div style={styles.upcomingTheme}>{b.theme} - {b.slot}</div>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Quick Actions</div>
      <div style={styles.quickActions}>
        <Link to={`${ADMIN_BASE}/bookings`} style={styles.quickAction}>Review bookings</Link>
        <Link to={`${ADMIN_BASE}/addons`} style={styles.quickAction}>Manage offers</Link>
        <Link to={`${ADMIN_BASE}/hero-section`} style={styles.quickAction}>Hero section</Link>
        <Link to={`${ADMIN_BASE}/settings`} style={styles.quickAction}>Business settings</Link>
      </div>
    </div>
  )
}

function CalendarIcon({ color = 'var(--text-secondary)' }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function MoneyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-1)' },
  main: { flex: 1, marginLeft: 'var(--sidebar-width)', padding: '32px 36px', overflowX: 'hidden', minWidth: 0, minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 },
  pageDate: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  newBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '9px 18px', fontSize: 13, cursor: 'pointer', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 32, alignItems: 'stretch' },
  section: { marginBottom: 28 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' },
  seeAll: { fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 },
  tableWrap: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 332 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', background: 'var(--bg-3)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.1s ease' },
  td: { padding: '13px 16px', verticalAlign: 'middle', fontSize: 13.5 },
  emptyCell: { padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  idCell: { fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-4)', padding: '2px 8px', borderRadius: 4 },
  guestName: { color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 },
  guestPhone: { color: 'var(--text-muted)', fontSize: 12, marginTop: 1 },
  themeCell: { color: 'var(--text-secondary)', fontSize: 13 },
  dateCell: { color: 'var(--text-primary)', fontWeight: 500, fontSize: 13 },
  slotCell: { color: 'var(--text-muted)', fontSize: 12, marginTop: 1 },
  widgetsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'stretch' },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', minHeight: 260, overflow: 'hidden' },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' },
  panelEmpty: { color: 'var(--text-muted)', fontSize: 13 },
  barStack: { display: 'flex', gap: 3, borderRadius: 8, overflow: 'hidden' },
  themeRows: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 },
  themeRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' },
  themeDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  themeRowLabel: { flex: 1, fontSize: 13, color: 'var(--text-secondary)' },
  themeRowCount: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  upcomingList: { display: 'flex', flexDirection: 'column', gap: 8, minHeight: 168 },
  upcomingRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border)' },
  upcomingDate: { width: 40, height: 40, background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  upcomingDay: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 },
  upcomingMonth: { fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1, marginTop: 2 },
  upcomingName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' },
  upcomingTheme: { fontSize: 12, color: 'var(--text-muted)', marginTop: 1 },
  occupancyTrack: { height: 8, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' },
  occupancyFill: { height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--green))', borderRadius: 99 },
  occupancyMeta: { display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, marginTop: 10 },
  slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 18 },
  slotDot: { height: 18, borderRadius: 4, background: 'var(--bg-4)', border: '1px solid var(--border)' },
  slotDotBusy: { background: 'var(--accent-dim)', borderColor: 'rgba(201,169,110,0.4)' },
  quickActions: { display: 'grid', gap: 10 },
  quickAction: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, minHeight: 44 },
  skeleton: { display: 'block', height: 12, borderRadius: 999, background: 'linear-gradient(90deg, var(--bg-4), rgba(255,255,255,0.12), var(--bg-4))', opacity: 0.72 },
}
