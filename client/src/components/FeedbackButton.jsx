import { useMemo, useState } from 'react'

const EMPTY_FORM = {
  customerName: '',
  email: '',
  phone: '',
  eventType: '',
  rating: 5,
  message: '',
}

const EVENT_OPTIONS = [
  'Romantic Celebration',
  'Birthday Celebration',
  'Luxury Surprise',
  'Anniversary',
  'Custom Event',
]

const emailJsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  adminEmail: import.meta.env.VITE_ADMIN_REVIEW_EMAIL,
}

async function notifyAdminWithEmailJs(form) {
  const enabled = emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey
  if (!enabled) {
    throw new Error('EmailJS is not configured yet.')
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: emailJsConfig.serviceId,
      template_id: emailJsConfig.templateId,
      user_id: emailJsConfig.publicKey,
      template_params: {
        to_email: emailJsConfig.adminEmail,
        customer_name: form.customerName,
        customer_email: form.email || 'Not provided',
        customer_phone: form.phone || 'Not provided',
        event_type: form.eventType || 'Customer Feedback',
        rating: form.rating,
        message: form.message,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Email notification failed.')
  }

  return { skipped: false }
}

export default function FeedbackButton({ placement = 'floating' }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => form.customerName.trim() && form.message.trim() && Number(form.rating) >= 1,
    [form.customerName, form.message, form.rating]
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    if (status.message) setStatus({ type: '', message: '' })
    if (notice) setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) {
      setStatus({ type: 'error', message: 'Please enter your name, rating, and feedback.' })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      await notifyAdminWithEmailJs({
        ...form,
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        eventType: form.eventType || 'Customer Feedback',
        message: form.message.trim(),
      })

      setForm(EMPTY_FORM)
      setStatus({ type: '', message: '' })
      setOpen(false)
      setNotice('Thank you. Your feedback has been submitted.')
      window.setTimeout(() => setNotice(''), 4200)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not submit feedback.' })
    } finally {
      setSubmitting(false)
    }
  }

  const isNavLike = placement === 'nav' || placement === 'mobile'

  return (
    <div className={`feedback-widget feedback-widget--${placement}`}>
      {open && (
        <div className="feedback-panel" role="dialog" aria-modal="false" aria-labelledby="feedback-title">
          <div className="feedback-panel__header">
            <div>
              <p className="feedback-panel__eyebrow">Guest feedback</p>
              <h2 id="feedback-title" className="feedback-panel__title">Share your review</h2>
            </div>
            <button
              type="button"
              className="feedback-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Close feedback form"
            >
              x
            </button>
          </div>

          <form className="feedback-form" onSubmit={handleSubmit}>
            <label className="feedback-field">
              Name
              <input
                value={form.customerName}
                onChange={(event) => updateField('customerName', event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </label>

            <div className="feedback-form__grid">
              <label className="feedback-field">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label className="feedback-field">
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="Optional"
                  autoComplete="tel"
                />
              </label>
            </div>

            <label className="feedback-field">
              Event type
              <select value={form.eventType} onChange={(event) => updateField('eventType', event.target.value)}>
                <option value="">Select event</option>
                {EVENT_OPTIONS.map((eventType) => (
                  <option key={eventType} value={eventType}>{eventType}</option>
                ))}
              </select>
            </label>

            <fieldset className="feedback-rating">
              <legend>Rating</legend>
              <div className="feedback-rating__stars">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={rating <= Number(form.rating) ? 'is-active' : ''}
                    onClick={() => updateField('rating', rating)}
                    aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="feedback-field">
              Review
              <textarea
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                required
              />
            </label>

            {status.message && (
              <p className={`feedback-status feedback-status--${status.type}`}>{status.message}</p>
            )}

            <button type="submit" className="feedback-submit" disabled={submitting || !canSubmit}>
              {submitting ? 'Sending...' : 'Submit review'}
            </button>
          </form>
        </div>
      )}

      {notice && (
        <div className="feedback-toast" role="status" aria-live="polite">
          {notice}
        </div>
      )}

      <button
        type="button"
        className={`feedback-trigger${isNavLike ? ' feedback-trigger--nav' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="feedback-title"
      >
        Feedback
      </button>
    </div>
  )
}
