import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import "../admin.css";

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/control-panel-7x92/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("adminToken", "demo-token");
    navigate("/control-panel-7x92/dashboard");
  };

  return (
    <div className="login-page">
      {/* Grid background */}
      <div style={styles.grid} aria-hidden="true" />

      {/* Glow */}
      <div style={styles.glow} aria-hidden="true" />

      <div className="fade-up login-card">
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.logoMark}>WOS</div>
          <h1 style={styles.title}>WonderOne-Suprises</h1>
          <p style={styles.subtitle}>Admin Console — Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              placeholder="WonderOne-Suprises"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
              spellCheck="false"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={styles.eyeBtn}
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                Sign in to console
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p style={styles.hint}>
          Demo credentials: <code style={styles.code}>WonderOne-Suprises</code> / <code style={styles.code}>admin123</code>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    padding: '24px',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
  },
  glow: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 36px',
    position: 'relative',
    boxShadow: 'var(--shadow-lg)',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, var(--accent), #7a5c2e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
    boxShadow: '0 4px 20px rgba(201,169,110,0.25)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12.5,
    color: 'var(--text-muted)',
    letterSpacing: '0.02em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em',
  },
  input: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 14px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.15s ease',
  },
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'var(--red-dim)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: 12.5,
    color: 'var(--red)',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, var(--accent), #a07840)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 20px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s ease',
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(0,0,0,0.2)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
  hint: {
    marginTop: 20,
    fontSize: 11.5,
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1.7,
  },
  code: {
    background: 'var(--bg-4)',
    borderRadius: 4,
    padding: '1px 5px',
    fontFamily: 'monospace',
    fontSize: 11,
    color: 'var(--accent)',
  },
}
