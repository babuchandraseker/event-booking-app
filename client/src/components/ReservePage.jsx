import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const THEME_INFO = {
  romantic: { name: 'Heart Theme', price: 4999, label: 'Romantic Experience', emoji: '*', color: '#C9A84C' },
  birthday: { name: 'Balloon Theme', price: 6499, label: 'Birthday Celebration', emoji: '*', color: '#C9A84C' },
  surprise: { name: 'Partition Theme', price: 5999, label: 'Luxury Surprise', emoji: '*', color: '#C9A84C' },
};

const PACKAGE_NAMES = {
  basic: 'Silver Package',
  premium: 'Gold Package',
  luxury: 'Platinum Package',
};

const SLOT_MAP = {
  slot1: '10:00 AM - 11:30 AM',
  slot2: '12:00 PM - 1:30 PM',
  slot3: '2:00 PM - 3:30 PM',
  slot4: '4:00 PM - 5:30 PM',
  slot5: '6:00 PM - 7:30 PM',
};

const OCCASIONS = ['Birthday', 'Anniversary', 'Romantic Date', 'Surprise Party', 'Baby Shower', 'Proposal', 'Engagement', 'Farewell', 'Reunion', 'Other'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getStoredBookingContext(themeKey) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem('vn_booking_context') || '{}');
    const dateInput = parsed.date
      ? new Date(parsed.date.year, parsed.date.month, parsed.date.day).toISOString().slice(0, 10)
      : '';

    return {
      theme: themeKey,
      date: parsed.date || null,
      dateInput,
      slot: parsed.slot || '',
      extraTime: Boolean(parsed.extraTime),
      packageId: parsed.packageId || 'premium',
      packageName: parsed.packageName || 'Gold',
      packagePrice: Number(parsed.packagePrice || 0),
      addons: parsed.addons || [],
      addonTotal: Number(parsed.addonTotal || 0),
      grandTotal: Number(parsed.grandTotal || 0),
    };
  } catch {
    return {
      theme: themeKey,
      date: null,
      dateInput: '',
      slot: '',
      extraTime: false,
      packageId: 'premium',
      packageName: 'Gold',
      packagePrice: 0,
      addons: [],
      addonTotal: 0,
      grandTotal: 0,
    };
  }
}

