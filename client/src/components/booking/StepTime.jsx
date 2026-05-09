import { useState } from 'react';
import { motion } from 'framer-motion';

const BASE_SLOTS = [
  { id: 'slot1', start: '10:00 AM', end: '11:30 AM', label: 'Morning' },
  { id: 'slot2', start: '12:00 PM', end: '1:30 PM',  label: 'Afternoon' },
  { id: 'slot3', start: '2:00 PM',  end: '3:30 PM',  label: 'Mid-Afternoon' },
  { id: 'slot4', start: '4:00 PM',  end: '5:30 PM',  label: 'Evening' },
  { id: 'slot5', start: '6:00 PM',  end: '7:30 PM',  label: 'Dusk' },
  { id: 'slot6', start: '8:00 PM',  end: '9:30 PM',  label: 'Night' },
];

// Mock booked slots - in production, fetch from API
const BOOKED_SLOTS = ['slot3'];

export default function StepTime({ booking, update, onNext, onBack }) {
  const [error, setError] = useState('');

  const selectSlot = (id) => {
    if (BOOKED_SLOTS.includes(id)) return;
    update({ slot: id });
    setError('');
  };

  const handleNext = () => {
    if (!booking.slot) { setError('Please select a time slot to continue.'); return; }
    onNext();
  };

  const selectedSlot = BASE_SLOTS.find(s => s.id === booking.slot);
  const endTime = booking.extraTime
    ? selectedSlot?.end.replace(/(\d+):(\d+)/, (_, h, m) => {
        let mins = parseInt(h) * 60 + parseInt(m) + 30;
        const nh = Math.floor(mins / 60) % 24;
        const nm = mins % 60;
        const ampm = nh >= 12 ? 'PM' : 'AM';
        return `${nh > 12 ? nh - 12 : nh || 12}:${nm.toString().padStart(2, '0')} ${ampm}`;
      })
    : selectedSlot?.end;

  return (
    <div className="step-time">
      <div className="step-title-wrap">
        <h2 className="step-title">Choose a Time Slot</h2>
        <p className="step-subtitle">Each slot is 1.5 hours. You can extend by +30 minutes if needed.</p>
      </div>

      <div className="timeslots-grid timeslots-grid--2">
        {BASE_SLOTS.map((slot, i) => {
          const booked = BOOKED_SLOTS.includes(slot.id);
          const selected = booking.slot === slot.id;
          return (
            <motion.div
              key={slot.id}
              className={`timeslot-card ${selected ? 'selected' : ''} ${booked ? 'booked' : ''}`}
              onClick={() => selectSlot(slot.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={!booked ? { scale: 1.02, y: -2 } : {}}
              whileTap={!booked ? { scale: 0.98 } : {}}
              role="radio"
              aria-checked={selected}
              tabIndex={booked ? -1 : 0}
            >
              {booked && <div className="slot-lock">🔒 Booked</div>}
              <div className="slot-label-text">{slot.label}</div>
              <div className="slot-time-range">
                <span>{slot.start}</span>
                <span className="slot-dash">–</span>
                <span>{slot.end}</span>
              </div>
              <div className="slot-duration">1.5 hrs</div>
              {selected && <div className="slot-selected-glow" />}
            </motion.div>
          );
        })}
      </div>

      {booking.slot && (
        <motion.div
          className="extra-time-toggle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="toggle-label">
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={booking.extraTime}
                onChange={e => update({ extraTime: e.target.checked })}
              />
              <div className="toggle-track">
                <div className="toggle-thumb" />
              </div>
            </div>
            <div>
              <div className="toggle-text">Add 30 minutes extra</div>
              {booking.extraTime && (
                <div className="toggle-note">Extended to <strong>{endTime}</strong></div>
              )}
            </div>
          </label>
        </motion.div>
      )}

      {error && <p className="wizard-error">{error}</p>}

      <div className="wizard-footer">
        <button className="btn btn-outline-sm" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleNext}>Explore Themes →</button>
      </div>
    </div>
  );
}
