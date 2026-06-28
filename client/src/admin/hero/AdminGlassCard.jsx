export default function AdminGlassCard({ children, style, className = '', ...rest }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(201, 168, 76, 0.2)',
        background: 'linear-gradient(155deg, rgba(26, 22, 44, 0.95), rgba(10, 8, 20, 0.88))',
        boxShadow: '0 18px 56px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
