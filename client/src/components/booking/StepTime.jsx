import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const BASE_SLOTS = [
  { id: 'slot1', start: '10:00 AM', end: '11:30 AM', label: 'Morning' },
  { id: 'slot2', start: '12:00 PM', end: '1:30 PM', label: 'Afternoon' },
  { id: 'slot3', start: '2:00 PM', end: '3:30 PM', label: 'Mid-Afternoon' },
  { id: 'slot4', start: '4:00 PM', end: '5:30 PM', label: 'Evening' },
  { id: 'slot5', start: '6:00 PM', end: '7:30 PM', label: 'Dusk' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function toEventDate(date) {
  if (!date) return '';
  return new Date(date.year, date.month, date.day).toISOString().slice(0, 10);
}

function getSlotLabel(slotId) {
  const slot = BASE_SLOTS.find(item => item.id === slotId);
  return slot ? `${slot.start} - ${slot.end}` : '';
}

export default function StepTime({ booking, update, onNext, onBack }) {
  const [error, setError] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const eventDate = toEventDate(booking.date);
  const slotLabels = useMemo(() => (
    Object.fromEntries(BASE_SLOTS.map(slot => [slot.id, getSlotLabel(slot.id)]))
  ), []);

  useEffect(() => {
    if (!eventDate) return;

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setBookedTimes([]);
        setLoadingSlots(true);
      }
    });

    fetch(`${API_BASE_URL}/bookings/availability/slots?date=${eventDate}`)
      .then(response => response.json())
      .then(result => {
        if (!ignore && result.success) {
          setBookedTimes(result.data.bookedSlots || []);
        }
      })
      .catch(() => {
        if (!ignore) setBookedTimes([]);
      })
      .finally(() => {
        if (!ignore) setLoadingSlots(false);
      });

    return () => { ignore = true; };
  }, [eventDate]);

  const selectSlot = (id) => {
    if (bookedTimes.includes(slotLabels[id])) {
      setError('Slot already booked');
      return;
    }
    update({ slot: id });
    setError('');
  };

  const handleNext = () => {
    if (!booking.slot) {
      setError('Please select a time slot to continue.');
      return;
    }
    onNext();
  };

  const selectedSlot = BASE_SLOTS.find(s => s.id === booking.slot);
  const endTime = booking.extraTime
    ? selectedSlot?.end.replace(/(\d+):(\d+)/, (_, h, m) => {
        const mins = parseInt(h) * 60 + parseInt(m) + 30;
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
        <p className="step-subtitle">5 slots are available each day. Each booking keeps a 1 hour break between setups.</p>
      </div>

      <div className="timeslots-grid timeslots-grid--2">
        {BASE_SLOTS.map((slot, i) => {
          const booked = bookedTimes.includes(slotLabels[slot.id]);
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
              {booked && <div className="slot-lock">Booked</div>}
              <div className="slot-label-text">{slot.label}</div>
              <div className="slot-time-range">
                <span>{slot.start}</span>
                <span className="slot-dash">-</span>
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

      {loadingSlots && <p className="wizard-error">Checking slot availability...</p>}
      {error && <p className="wizard-error">{error}</p>}

      <div className="wizard-footer">
        <button className="btn btn-outline-sm" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={handleNext}>Explore Themes</button>
      </div>
    </div>
  );
}
