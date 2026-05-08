import { NavLink, useNavigate } from 'react-router-dom'

const BASE = '/control-panel-7x9'

const NAV = [
  {
    to: `${BASE}/dashboard`,
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    to: `${BASE}/bookings`,
    label: 'Bookings',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: `${BASE}/themes`,
    label: 'Themes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 3a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" />
      </svg>
    ),
  },
  {
    to: `${BASE}/addons`,
    label: 'Add-ons',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    to: `${BASE}/settings`,
    label: 'Settings',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate(`${BASE}/login`)
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>VN</div>
        <div>
          <div style={styles.logoTitle}>Velvet Nights</div>
          <div style={styles.logoSub}>Admin Console</div>
        </div>
      </div>

      {/* Status pill */}
      <div style={styles.statusPill}>
        <span style={styles.dot} />
        Live · Chennai
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>Navigation</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
            {item.label === 'Bookings' && (
              <span style={styles.badge}>8</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.adminCard}>
          <div style={styles.avatar}>A</div>
          <div>
            <div style={styles.adminName}>Admin</div>
            <div style={styles.adminEmail}>owner@velvetnights.in</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    minHeight: '100vh',
    background: 'var(--bg-2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px 20px',
    borderBottom: '1px solid var(--border)',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, var(--accent), #8b6b3d)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1,
    flexShrink: 0,
  },
  logoTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 14,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    margin: '14px 16px',
    background: 'var(--green-dim)',
    border: '1px solid rgba(74,222,128,0.15)',
    borderRadius: 99,
    padding: '5px 12px',
    fontSize: 11,
    color: 'var(--green)',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--green)',
    display: 'inline-block',
    animation: 'pulse-dot 2s ease infinite',
    flexShrink: 0,
  },
  nav: {
    padding: '8px 12px',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    padding: '8px 8px 6px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: 13.5,
    fontWeight: 450,
    transition: 'all 0.15s ease',
    marginBottom: 2,
    position: 'relative',
  },
  navItemActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  navIcon: {
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  badge: {
    marginLeft: 'auto',
    background: 'var(--accent)',
    color: '#000',
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 7px',
    lineHeight: 1.6,
  },
  bottom: {
    padding: '16px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  adminCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--accent-dim)',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  adminEmail: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
    fontSize: 12.5,
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-body)',
  },
}
