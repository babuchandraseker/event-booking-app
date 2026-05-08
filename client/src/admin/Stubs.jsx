import AdminLayout from '../components/AdminLayout'
import "../admin.css";

function ComingSoon({ title, icon }) {
  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          {title}
        </h1>
        <div style={{
          flex: 1,
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 24,
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: 42 }}>{icon}</span>
          <p style={{ fontSize: 14, fontWeight: 500 }}>This section is under construction.</p>
          <p style={{ fontSize: 13, opacity: 0.6 }}>Ready for backend integration.</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export function Themes()   { return <ComingSoon title="Themes"   icon="🎭" /> }
export function Addons()   { return <ComingSoon title="Add-ons"  icon="✨" /> }
export function Settings() { return <ComingSoon title="Settings" icon="⚙️" /> }
