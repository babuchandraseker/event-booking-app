import { useState } from 'react';
import { motion } from 'framer-motion';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StepDate({ booking, update, onNext }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handleDay = (d) => {
    const clicked = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (clicked <= todayStart) return;
    update({ date: { year, month, day: d } });
    setError('');
  };

  const handleNext = () => {
    if (!booking.date) { setError('Please select a date to continue.'); return; }
    onNext();
  };

  // Build calendar cells
  const cells = [];
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    cells.push(<div key={`lbl-${d}`} className="cal-day-label">{d}</div>);
  });
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push(<div key={`prev-${i}`} className="cal-day other-month">{prevMonthDays - i}</div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isPast = date <= todayStart;
    const isSelected = booking.date?.day === d && booking.date?.month === month && booking.date?.year === year;
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isPast) cls += ' other-month';
    if (isSelected) cls += ' selected';

    cells.push(
      <motion.div
        key={`day-${d}`}
        className={cls}
        onClick={() => !isPast && handleDay(d)}
        style={{ cursor: isPast ? 'not-allowed' : 'pointer' }}
        whileHover={!isPast ? { scale: 1.1 } : {}}
        whileTap={!isPast ? { scale: 0.95 } : {}}
      >
        {d}
      </motion.div>
    );
  }
  const remaining = (7 - ((firstDay + daysInMonth) % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    cells.push(<div key={`next-${d}`} className="cal-day other-month">{d}</div>);
  }

  const selectedLabel = booking.date
    ? `${MONTHS[booking.date.month]} ${booking.date.day}, ${booking.date.year}`
    : null;

  return (
    <div className="step-date">
      <div className="step-title-wrap">
        <h2 className="step-title">Select Your Date</h2>
        <p className="step-subtitle">Choose a date for your private experience. Bookings open from tomorrow onward.</p>
      </div>

      <div className="step-date-inner">
        <div className="calendar-wrap">
          <div className="calendar-header">
            <button className="cal-nav" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
            <h3 className="cal-month">{MONTHS[month]} {year}</h3>
            <button className="cal-nav" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="calendar-grid">{cells}</div>
        </div>

        {selectedLabel && (
          <motion.div
            className="date-selected-pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="gold-dot">✦</span>
            <span>Selected: <strong>{selectedLabel}</strong></span>
          </motion.div>
        )}

        {error && <p className="wizard-error">{error}</p>}
      </div>

      <div className="wizard-footer">
        <div />
        <button className="btn btn-primary" onClick={handleNext}>
          Continue <span>→</span>
        </button>
      </div>
    </div>
  );
}
