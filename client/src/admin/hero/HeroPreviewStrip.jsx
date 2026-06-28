import AdminGlassCard from './AdminGlassCard.jsx'

export default function HeroPreviewStrip({ panels, modeLabel }) {
  if (!panels?.length) {
    return (
      <AdminGlassCard style={{ padding: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No panels to preview.</div>
      </AdminGlassCard>
    )
  }

  return (
    <AdminGlassCard style={{ padding: '18px 18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Live preview
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{modeLabel}</div>
        </div>
        <span
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#c9a84c',
            border: '1px solid rgba(201,168,76,0.35)',
            borderRadius: 99,
            padding: '4px 10px',
          }}
        >
          Read-only
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(panels.length, 3)}, minmax(0, 1fr))`,
          gap: 10,
        }}
      >
        {panels.map((p) => {
          const poster = p.poster ?? p.posterImage
          const video = p.videoSrc || p.videoUrl
          return (
            <div
              key={p.id}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'var(--bg-3)',
                minHeight: 160,
                position: 'relative',
              }}
            >
              {poster ? (
                <img
                  src={poster}
                  alt=""
                  style={{ width: '100%', height: 120, objectFit: 'cover', opacity: p.isVisible === false ? 0.35 : 1 }}
                />
              ) : (
                <div style={{ height: 120, background: 'linear-gradient(135deg, #1a1530, #0a0814)' }} />
              )}
              <div style={{ padding: '10px 10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.35 }}>{p.subtitle}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {p.isVisible === false ? 'Hidden on site' : 'Visible'}
                  {video ? ` · ${String(video).slice(0, 36)}${String(video).length > 36 ? '…' : ''}` : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AdminGlassCard>
  )
}
