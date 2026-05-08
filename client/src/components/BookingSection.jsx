import { useState } from 'react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TIME_SLOTS = [
  { id: 'slot1', label: '10:00 – 11:30 AM', short: 'Morning' },
  { id: 'slot2', label: '12:30 – 2:00 PM',  short: 'Afternoon' },
  { id: 'slot3', label: '3:00 – 4:30 PM',   short: 'Mid-Afternoon' },
  { id: 'slot4', label: '5:30 – 7:00 PM',   short: 'Evening' },
  { id: 'slot5', label: '8:00 – 9:30 PM',   short: 'Night' },
];

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Romantic Date',
  'Surprise Party', 'Baby Shower', 'Proposal',
  'Engagement', 'Farewell', 'Reunion', 'Other',
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const PACKAGE_BY_OCCASION = {
  Birthday: 'birthday',
  'Romantic Date': 'romantic',
  Anniversary: 'romantic',
  Proposal: 'romantic',
  'Surprise Party': 'surprise',
};

const getPackageId = (occasion) => PACKAGE_BY_OCCASION[occasion] || 'signature';

export default function BookingSection() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({
    bookingName: '',
    phone: '',
    fromLocation: '',
    occasion: '',
    specialPersonName: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handleDayClick = (d) => {
    const clickedDate = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (clickedDate <= todayStart) return;
    setSelectedDay(d);
    setErrors((prev) => ({ ...prev, date: '' }));
  };

  const handleFieldChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.bookingName.trim()) errs.bookingName = 'Name of booking is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (form.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!form.fromLocation.trim()) errs.fromLocation = 'Location is required';
    if (!selectedDay) errs.date = 'Please select a date';
    if (!selectedSlot) errs.slot = 'Please select a time slot';
    if (!form.occasion) errs.occasion = 'Please select an occasion';
    if (!form.specialPersonName.trim()) errs.specialPersonName = 'Special person name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReserve = async () => {
    if (!validate()) return;

    const eventDate = new Date(year, month, selectedDay).toISOString().slice(0, 10);
    const slotInfo = TIME_SLOTS.find((s) => s.id === selectedSlot);
    setIsSubmitting(true);
    setBookingStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.bookingName.trim(),
          phone: form.phone.trim(),
          eventType: form.occasion,
          eventDate,
          eventTime: slotInfo?.label,
          packageId: getPackageId(form.occasion),
          guestCount: 1,
          location: form.fromLocation.trim(),
          addons: [],
          notes: [
            `Special person: ${form.specialPersonName.trim()}`,
            form.notes.trim(),
          ].filter(Boolean).join('\n') || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Booking could not be created.');
      }

      setBookingStatus({ type: 'success', message: '🎉 Reserved successfully! We will contact you shortly to confirm.' });
      setForm({ bookingName: '', phone: '', fromLocation: '', occasion: '', specialPersonName: '', notes: '' });
      setSelectedDay(null);
      setSelectedSlot(null);
    } catch (error) {
      setBookingStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Calendar cells ── */
  const calCells = [];
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    calCells.push(<div key={`label-${d}`} className="cal-day-label">{d}</div>);
  });
  for (let i = firstDay - 1; i >= 0; i--) {
    calCells.push(<div key={`prev-${i}`} className="cal-day other-month">{prevMonthDays - i}</div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isPast = date <= todayStart;
    const isSelected = selectedDay === d;

    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isPast) cls += ' other-month';
    if (isSelected) cls += ' selected';

    calCells.push(
      <div
        key={`day-${d}`}
        className={cls}
        onClick={() => handleDayClick(d)}
        style={{ cursor: isPast ? 'default' : 'pointer' }}
      >
        {d}
      </div>
    );
  }
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    calCells.push(<div key={`next-${d}`} className="cal-day other-month">{d}</div>);
  }

  const summaryDate = selectedDay ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}` : '—';
  const summarySlot = selectedSlot ? TIME_SLOTS.find(s => s.id === selectedSlot)?.label : '—';

  return (
    <section className="booking-section" id="booking" aria-label="Book your event">
      <div className="container">
        <div style={{ marginBottom: '64px' }} className="reveal">
          <div className="section-label">Reserve Your Date</div>
          <h2 className="section-title">Make It <em>Official</em></h2>
          <p className="section-subtitle">Fill in the details below, pick a date and time slot, and reserve your private event experience.</p>
        </div>

        <div className="booking-inner">
          {/* ── LEFT COLUMN: Form Fields + Calendar + Slots ── */}
          <div className="booking-main">

            {/* Form fields grid */}
            <div className="bk-form-grid reveal">
              {/* Name of Booking */}
              <div className="bk-field">
                <label className="form-label" htmlFor="bk-booking-name">
                  Name of Booking <span className="bk-req">*</span>
                </label>
                <input
                  id="bk-booking-name"
                  className={`form-control${errors.bookingName ? ' form-error' : ''}`}
                  type="text"
                  value={form.bookingName}
                  onChange={handleFieldChange('bookingName')}
                  placeholder="e.g. Sarah's Birthday"
                />
                {errors.bookingName && <span className="bk-err-msg">{errors.bookingName}</span>}
              </div>

              {/* From Location */}
              <div className="bk-field">
                <label className="form-label" htmlFor="bk-from-location">
                  From Location <span className="bk-req">*</span>
                </label>
                <input
                  id="bk-from-location"
                  className={`form-control${errors.fromLocation ? ' form-error' : ''}`}
                  type="text"
                  value={form.fromLocation}
                  onChange={handleFieldChange('fromLocation')}
                  placeholder="e.g. Chennai, Tamil Nadu"
                />
                {errors.fromLocation && <span className="bk-err-msg">{errors.fromLocation}</span>}
              </div>

              <div className="bk-field">
                <label className="form-label" htmlFor="bk-phone">
                  Phone <span className="bk-req">*</span>
                </label>
                <input
                  id="bk-phone"
                  className={`form-control${errors.phone ? ' form-error' : ''}`}
                  type="tel"
                  value={form.phone}
                  onChange={handleFieldChange('phone')}
                  placeholder="e.g. 9876543210"
                />
                {errors.phone && <span className="bk-err-msg">{errors.phone}</span>}
              </div>

              {/* Occasion */}
              <div className="bk-field">
                <label className="form-label" htmlFor="bk-occasion">
                  Occasion <span className="bk-req">*</span>
                </label>
                <select
                  id="bk-occasion"
                  className={`form-control form-select${errors.occasion ? ' form-error' : ''}`}
                  value={form.occasion}
                  onChange={handleFieldChange('occasion')}
                >
                  <option value="" disabled>Select occasion</option>
                  {OCCASIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {errors.occasion && <span className="bk-err-msg">{errors.occasion}</span>}
              </div>

              {/* Special Person Name */}
              <div className="bk-field">
                <label className="form-label" htmlFor="bk-special-person">
                  Special Person Name <span className="bk-req">*</span>
                </label>
                <input
                  id="bk-special-person"
                  className={`form-control${errors.specialPersonName ? ' form-error' : ''}`}
                  type="text"
                  value={form.specialPersonName}
                  onChange={handleFieldChange('specialPersonName')}
                  placeholder="Name of the guest of honour"
                />
                {errors.specialPersonName && <span className="bk-err-msg">{errors.specialPersonName}</span>}
              </div>

              {/* Notes (full width, optional) */}
              <div className="bk-field bk-field--full">
                <label className="form-label" htmlFor="bk-notes">
                  Notes <span className="bk-opt">(optional)</span>
                </label>
                <textarea
                  id="bk-notes"
                  className="form-control"
                  rows="3"
                  value={form.notes}
                  onChange={handleFieldChange('notes')}
                  placeholder="Any special requests, dietary needs, decorations, etc."
                />
              </div>
            </div>

            {/* Calendar */}
            <div className="calendar-wrap reveal">
              <div className="calendar-header">
                <button className="cal-nav" aria-label="Previous month"
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
                <h3 className="cal-month">{MONTH_NAMES[month]} {year}</h3>
                <button className="cal-nav" aria-label="Next month"
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
              </div>
              <div className="calendar-grid" role="grid" aria-label="Booking calendar">
                {calCells}
              </div>
              {errors.date && <span className="bk-err-msg" style={{ marginTop: '8px', display: 'block' }}>{errors.date}</span>}
            </div>

            {/* Time Slots */}
            <div className="timeslots-wrap reveal">
              <h3 className="timeslots-title">Select a Time Slot <span className="bk-req">*</span></h3>
              {errors.slot && <span className="bk-err-msg" style={{ marginBottom: '12px', display: 'block' }}>{errors.slot}</span>}
              <div className="timeslots-grid timeslots-grid--5" role="radiogroup" aria-label="Time slots">
                {TIME_SLOTS.map(slot => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className={`timeslot${isSelected ? ' selected' : ''}`}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => {
                        setSelectedSlot(slot.id);
                        setErrors((prev) => ({ ...prev, slot: '' }));
                      }}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedSlot(slot.id)}
                    >
                      <span className="timeslot-label">{slot.short}</span>
                      <span className="timeslot-time">{slot.label}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> Each slot is 1.5 hours long. Please select only one slot. You may extend it by an additional 30 minutes if needed.

              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Booking Summary ── */}
          <div className="booking-summary reveal reveal-delay-2">
            <h3 className="summary-title">Your Booking Summary</h3>
            {[
              { label: 'Booking Name', value: form.bookingName || '—' },
              { label: 'Phone', value: form.phone || '—' },
              { label: 'Location', value: form.fromLocation || '—' },
              { label: 'Date', value: summaryDate },
              { label: 'Time Slot', value: summarySlot },
              { label: 'Occasion', value: form.occasion || '—', className: 'gold' },
              { label: 'Special Person', value: form.specialPersonName || '—' },
              { label: 'Duration', value: '1.5 hours' },
            ].map(row => (
              <div key={row.label} className="summary-row">
                <span className="summary-row-label">{row.label}</span>
                <span className={`summary-row-value${row.className ? ' ' + row.className : ''}`}>{row.value}</span>
              </div>
            ))}

            {form.notes && (
              <div className="summary-row" style={{ flexDirection: 'column', gap: '4px' }}>
                <span className="summary-row-label">Notes</span>
                <span className="summary-row-value" style={{ fontSize: '0.8rem', opacity: 0.75 }}>{form.notes}</span>
              </div>
            )}

            <div className="summary-total">
              <div>
                <div>Total Estimate</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>incl. taxes &amp; fees</div>
              </div>
              <div className="summary-total-price">₹5,999</div>
            </div>

            <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💳 30% advance (₹1,799) to confirm. Remaining on the day.
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '16px 32px' }}
              onClick={handleReserve}
              disabled={isSubmitting}
            >
              <span>✦</span> {isSubmitting ? 'Reserving...' : 'Reserve Now'}
            </button>

            {bookingStatus.message && (
              <p className={`booking-status ${bookingStatus.type}`}>
                {bookingStatus.message}
              </p>
            )}

            <p className="summary-note">
              By reserving, you agree to our cancellation policy. Free cancellation up to 48 hours before the event.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
              <a href="https://wa.me/919999999999" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.3s' }} target="_blank" rel="noopener">
                💬 Chat on WhatsApp
              </a>
              <span style={{ color: 'var(--border)' }}>·</span>
              <a href="tel:+919999999999" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.3s' }}>
                📞 Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
