import Sidebar from '../components/Sidebar'

function ComingSoon({ title, icon }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>{title}</h1>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
          <span style={{ fontSize: 40 }}>{icon}</span>
          <p style={{ fontSize: 14 }}>This section is under construction.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.6 }}>Ready for backend integration.</p>
        </div>
      </main>
    </div>
  )
}

export function Themes()   { return <ComingSoon title="Themes"   icon="🎭" /> }
export function Addons()   { return <ComingSoon title="Add-ons"  icon="✨" /> }
export function Settings() { return <ComingSoon title="Settings" icon="⚙️" /> }
