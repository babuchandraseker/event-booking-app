import "../admin.css";

export default function Card({ label, value, sub, icon, accent, trend }) {
  return (
    <div className={`admin-card${accent ? ' card-accent' : ''}`} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 6, transition: 'box-shadow 0.2s, border-color 0.2s' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="card-label" style={{ fontSize: 11, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accent ? 'rgba(255,255,255,0.1)' : 'var(--bg-muted)',
          border: `1px solid ${accent ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="card-value" style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: accent ? '#fff' : 'var(--text-main)' }}>
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div className="card-sub" style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginTop: 2 }}>
          {trend && (
            <span style={{ color: trend === 'up' ? 'var(--green)' : 'var(--red)', marginRight: 4 }}>
              {trend === 'up' ? '↑' : '↓'}
            </span>
          )}
          {sub}
        </div>
      )}
    </div>
  )
}