function formatDate(booking) {
  if (booking.dateInput) {
    return new Date(`${booking.dateInput}T00:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (booking.date) {
    return `${MONTHS_FULL[booking.date.month]} ${booking.date.day}, ${booking.date.year}`;
  }

  return '-';
}

function getEventDate(booking) {
  if (booking.dateInput) return booking.dateInput;
  if (!booking.date) return '';
  return new Date(booking.date.year, booking.date.month, booking.date.day).toISOString().slice(0, 10);
}

function DetailsForm({ booking, update, onNext }) {
  const [errors, setErrors] = useState({});
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [minimumEventDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  });
  const eventDate = getEventDate(booking);

  useEffect(() => {
    if (!eventDate) {
      return;
    }

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setBookedTimes([]);
        setLoadingSlots(true);
        setAvailabilityMessage('');
      }
    });

    fetch(`${API_BASE_URL}/bookings/availability/slots?date=${eventDate}`)
      .then(response => response.json())
      .then(result => {
        if (ignore) return;
        const nextBookedTimes = result.success ? result.data.bookedSlots || [] : [];
        setBookedTimes(nextBookedTimes);

        if (booking.slot && nextBookedTimes.includes(SLOT_MAP[booking.slot])) {
          update({ slot: '' });
          setErrors(prev => ({ ...prev, slot: 'Already booked. Please choose another slot.' }));
        }
      })
      .catch(() => {
        if (!ignore) setAvailabilityMessage('Could not check live availability. We will verify before payment.');
      })
      .finally(() => {
        if (!ignore) setLoadingSlots(false);
      });

    return () => { ignore = true; };
  }, [eventDate, booking.slot, update]);

  const isSlotBooked = (slotId) => Boolean(eventDate) && bookedTimes.includes(SLOT_MAP[slotId]);

  const validate = () => {
    const e = {};
    if (!booking.name?.trim()) e.name = 'Name is required';
    if (!booking.phone?.trim() || booking.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid phone number required';
    if (!booking.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) e.email = 'Valid email is required';
    if (!booking.whatsapp?.trim() || booking.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Valid WhatsApp number required';
    if (!eventDate) e.dateInput = 'Event date is required';
    if (!booking.slot) e.slot = 'Please select a slot';
    if (booking.slot && isSlotBooked(booking.slot)) e.slot = 'Already booked. Please choose another slot.';
    if (!booking.occasion) e.occasion = 'Please select an occasion';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (event) => {
    update({ [key]: event.target.value });
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const fields = [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Full name', key: 'name' },
    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210', key: 'phone' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', key: 'email' },
    { id: 'whatsapp', label: 'WhatsApp Number', type: 'tel', placeholder: '+91 98765 43210', key: 'whatsapp' },
    { id: 'dateInput', label: 'Event Date', type: 'date', placeholder: '', key: 'dateInput' },
  ];

  return (
    <motion.div className="reserve-details" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
      <div className="reserve-form-header">
        <div className="reserve-step-label">Step 1 of 3</div>
        <h2 className="reserve-form-title">Booking Details</h2>
        <p className="reserve-form-subtitle">Tell us who to celebrate and when to prepare the room.</p>
      </div>

      <div className="reserve-fields-grid">
        {fields.map((field, index) => (
          <motion.div key={field.id} className="reserve-field" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <label className="reserve-label" htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type={field.type}
              className={`reserve-input${errors[field.key] ? ' error' : ''}`}
              value={booking[field.key] || ''}
              onChange={handleChange(field.key)}
              min={field.type === 'date' ? minimumEventDate : undefined}
              placeholder={field.placeholder}
              autoComplete={field.type === 'email' ? 'email' : 'off'}
              required
            />
            {errors[field.key] && <span className="reserve-error">{errors[field.key]}</span>}
          </motion.div>
        ))}

        <motion.div className="reserve-field" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <label className="reserve-label" htmlFor="slot">Slot Selection</label>
          <select id="slot" className={`reserve-input reserve-select${errors.slot ? ' error' : ''}`} value={booking.slot || ''} onChange={handleChange('slot')}>
            <option value="" disabled>Select slot</option>
            {Object.entries(SLOT_MAP).map(([id, label]) => (
              <option key={id} value={id} disabled={isSlotBooked(id)}>
                {isSlotBooked(id) ? `${label} - Already booked` : label}
              </option>
            ))}
          </select>
          {errors.slot && <span className="reserve-error">{errors.slot}</span>}
          {!errors.slot && loadingSlots && <span className="reserve-field-note">Checking live availability...</span>}
          {!errors.slot && !loadingSlots && eventDate && availabilityMessage && <span className="reserve-field-note">{availabilityMessage}</span>}
        </motion.div>

        <motion.div className="reserve-field" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className="reserve-label" htmlFor="occasion">Occasion</label>
          <select id="occasion" className={`reserve-input reserve-select${errors.occasion ? ' error' : ''}`} value={booking.occasion || ''} onChange={handleChange('occasion')}>
            <option value="" disabled>Select occasion</option>
            {OCCASIONS.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          {errors.occasion && <span className="reserve-error">{errors.occasion}</span>}
        </motion.div>

        <motion.div className="reserve-field reserve-field--full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
          <label className="reserve-label" htmlFor="notes">Special Notes <span className="reserve-optional">(optional)</span></label>
          <textarea id="notes" className="reserve-input reserve-textarea" rows={3} value={booking.notes || ''} onChange={handleChange('notes')} placeholder="Special notes, food preferences, timing requests..." />
        </motion.div>

        <motion.div className="reserve-field reserve-field--full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <label className="reserve-label" htmlFor="surpriseInstructions">Surprise Instructions / Decoration Requests <span className="reserve-optional">(optional)</span></label>
          <textarea id="surpriseInstructions" className="reserve-input reserve-textarea" rows={3} value={booking.surpriseInstructions || ''} onChange={handleChange('surpriseInstructions')} placeholder="Reveal plan, message board text, rose path, balloon colors..." />
        </motion.div>
      </div>

      <motion.button className="reserve-cta-btn" onClick={() => validate() && onNext()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        Proceed to Book
      </motion.button>
    </motion.div>
  );
}

function TermsConfirm({ booking, themeInfo, totals, onConfirm, onBack }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <motion.div className="reserve-terms" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
      <div className="reserve-form-header">
        <div className="reserve-step-label">Step 2 of 3</div>
        <h2 className="reserve-form-title">Review Cart</h2>
        <p className="reserve-form-subtitle">Your live cart is ready. Confirm before payment.</p>
      </div>

      <div className="reserve-snapshot">
        <div className="reserve-snapshot-theme">
          <span className="reserve-snapshot-emoji">{themeInfo.emoji}</span>
          <div>
            <div className="reserve-snapshot-name">{themeInfo.label}</div>
            <div className="reserve-snapshot-sub">{booking.packageName || PACKAGE_NAMES[booking.packageId]}</div>
          </div>
          <div className="reserve-snapshot-price">Rs {totals.total.toLocaleString('en-IN')}</div>
        </div>
        <div className="reserve-snapshot-row">
          <span>{formatDate(booking)}</span>
          <span>{SLOT_MAP[booking.slot] || '-'}</span>
        </div>
        {booking.addons?.length > 0 && (
          <div className="reserve-policies">
            {booking.addons.map(addon => (
              <div key={addon.id || addon.text} className="reserve-policy-item">
                <span className="reserve-policy-icon">+</span>
                <span><strong>{addon.text}</strong> Rs {Number(addon.price || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="reserve-agree-label">
        <input type="checkbox" className="reserve-agree-cb" checked={agreed} onChange={event => setAgreed(event.target.checked)} />
        <span className="reserve-agree-text">I understand the selected date and slot will be reserved after payment.</span>
      </label>

      <div className="reserve-terms-actions">
        <button className="reserve-back-btn" onClick={onBack}>Edit Details</button>
        <motion.button className="reserve-cta-btn" onClick={() => agreed && onConfirm()} disabled={!agreed} style={{ opacity: agreed ? 1 : 0.45, cursor: agreed ? 'pointer' : 'not-allowed' }}>
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  );
}

function PaymentSummary({ booking, themeInfo, totals, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [paymentMode, setPaymentMode] = useState('advance');

  const amountToPay = paymentMode === 'full' ? totals.total : totals.advance;
  const remaining = totals.total - amountToPay;

  const handleBook = async () => {
    setSubmitting(true);
    setError('');

    try {
      const addonNames = (booking.addons || []).map(addon => addon.text || addon.name || addon.id);
      const addonDetails = (booking.addons || []).map(addon => ({
        name: addon.text || addon.name || addon.id,
        price: Number(addon.price || 0),
      }));

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name,
          phone: booking.phone,
          email: booking.email,
          eventType: themeInfo.label,
          eventDate: getEventDate(booking),
          eventTime: SLOT_MAP[booking.slot],
          packageId: booking.packageId || booking.theme,
          packageTitle: booking.packageName || PACKAGE_NAMES[booking.packageId] || themeInfo.name,
          guestCount: 1,
          location: booking.location || 'Velvet Nights Studio',
          addons: addonNames,
          addonsDetailed: addonDetails,
          amount: totals.total,
          paidAmount: amountToPay,
          paymentMode,
          paymentStatus: paymentMode === 'full' ? 'paid' : 'partial',
          notes: [
            `WhatsApp: ${booking.whatsapp}`,
            `Payment option: ${paymentMode}`,
            `Payment amount: Rs ${amountToPay}`,
            booking.extraTime ? 'Extra 30 minutes requested' : '',
            booking.notes ? `Special notes: ${booking.notes}` : '',
            booking.surpriseInstructions ? `Surprise/decor instructions: ${booking.surpriseInstructions}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Booking failed.');

      setSuccess({
        ...result.data,
        paidAmount: amountToPay,
        paymentMode,
        paymentStatusLabel: paymentMode === 'full' ? 'Full payment selected' : 'Advance payment selected',
      });
      sessionStorage.removeItem('vn_booking_context');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const whatsappText = encodeURIComponent(`Hi Velvet Nights, my booking ${success.id} is confirmed. I need support.`);

    return (
      <motion.div className="reserve-success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 22, stiffness: 260 }}>
        <div className="reserve-success-glow" />
        <div className="reserve-success-icon">*</div>
        <h2 className="reserve-success-title">Booking Confirmed</h2>
        <p className="reserve-success-sub">Your booking has been created and the admin dashboard will show it instantly.</p>
        <div className="reserve-success-details">
          {[
            ['Booking ID', success.id],
            ['Package', booking.packageName || PACKAGE_NAMES[booking.packageId]],
            ['Event Date', formatDate(booking)],
            ['Slot Time', SLOT_MAP[booking.slot]],
            ['Payment Status', success.paymentStatusLabel],
          ].map(([label, value]) => (
            <div key={label} className="reserve-success-row"><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
        <div className="reserve-terms-actions" style={{ marginTop: 28 }}>
          <a className="reserve-back-btn" href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp Support</a>
          <button className="reserve-back-btn" onClick={() => onDone('/control-panel-7x9/bookings')}>View Booking</button>
          <button className="reserve-cta-btn" onClick={() => onDone('/')}>Back To Home</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="reserve-payment" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
      <div className="reserve-form-header">
        <div className="reserve-step-label">Step 3 of 3</div>
        <h2 className="reserve-form-title">Payment Page</h2>
        <p className="reserve-form-subtitle">Choose advance payment or pay the full amount.</p>
      </div>

      <div className="reserve-payment-card">
        {[
          ['Theme', themeInfo.label],
          ['Package', booking.packageName || PACKAGE_NAMES[booking.packageId]],
          ['Event Date', formatDate(booking)],
          ['Slot', SLOT_MAP[booking.slot]],
          ['Subtotal', `Rs ${totals.subtotal.toLocaleString('en-IN')}`],
          ['Add-ons', `Rs ${totals.addons.toLocaleString('en-IN')}`],
        ].map(([label, value]) => (
          <div key={label} className="reserve-pay-row"><span>{label}</span><strong>{value}</strong></div>
        ))}
        <div className="reserve-pay-divider" />
        <div className="reserve-pay-total-row">
          <span>Total</span>
          <strong className="reserve-pay-total-amount">Rs {totals.total.toLocaleString('en-IN')}</strong>
        </div>

        <div className="reserve-advance-box">
          <div className="reserve-advance-label">Payment Option</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <button className="reserve-back-btn" onClick={() => setPaymentMode('advance')} style={{ borderColor: paymentMode === 'advance' ? 'var(--gold)' : undefined }}>Advance: Rs {totals.advance.toLocaleString('en-IN')}</button>
            <button className="reserve-back-btn" onClick={() => setPaymentMode('full')} style={{ borderColor: paymentMode === 'full' ? 'var(--gold)' : undefined }}>Full: Rs {totals.total.toLocaleString('en-IN')}</button>
          </div>
          <div className="reserve-advance-note">Remaining Rs {remaining.toLocaleString('en-IN')} after this payment</div>
        </div>
      </div>

      {error && <p className="reserve-error-msg">{error}</p>}

      <div className="reserve-pay-footer">
        <button className="reserve-cta-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleBook} disabled={submitting}>
          {submitting ? 'Confirming...' : `Razorpay Checkout - Rs ${amountToPay.toLocaleString('en-IN')}`}
        </button>
        <p className="reserve-pay-note">Razorpay can be connected with your live key. Until then, this safely creates the booking and reserves the slot.</p>
      </div>
    </motion.div>
  );
}

export default function ReservePage() {
  const { themeKey } = useParams();
  const navigate = useNavigate();
  const themeInfo = THEME_INFO[themeKey];
  const [phase, setPhase] = useState('details');
  const [booking, setBooking] = useState(() => ({
    ...getStoredBookingContext(themeKey),
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    location: '',
    occasion: '',
    notes: '',
    surpriseInstructions: '',
  }));

  const update = useCallback((patch) => setBooking(prev => ({ ...prev, ...patch })), []);

  const totals = useMemo(() => {
    const subtotal = Number(booking.packagePrice || themeInfo?.price || 0);
    const addons = Number(booking.addonTotal || 0);
    const extraTime = booking.extraTime && !(booking.addons || []).some(addon => addon.text === 'Extra 30 Minutes') ? 500 : 0;
    const total = Number(booking.grandTotal || 0) || subtotal + addons + extraTime;
    return {
      subtotal,
      addons: addons + extraTime,
      total,
      advance: Math.round(total * 0.3),
    };
  }, [booking, themeInfo]);

  if (!themeInfo) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="reserve-page">
      <div className="reserve-bg" />
      <div className="noise-overlay" aria-hidden="true" />
      <header className="reserve-nav">
        <button className="reserve-nav-back" onClick={() => navigate(-1)}>Back</button>
        <span className="reserve-nav-brand">Velvet Nights</span>
        <div className="reserve-nav-right" />
      </header>

      <div className="reserve-layout">
        <aside className="reserve-aside">
          <motion.div className="reserve-aside-inner" initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }}>
            <div className="reserve-aside-emoji">{themeInfo.emoji}</div>
            <div className="reserve-aside-label">{themeInfo.label}</div>
            <h2 className="reserve-aside-title">{themeInfo.name}</h2>
            <div className="reserve-aside-price">Rs {totals.total.toLocaleString('en-IN')}</div>
            <div className="reserve-aside-context">
              <div className="reserve-aside-context-item"><span>{booking.packageName || PACKAGE_NAMES[booking.packageId]}</span></div>
              <div className="reserve-aside-context-item"><span>{formatDate(booking)}</span></div>
              <div className="reserve-aside-context-item"><span>{SLOT_MAP[booking.slot] || 'Choose slot'}</span></div>
            </div>
            <div className="reserve-aside-progress">
              {['Details', 'Review', 'Payment'].map((step, index) => {
                const phaseIndex = { details: 0, terms: 1, payment: 2 }[phase];
                return (
                  <div key={step} className="reserve-aside-step">
                    <div className={`reserve-aside-dot ${index <= phaseIndex ? 'active' : ''} ${index < phaseIndex ? 'done' : ''}`}>{index < phaseIndex ? 'OK' : index + 1}</div>
                    <span className={`reserve-aside-step-label ${index === phaseIndex ? 'current' : ''}`}>{step}</span>
                  </div>
                );
              })}
            </div>
            <div className="reserve-aside-trust">
              <div className="reserve-aside-trust-item">5 slots per day</div>
              <div className="reserve-aside-trust-item">1 booking per slot</div>
              <div className="reserve-aside-trust-item">Admin updates instantly</div>
            </div>
          </motion.div>
        </aside>

        <main className="reserve-main">
          <AnimatePresence mode="wait">
            {phase === 'details' && <DetailsForm key="details" booking={booking} update={update} onNext={() => setPhase('terms')} />}
            {phase === 'terms' && <TermsConfirm key="terms" booking={booking} themeInfo={themeInfo} totals={totals} onConfirm={() => setPhase('payment')} onBack={() => setPhase('details')} />}
            {phase === 'payment' && <PaymentSummary key="payment" booking={booking} themeInfo={themeInfo} totals={totals} onDone={(path) => navigate(path)} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
