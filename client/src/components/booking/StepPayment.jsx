import { useState } from 'react';
import { motion } from 'framer-motion';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const THEME_PRICES = {
  romantic: { name: 'Heart Theme', price: 4999 },
  birthday: { name: 'Balloon Theme', price: 6499 },
  surprise: { name: 'Partition Theme', price: 5999 },
};

import { API_BASE_URL } from '../../config/api.js';

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StepPayment({ booking, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const themeInfo = THEME_PRICES[booking.theme] || { name: 'Theme', price: 5999 };
  const extraCharge = booking.extraTime ? 500 : 0;
  const totalPrice = themeInfo.price + extraCharge;
  const advance = Math.round(totalPrice * 0.3);
  const remaining = totalPrice - advance;

  const dateStr = booking.date
    ? `${MONTHS[booking.date.month]} ${booking.date.day}, ${booking.date.year}`
    : '—';

  const slotMap = {
    slot1: '10:00 AM – 11:30 AM', slot2: '12:00 PM – 1:30 PM',
    slot3: '2:00 PM – 3:30 PM', slot4: '4:00 PM – 5:30 PM',
    slot5: '6:00 PM – 7:30 PM', slot6: '8:00 PM – 9:30 PM',
  };
  const slotStr = booking.slot ? slotMap[booking.slot] : '—';

  const handleBook = async () => {
    setSubmitting(true);
    setError('');
    try {
      const eventDate = booking.date
        ? formatInputDate(new Date(booking.date.year, booking.date.month, booking.date.day))
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
          addons: booking.extraTime ? ['30-min extension'] : [],
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
        className="payment-success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="success-icon">✦</div>
        <h2 className="success-title">Reservation Confirmed!</h2>
        <p className="success-sub">
          We've received your booking and will contact you shortly at <strong>{booking.phone}</strong> to confirm and process the advance payment.
        </p>
        <div className="success-detail">
          <div><span>Date</span><strong>{dateStr}</strong></div>
          <div><span>Time</span><strong>{slotStr}</strong></div>
          <div><span>Theme</span><strong>{themeInfo.name}</strong></div>
          <div><span>Advance</span><strong>₹{advance.toLocaleString('en-IN')}</strong></div>
        </div>
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 24 }}>
          Done ✦
        </button>
      </motion.div>
    );
  }

  return (
    <div className="step-payment">
      <div className="step-title-wrap">
        <h2 className="step-title">Payment Summary</h2>
        <p className="step-subtitle">Review your booking details before confirming.</p>
      </div>

      <div className="payment-layout">
        {/* Summary card */}
        <motion.div
          className="payment-summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="payment-summary-title">Booking Summary</div>

          {[
            { label: 'Name', value: booking.name },
            { label: 'Phone', value: booking.phone },
            { label: 'Location', value: booking.location },
            { label: 'Occasion', value: booking.occasion },
            { label: 'Special Person', value: booking.specialPerson },
            { label: 'Date', value: dateStr },
            { label: 'Time', value: slotStr },
            { label: 'Theme', value: themeInfo.name },
            { label: 'Duration', value: booking.extraTime ? '2 hours' : '1.5 hours' },
          ].map(row => (
            <div key={row.label} className="payment-row">
              <span>{row.label}</span>
              <strong>{row.value || '—'}</strong>
            </div>
          ))}

          <div className="payment-divider" />

          <div className="payment-row">
            <span>Theme Price</span>
            <strong>₹{themeInfo.price.toLocaleString('en-IN')}</strong>
          </div>
          {booking.extraTime && (
            <div className="payment-row">
              <span>+30 min extension</span>
              <strong>₹500</strong>
            </div>
          )}

          <div className="payment-total-row">
            <span>Total</span>
            <strong className="payment-total-amount">₹{totalPrice.toLocaleString('en-IN')}</strong>
          </div>

          <div className="payment-advance-box">
            <div className="advance-label">Advance to Pay Now (30%)</div>
            <div className="advance-amount">₹{advance.toLocaleString('en-IN')}</div>
            <div className="advance-note">Remaining ₹{remaining.toLocaleString('en-IN')} on the day of event</div>
          </div>
        </motion.div>
      </div>

      {error && <p className="wizard-error">{error}</p>}

      <div className="wizard-footer" style={{ flexDirection: 'column', gap: 12 }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
          onClick={handleBook}
          disabled={submitting}
        >
          {submitting ? 'Confirming...' : `✦ Pay Advance · ₹${advance.toLocaleString('en-IN')}`}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Our team will call you to process the payment. No card details required now.
        </p>
      </div>
    </div>
  );
}
