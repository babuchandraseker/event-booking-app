export default function AdminToggle({ checked, onChange, label, description }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 26,
          borderRadius: 99,
          border: '1px solid var(--border)',
          background: checked ? 'linear-gradient(90deg, #c9a84c, #8b6914)' : 'var(--bg-4)',
          position: 'relative',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 24 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </label>
  )
}
