import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  DEFAULT_BUSINESS_SETTINGS,
  fetchBusinessSettings,
  saveAdminPassword,
  saveBusinessSettings,
} from '../data/businessSettings'

const STORAGE_KEY = 'adminSettings'

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return DEFAULT_BUSINESS_SETTINGS
    }

    try {
      return { ...DEFAULT_BUSINESS_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_BUSINESS_SETTINGS
    }
  })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let ignore = false

    fetchBusinessSettings({ admin: true })
      .then((data) => {
        if (!ignore) {
          setSettings(data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
      })
      .catch((err) => {
        if (!ignore) setMessage(err.message || 'Could not load saved settings.')
      })

    return () => {
      ignore = true
    }
  }, [])

  function updateField(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  async function saveSettings(event) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const saved = await saveBusinessSettings(settings)
      setSettings(saved)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      setMessage('Settings saved. The frontend header and footer will update shortly.')
    } catch (err) {
      setMessage(err.message || 'Could not save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  async function changePassword(event) {
    event.preventDefault()

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage('Fill all password fields.')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New password and confirmation do not match.')
      return
    }

    try {
      await saveAdminPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated. Use the new password next login.')
    } catch (err) {
      setMessage(err.message || 'Could not update password.')
    }
  }

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Settings</h1>
            <p style={styles.pageSub}>Manage admin profile, password, business details, and contact information.</p>
          </div>
          {message && <div style={styles.notice}>{message}</div>}
        </div>

        <div style={styles.grid}>
          <form onSubmit={saveSettings} style={styles.panel}>
            <h2 style={styles.panelTitle}>Admin Profile</h2>
            <div style={styles.fieldGrid}>
              <Field label="Name" value={settings.profileName} onChange={value => updateField('profileName', value)} />
              <Field label="Email" type="email" value={settings.profileEmail} onChange={value => updateField('profileEmail', value)} />
            </div>

            <h2 style={styles.panelTitle}>Business Details</h2>
            <div style={styles.fieldGrid}>
              <Field label="Business name" value={settings.businessName} onChange={value => updateField('businessName', value)} />
              <Field label="Tagline" value={settings.tagline} onChange={value => updateField('tagline', value)} />
              <Field label="City" value={settings.city} onChange={value => updateField('city', value)} />
              <Field label="Opening hours" value={settings.openingHours} onChange={value => updateField('openingHours', value)} />
              <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
                Description
                <textarea value={settings.description} onChange={event => updateField('description', event.target.value)} style={styles.textarea} />
              </label>
              <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
                Address
                <textarea value={settings.address} onChange={event => updateField('address', event.target.value)} style={styles.textarea} />
              </label>
            </div>

            <h2 style={styles.panelTitle}>Contact Information</h2>
            <div style={styles.fieldGrid}>
              <Field label="Phone" value={settings.phone} onChange={value => updateField('phone', value)} />
              <Field label="WhatsApp" value={settings.whatsapp} onChange={value => updateField('whatsapp', value)} />
              <Field label="Contact email" type="email" value={settings.email} onChange={value => updateField('email', value)} />
              <Field label="Instagram" value={settings.instagram} onChange={value => updateField('instagram', value)} />
            </div>

            <button type="submit" disabled={isSaving} style={styles.saveBtn}>{isSaving ? 'Saving...' : 'Save Settings'}</button>
          </form>

          <form onSubmit={changePassword} style={styles.panel}>
            <h2 style={styles.panelTitle}>Change Password</h2>
            <div style={styles.stack}>
              <Field label="Current password" type="password" value={passwords.currentPassword} onChange={value => setPasswords(prev => ({ ...prev, currentPassword: value }))} />
              <Field label="New password" type="password" value={passwords.newPassword} onChange={value => setPasswords(prev => ({ ...prev, newPassword: value }))} />
              <Field label="Confirm new password" type="password" value={passwords.confirmPassword} onChange={value => setPasswords(prev => ({ ...prev, confirmPassword: value }))} />
            </div>
            <button type="submit" style={styles.secondaryBtn}>Update Password</button>
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label style={styles.field}>
      {label}
      <input type={type} value={value} onChange={event => onChange(event.target.value)} style={styles.input} />
    </label>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '32px 36px', overflowX: 'hidden', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 },
  pageSub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  notice: { background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.25)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '9px 13px', fontSize: 12.5 },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(280px, 0.5fr)', gap: 14, alignItems: 'start' },
  panel: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 },
  panelTitle: { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', margin: '0 0 14px' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))', gap: 12, marginBottom: 22 },
  stack: { display: 'grid', gap: 12, marginBottom: 18 },
  field: { display: 'grid', gap: 6, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 },
  input: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-body)' },
  textarea: { minHeight: 92, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-body)', resize: 'vertical' },
  saveBtn: { background: 'var(--accent)', border: '1px solid var(--accent)', color: 'var(--bg-1)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}
