export default function Card({ label, value, sub, icon, accent, trend }) {
  return (
    <div style={{ ...styles.card, ...(accent ? styles.cardAccent : {}) }}>
      <div style={styles.top}>
        <div style={styles.label}>{label}</div>
        <div style={{ ...styles.iconWrap, background: accent ? 'rgba(255,255,255,0.08)' : 'var(--bg-4)' }}>
          {icon}
        </div>
      </div>
      <div style={{ ...styles.value, color: accent ? '#fff' : 'var(--text-primary)' }}>{value}</div>
      {sub && (
        <div style={styles.sub}>
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

const styles = {
  card: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minHeight: 146,
    transition: 'border-color 0.2s ease',
  },
  cardAccent: {
    background: 'linear-gradient(135deg, #1c1408 0%, #0f0c04 100%)',
    border: '1px solid rgba(201,169,110,0.25)',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11.5,
    fontWeight: 500,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border)',
  },
  value: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    minHeight: 32,
    minWidth: 96,
    fontVariantNumeric: 'tabular-nums',
  },
  sub: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 2,
    minHeight: 18,
  },
}
