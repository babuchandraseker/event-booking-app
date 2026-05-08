import { NavLink, useNavigate } from 'react-router-dom'
import "../admin.css";

const BASE = '/control-panel-7x92'

const navItems = [
  { to: `${BASE}/dashboard`,  label: 'Dashboard',  icon: '🏠' },
  { to: `${BASE}/bookings`,   label: 'Bookings',   icon: '📋' },
  { to: `${BASE}/services`,   label: 'Services',   icon: '🛠️' },
  { to: `${BASE}/clients`,    label: 'Clients',    icon: '👥' },
  { to: `${BASE}/automation`, label: 'Automation', icon: '⚡' },
  { to: `${BASE}/settings`,   label: 'Settings',   icon: '⚙️' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    navigate('/control-panel-7x92/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">Admin</span>
        <span className="sidebar-logo-dot" />
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
