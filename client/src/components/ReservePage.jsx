import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const THEME_INFO = {
  romantic:  { name: 'Heart Theme',     price: 4999, label: 'Romantic Experience',  emoji: '🌹', color: '#C9A84C' },
  birthday:  { name: 'Balloon Theme',   price: 6499, label: 'Birthday Celebration', emoji: '🎉', color: '#C9A84C' },
  surprise:  { name: 'Partition Theme', price: 5999, label: 'Surprise Experience',  emoji: '✨', color: '#C9A84C' },
};

const SLOT_MAP = {
  slot1: '10:00 AM – 11:30 AM', slot2: '12:00 PM – 1:30 PM',
  slot3: '2:00 PM – 3:30 PM',   slot4: '4:00 PM – 5:30 PM',
  slot5: '6:00 PM – 7:30 PM',   slot6: '8:00 PM – 9:30 PM',
};

const OCCASIONS = ['Birthday','Anniversary','Romantic Date','Surprise Party','Baby Shower','Proposal','Engagement','Farewell','Reunion','Other'];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Phase 1: Customer Details Form
function DetailsForm({ booking, update, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!booking.name?.trim()) e.name = 'Name is required';
    if (!booking.phone?.trim() || booking.phone.replace(/\D/g,'').length < 10) e.phone = 'Valid phone number required';
    if (!booking.location?.trim()) e.location = 'Location is required';
    if (!booking.occasion) e.occasion = 'Please select an occasion';
    if (!booking.specialPerson?.trim()) e.specialPerson = 'Special person\'s name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (e) => {
    update({ [key]: e.target.value });
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  return (
    <motion.div
      className="reserve-details"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="reserve-form-header">
        <div className="reserve-step-label">Step 1 of 2</div>
        <h2 className="reserve-form-title">Your Details</h2>
        <p className="reserve-form-subtitle">Help us craft a perfectly personalized experience.</p>
      </div>

      <div className="reserve-fields-grid">
        {[
          { id: 'name', label: 'Your Name', icon: '👤', type: 'text', placeholder: 'Full name', key: 'name' },
          { id: 'phone', label: 'Phone Number', icon: '📱', type: 'tel', placeholder: '+91 98765 43210', key: 'phone' },
          { id: 'location', label: 'Your Location', icon: '📍', type: 'text', placeholder: 'City, State', key: 'location' },
          { id: 'specialPerson', label: "Special Person's Name", icon: '💝', type: 'text', placeholder: 'Who is this for?', key: 'specialPerson' },
        ].map((f, i) => (
          <motion.div
            key={f.id}
            className="reserve-field"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <label className="reserve-label" htmlFor={f.id}>
              <span className="reserve-icon">{f.icon}</span> {f.label}
            </label>
            <input
              id={f.id}
              type={f.type}
              className={`reserve-input${errors[f.key] ? ' error' : ''}`}
              value={booking[f.key] || ''}
              onChange={handleChange(f.key)}
              placeholder={f.placeholder}
              autoComplete="off"
            />
            {errors[f.key] && <span className="reserve-error">{errors[f.key]}</span>}
          </motion.div>
        ))}

        <motion.div
          className="reserve-field"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <label className="reserve-label" htmlFor="occasion">
            <span className="reserve-icon">🎉</span> Occasion
          </label>
          <select
            id="occasion"
            className={`reserve-input reserve-select${errors.occasion ? ' error' : ''}`}
            value={booking.occasion || ''}
            onChange={handleChange('occasion')}
          >
            <option value="" disabled>Select occasion</option>
            {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.occasion && <span className="reserve-error">{errors.occasion}</span>}
        </motion.div>

        <motion.div
          className="reserve-field reserve-field--full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <label className="reserve-label" htmlFor="notes">
            <span className="reserve-icon">📝</span> Notes / Requests
            <span className="reserve-optional">(optional)</span>
          </label>
          <textarea
            id="notes"
            className="reserve-input reserve-textarea"
            rows={3}
            value={booking.notes || ''}
            onChange={handleChange('notes')}
            placeholder="Special requests, dietary needs, decoration preferences..."
          />
        </motion.div>
      </div>

      <motion.button
        className="reserve-cta-btn"
        onClick={() => validate() && onNext()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        Continue to Confirm →
      </motion.button>
    </motion.div>
  );
}

// Phase 2: Terms Confirmation
function TermsConfirm({ booking, themeInfo, onConfirm, onBack }) {
  const [agreed, setAgreed] = useState(false);

  const dateStr = booking.date
    ? `${MONTHS_FULL[booking.date.month]} ${booking.date.day}, ${booking.date.year}`
    : null;
  const slotStr = booking.slot ? SLOT_MAP[booking.slot] : null;

  return (
    <motion.div
      className="reserve-terms"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="reserve-form-header">
        <div className="reserve-step-label">Step 2 of 2</div>
        <h2 className="reserve-form-title">Almost There</h2>
        <p className="reserve-form-subtitle">Review your booking and confirm the terms below.</p>
      </div>

      {/* Booking snapshot */}
      <div className="reserve-snapshot">
        <div className="reserve-snapshot-theme">
          <span className="reserve-snapshot-emoji">{themeInfo.emoji}</span>
          <div>
            <div className="reserve-snapshot-name">{themeInfo.label}</div>
            <div className="reserve-snapshot-sub">{themeInfo.name}</div>
          </div>
          <div className="reserve-snapshot-price">₹{themeInfo.price.toLocaleString('en-IN')}</div>
        </div>
        {(dateStr || slotStr) && (
          <div className="reserve-snapshot-row">
            {dateStr && <span>📅 {dateStr}</span>}
            {slotStr && <span>⏰ {slotStr}</span>}
          </div>
        )}
        <div className="reserve-snapshot-row">
          <span>👤 {booking.name}</span>
          <span>📱 {booking.phone}</span>
        </div>
      </div>

      {/* Policies */}
      <div className="reserve-policies">
        {[
          ['💳', 'Advance payment', 'non-refundable once confirmed.'],
          ['⏱️', '+30 minute extension', 'available for a small fee.'],
          ['🚫', 'Cancellations', 'are not eligible for a refund.'],
          ['🕐', 'Late arrivals', 'reduce your booked duration.'],
        ].map(([icon, bold, rest]) => (
          <div key={icon} className="reserve-policy-item">
            <span className="reserve-policy-icon">{icon}</span>
            <span><strong>{bold}</strong> {rest}</span>
          </div>
        ))}
      </div>

      {/* Agree checkbox */}
      <label className="reserve-agree-label">
        <input
          type="checkbox"
          className="reserve-agree-cb"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
        />
        <span className="reserve-agree-text">I understand and agree to the booking policies above.</span>
      </label>

      <div className="reserve-terms-actions">
        <button className="reserve-back-btn" onClick={onBack}>← Edit Details</button>
        <motion.button
          className="reserve-cta-btn"
          onClick={() => agreed && onConfirm()}
          disabled={!agreed}
          style={{ opacity: agreed ? 1 : 0.45, cursor: agreed ? 'pointer' : 'not-allowed' }}
          whileHover={agreed ? { scale: 1.02 } : {}}
          whileTap={agreed ? { scale: 0.98 } : {}}
        >
          ✦ Confirm &amp; Pay Advance
        </motion.button>
      </div>
    </motion.div>
  );
}

// Phase 3: Payment / Confirmation
function PaymentSummary({ booking, themeInfo, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = themeInfo.price;
  const advance = Math.round(totalPrice * 0.3);
  const remaining = totalPrice - advance;

  const dateStr = booking.date
    ? `${MONTHS[booking.date.month]} ${booking.date.day}, ${booking.date.year}`
    : '—';
  const slotStr = booking.slot ? SLOT_MAP[booking.slot] : '—';

  const handleBook = async () => {
    setSubmitting(true);
    setError('');
    try {
      const eventDate = booking.date
        ? new Date(booking.date.year, booking.date.month, booking.date.day).toISOString().slice(0, 10)
        : '';

      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name,
          phone: booking.phone,
          eventType: booking.occasion,
          eventDate,
          eventTime: slotStr,
          packageId: booking.theme,
          guestCount: 1,
          location: booking.location,
          addons: [],
          notes: [
            `Special person: ${booking.specialPerson}`,
            booking.notes,
          ].filter(Boolean).join('\n') || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Booking failed.');
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="reserve-success"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        <div className="reserve-success-glow" />
        <div className="reserve-success-icon">✦</div>
        <h2 className="reserve-success-title">Reservation Confirmed!</h2>
        <p className="reserve-success-sub">
          We've received your booking and will contact you shortly at{' '}
          <strong>{booking.phone}</strong> to confirm and process the advance payment.
        </p>
        <div className="reserve-success-details">
          {[
            ['Date', dateStr],
            ['Time', slotStr],
            ['Theme', themeInfo.name],
            ['Advance', `₹${advance.toLocaleString('en-IN')}`],
          ].map(([label, val]) => (
            <div key={label} className="reserve-success-row">
              <span>{label}</span>
              <strong>{val}</strong>
            </div>
          ))}
        </div>
        <button className="reserve-cta-btn" onClick={onDone} style={{ marginTop: 32 }}>
          Done ✦
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="reserve-payment"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="reserve-form-header">
        <div className="reserve-step-label">Payment</div>
        <h2 className="reserve-form-title">Booking Summary</h2>
        <p className="reserve-form-subtitle">Your reservation is one step away.</p>
      </div>

      <div className="reserve-payment-card">
        {[
          ['Name', booking.name],
          ['Phone', booking.phone],
          ['Location', booking.location],
          ['Occasion', booking.occasion],
          ['Special Person', booking.specialPerson],
          ['Date', dateStr],
          ['Time', slotStr],
          ['Theme', themeInfo.name],
        ].map(([label, val]) => (
          <div key={label} className="reserve-pay-row">
            <span>{label}</span>
            <strong>{val || '—'}</strong>
          </div>
        ))}

        <div className="reserve-pay-divider" />

        <div className="reserve-pay-row">
          <span>Theme Price</span>
          <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
        </div>
        <div className="reserve-pay-total-row">
          <span>Total</span>
          <strong className="reserve-pay-total-amount">₹{totalPrice.toLocaleString('en-IN')}</strong>
        </div>

        <div className="reserve-advance-box">
          <div className="reserve-advance-label">Advance to Pay Now (30%)</div>
          <div className="reserve-advance-amount">₹{advance.toLocaleString('en-IN')}</div>
          <div className="reserve-advance-note">
            Remaining ₹{remaining.toLocaleString('en-IN')} on the day of your event
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          className="reserve-error-msg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <div className="reserve-pay-footer">
        <motion.button
          className="reserve-cta-btn"
          style={{ width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: '1rem' }}
          onClick={handleBook}
          disabled={submitting}
          whileHover={!submitting ? { scale: 1.02 } : {}}
          whileTap={!submitting ? { scale: 0.98 } : {}}
        >
          {submitting ? 'Confirming…' : `✦ Pay Advance · ₹${advance.toLocaleString('en-IN')}`}
        </motion.button>
        <p className="reserve-pay-note">
          Our team will call you to process the payment. No card details required now.
        </p>
      </div>
    </motion.div>
  );
}

// ── Main ReservePage ──────────────────────────────────────────────────────────
export default function ReservePage() {
  const { themeKey } = useParams();
  const navigate = useNavigate();

  const themeInfo = THEME_INFO[themeKey];

  // Load date/slot from sessionStorage (set by BookingWizard after date+time steps)
  const [booking, setBooking] = useState(() => {
    let date = null;
    let slot = null;
    let extraTime = false;
    try {
      const raw = sessionStorage.getItem('vn_booking_context');
      if (raw) {
        const parsed = JSON.parse(raw);
        date = parsed.date || null;
        slot = parsed.slot || null;
        extraTime = parsed.extraTime || false;
      }
    } catch (_) {}
    return {
      theme: themeKey,
      date,
      slot,
      extraTime,
      name: '', phone: '', location: '', occasion: '',
      specialPerson: '', notes: '',
    };
  });

  const [phase, setPhase] = useState('details'); // 'details' | 'terms' | 'payment'

  const update = (patch) => setBooking(b => ({ ...b, ...patch }));

  // Fallback: if unknown theme, go home
  if (!themeInfo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Theme not found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>Go Home</button>
        </div>
      </div>
    );
  }

  const dateStr = booking.date
    ? `${MONTHS_FULL[booking.date.month]} ${booking.date.day}, ${booking.date.year}`
    : null;
  const slotStr = booking.slot ? SLOT_MAP[booking.slot] : null;

  return (
    <div className="reserve-page">
      {/* Ambient background */}
      <div className="reserve-bg" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Top nav bar */}
      <header className="reserve-nav">
        <button className="reserve-nav-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="reserve-nav-brand">Velvet Nights</span>
        <div className="reserve-nav-right" />
      </header>

      <div className="reserve-layout">
        {/* Left panel — theme context */}
        <aside className="reserve-aside">
          <motion.div
            className="reserve-aside-inner"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="reserve-aside-emoji">{themeInfo.emoji}</div>
            <div className="reserve-aside-label">{themeInfo.label}</div>
            <h2 className="reserve-aside-title">{themeInfo.name}</h2>
            <div className="reserve-aside-price">₹{themeInfo.price.toLocaleString('en-IN')}</div>

            {(dateStr || slotStr) && (
              <div className="reserve-aside-context">
                {dateStr && (
                  <div className="reserve-aside-context-item">
                    <span className="reserve-aside-context-icon">📅</span>
                    <span>{dateStr}</span>
                  </div>
                )}
                {slotStr && (
                  <div className="reserve-aside-context-item">
                    <span className="reserve-aside-context-icon">⏰</span>
                    <span>{slotStr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress dots */}
            <div className="reserve-aside-progress">
              {['Details', 'Confirm', 'Payment'].map((step, i) => {
                const phaseIndex = { details: 0, terms: 1, payment: 2 }[phase];
                return (
                  <div key={step} className="reserve-aside-step">
                    <div className={`reserve-aside-dot ${i <= phaseIndex ? 'active' : ''} ${i < phaseIndex ? 'done' : ''}`}>
                      {i < phaseIndex ? '✓' : i + 1}
                    </div>
                    <span className={`reserve-aside-step-label ${i === phaseIndex ? 'current' : ''}`}>{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="reserve-aside-trust">
              <div className="reserve-aside-trust-item">🔒 Secure Booking</div>
              <div className="reserve-aside-trust-item">📞 Personal Coordination</div>
              <div className="reserve-aside-trust-item">✦ Premium Experience</div>
            </div>
          </motion.div>
        </aside>

        {/* Right panel — form */}
        <main className="reserve-main">
          <AnimatePresence mode="wait">
            {phase === 'details' && (
              <DetailsForm
                key="details"
                booking={booking}
                update={update}
                onNext={() => setPhase('terms')}
              />
            )}
            {phase === 'terms' && (
              <TermsConfirm
                key="terms"
                booking={booking}
                themeInfo={themeInfo}
                onConfirm={() => setPhase('payment')}
                onBack={() => setPhase('details')}
              />
            )}
            {phase === 'payment' && (
              <PaymentSummary
                key="payment"
                booking={booking}
                themeInfo={themeInfo}
                onDone={() => navigate('/')}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
