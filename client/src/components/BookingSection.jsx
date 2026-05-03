import { useState, useEffect } from 'react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BOOKED_DAYS = new Set([3, 7, 14, 18, 22, 25]);
const TIME_SLOTS = ['10:00 AM','11:30 AM','01:00 PM','02:30 PM','04:00 PM','05:30 PM','07:00 PM','08:30 PM'];
const BOOKED_SLOTS = new Set(['01:00 PM','04:00 PM']);

export default function BookingSection() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handleDayClick = (d) => {
    const clickedDate = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (clickedDate < todayStart || BOOKED_DAYS.has(d)) return;
    setSelectedDay(d);
  };

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Render calendar cells
  const calCells = [];
  // Day labels
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    calCells.push(<div key={`label-${d}`} className="cal-day-label">{d}</div>);
  });
  // Prev month trailing
  for (let i = firstDay - 1; i >= 0; i--) {
    calCells.push(<div key={`prev-${i}`} className="cal-day other-month">{prevMonthDays - i}</div>);
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isPast = date < todayStart;
    const isBooked = BOOKED_DAYS.has(d);
    const isSelected = selectedDay === d;

    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isPast || isBooked) cls += ' other-month';
    if (isSelected) cls += ' selected';
    if (isBooked && !isPast) cls += ' booked';

    calCells.push(
      <div
        key={`day-${d}`}
        className={cls}
        onClick={() => handleDayClick(d)}
        style={{ cursor: isPast || isBooked ? 'default' : 'pointer' }}
      >
        {d}
      </div>
    );
  }
  // Next month leading
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    calCells.push(<div key={`next-${d}`} className="cal-day other-month">{d}</div>);
  }

  const summaryDate = selectedDay ? `${MONTH_NAMES[month]} ${selectedDay}` : '—';
  const summaryTime = selectedTime || '—';

  return (
    <section className="booking-section" id="booking" aria-label="Book your event">
      <div className="container">
        <div style={{ marginBottom: '64px' }} className="reveal">
          <div className="section-label">Reserve Your Date</div>
          <h2 className="section-title">Make It <em>Official</em></h2>
          <p className="section-subtitle">Choose your date, pick a time slot, and reserve your private event space. A 30% advance confirms your booking.</p>
        </div>

        <div className="booking-inner">
          {/* Calendar + Slots */}
          <div className="booking-main">
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
            </div>

            <div className="timeslots-wrap reveal">
              <h3 className="timeslots-title">Available Time Slots</h3>
              <div className="timeslots-grid" role="group" aria-label="Time slots">
                {TIME_SLOTS.map(slot => {
                  const isBooked = BOOKED_SLOTS.has(slot);
                  const isSelected = selectedTime === slot;
                  return (
                    <div
                      key={slot}
                      className={`timeslot${isBooked ? ' booked' : ''}${isSelected ? ' selected' : ''}`}
                      role="radio"
                      tabIndex={isBooked ? -1 : 0}
                      aria-disabled={isBooked}
                      onClick={() => !isBooked && setSelectedTime(slot)}
                      onKeyDown={e => !isBooked && (e.key === 'Enter' || e.key === ' ') && setSelectedTime(slot)}
                    >
                      {slot}
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--gold)' }}>✦</span> Slots marked in grey are already booked. Each slot is 2 hours unless extended.
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary reveal reveal-delay-2">
            <h3 className="summary-title">Your Booking Summary</h3>
            {[
              { label: 'Theme', value: 'Not selected', className: 'gold' },
              { label: 'Date', value: summaryDate },
              { label: 'Time', value: summaryTime },
              { label: 'Guests', value: '2 guests' },
              { label: 'Duration', value: '2 hours' },
              { label: 'Package', value: 'Signature' },
            ].map(row => (
              <div key={row.label} className="summary-row">
                <span className="summary-row-label">{row.label}</span>
                <span className={`summary-row-value${row.className ? ' ' + row.className : ''}`}>{row.value}</span>
              </div>
            ))}
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
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '16px 32px' }}
            >
              <span>✦</span> Reserve Now
            </button>
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
