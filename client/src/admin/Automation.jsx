import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import "../admin.css";

const STORAGE_KEY = 'automation_settings'

const defaultSettings = {
  calendarEnabled:       false,
  eventDuration:         1,
  reminderTiming:        '24h',
  whatsappEnabled:       false,
  confirmationTemplate:  'Hi {{name}}, your booking on {{date}} at {{time}} is confirmed! 🎉',
  reminderTemplate:      'Hi {{name}}, reminder: your booking is tomorrow at {{time}}. See you soon!',
}

export default function Automation() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })
  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }))

  const sendTest = () => {
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  return (
    <AdminLayout>
      <div className="automation-page fade-up">
        {/* Page header */}
        <div className="automation-header">
          <h1 className="automation-title">⚡ Automation</h1>
          <p className="automation-subtitle">Configure automated actions for bookings</p>
        </div>

        <div className="automation-grid">
          {/* ── Calendar Settings ───────────────────────── */}
          <div className="auto-card">
            <div className="auto-card-header">
              <span style={{ fontSize: 20 }}>📅</span>
              <h2 className="auto-card-title">Calendar Settings</h2>
            </div>

            {/* Toggle */}
            <div className="auto-field">
              <div className="toggle-row">
                <div>
                  <p className="auto-label">Enable Google Calendar</p>
                  <p className="auto-hint">Auto-create events for confirmed bookings</p>
                </div>
                <div
                  className={`auto-toggle${settings.calendarEnabled ? ' toggle-on' : ''}`}
                  onClick={() => update('calendarEnabled', !settings.calendarEnabled)}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="auto-field">
              <label className="auto-label">Event Duration (hours)</label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={settings.eventDuration}
                onChange={e => update('eventDuration', parseFloat(e.target.value))}
                className="auto-input"
                disabled={!settings.calendarEnabled}
              />
            </div>

            {/* Reminder timing */}
            <div className="auto-field">
              <label className="auto-label">Reminder Timing</label>
              <select
                value={settings.reminderTiming}
                onChange={e => update('reminderTiming', e.target.value)}
                className="auto-input"
                disabled={!settings.calendarEnabled}
              >
                <option value="24h">24 hours before</option>
                <option value="2h">2 hours before</option>
              </select>
            </div>
          </div>

          {/* ── WhatsApp Settings ───────────────────────── */}
          <div className="auto-card">
            <div className="auto-card-header">
              <span style={{ fontSize: 20 }}>💬</span>
              <h2 className="auto-card-title">WhatsApp Settings</h2>
            </div>

            {/* Toggle */}
            <div className="auto-field">
              <div className="toggle-row">
                <div>
                  <p className="auto-label">Enable WhatsApp Alerts</p>
                  <p className="auto-hint">Send automated messages to customers</p>
                </div>
                <div
                  className={`auto-toggle${settings.whatsappEnabled ? ' toggle-on' : ''}`}
                  onClick={() => update('whatsappEnabled', !settings.whatsappEnabled)}
                >
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {/* Confirmation template */}
            <div className="auto-field">
              <label className="auto-label">Confirmation Message Template</label>
              <p className="auto-hint">Variables: {'{{name}}'}, {'{{date}}'}, {'{{time}}'}</p>
              <textarea
                rows={3}
                value={settings.confirmationTemplate}
                onChange={e => update('confirmationTemplate', e.target.value)}
                className="auto-input auto-textarea"
                disabled={!settings.whatsappEnabled}
              />
            </div>

            {/* Reminder template */}
            <div className="auto-field">
              <label className="auto-label">Reminder Message Template</label>
              <p className="auto-hint">Variables: {'{{name}}'}, {'{{date}}'}, {'{{time}}'}</p>
              <textarea
                rows={3}
                value={settings.reminderTemplate}
                onChange={e => update('reminderTemplate', e.target.value)}
                className="auto-input auto-textarea"
                disabled={!settings.whatsappEnabled}
              />
            </div>

            <button
              onClick={sendTest}
              disabled={!settings.whatsappEnabled}
              className={`auto-test-btn${testSent ? ' sent' : ''}${!settings.whatsappEnabled ? ' disabled' : ''}`}
            >
              {testSent ? '✅ Test Sent!' : 'Send Test Message'}
            </button>
          </div>
        </div>

        {/* ── Automation Preview ──────────────────────── */}
        <div className="auto-card preview-card">
          <div className="auto-card-header">
            <span style={{ fontSize: 20 }}>🔍</span>
            <h2 className="auto-card-title">Automation Preview</h2>
            <span className="preview-badge">What happens on booking confirmation</span>
          </div>

          <div className="preview-list">
            {[
              {
                icon: '📅',
                label: 'Calendar Event',
                active: settings.calendarEnabled,
                activeText: `✔ Event will be created (${settings.eventDuration}h) + ${settings.reminderTiming} reminder`,
                inactiveText: '✘ Disabled — enable Google Calendar',
              },
              {
                icon: '💬',
                label: 'WhatsApp Confirmation',
                active: settings.whatsappEnabled,
                activeText: '✔ Confirmation message will be sent',
                inactiveText: '✘ Disabled — enable WhatsApp alerts',
              },
              {
                icon: '⏰',
                label: 'Reminder Scheduled',
                active: settings.whatsappEnabled || settings.calendarEnabled,
                activeText:
                  settings.whatsappEnabled && settings.calendarEnabled
                    ? `✔ WhatsApp + Calendar alert ${settings.reminderTiming} before`
                    : settings.whatsappEnabled
                    ? '✔ WhatsApp reminder will be sent'
                    : `✔ Calendar alert ${settings.reminderTiming} before`,
                inactiveText: '✘ No reminders configured',
              },
            ].map((item, i, arr) => (
              <div key={i}>
                {i > 0 && <div className="preview-divider" />}
                <div className="preview-item">
                  <div className="preview-icon">{item.icon}</div>
                  <div>
                    <p className="preview-action">{item.label}</p>
                    <p className={`preview-status ${item.active ? 's-active' : 's-inactive'}`}>
                      {item.active ? item.activeText : item.inactiveText}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
