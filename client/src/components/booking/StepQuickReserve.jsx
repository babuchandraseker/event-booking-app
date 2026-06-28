import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const BASE_SLOTS = [
  { id: 'slot1', start: '10:00 AM', end: '11:30 AM', label: 'Morning' },
  { id: 'slot2', start: '12:00 PM', end: '1:30 PM', label: 'Afternoon' },
  { id: 'slot3', start: '2:00 PM', end: '3:30 PM', label: 'Mid-Afternoon' },
  { id: 'slot4', start: '4:00 PM', end: '5:30 PM', label: 'Evening' },
  { id: 'slot5', start: '6:00 PM', end: '7:30 PM', label: 'Dusk' },
];

import { API_BASE_URL } from '../../config/api.js';

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function tomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatInputDate(date);
}

function toDateContext(dateInput) {
  const [year, month, day] = dateInput.split('-').map(Number);
  return { year, month: month - 1, day };
}

function slotRange(slotId) {
  const slot = BASE_SLOTS.find((item) => item.id === slotId);
  return slot ? `${slot.start} - ${slot.end}` : '';
}

function isValidPhone(value) {
  return value.replace(/\D/g, '').length >= 10;
}

export default function StepQuickReserve({ onComplete }) {
  const [dateInput, setDateInput] = useState('');
  const [slot, setSlot] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const minDate = useMemo(() => tomorrowInputDate(), []);
  const slotLabels = useMemo(() => Object.fromEntries(BASE_SLOTS.map((item) => [item.id, slotRange(item.id)])), []);

  useEffect(() => {
    if (!dateInput) return;

    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setBookedTimes([]);
        setLoadingSlots(true);
      }
    });

    fetch(`${API_BASE_URL}/bookings/availability/slots?date=${dateInput}`)
      .then((response) => response.json())
      .then((result) => {
        if (!ignore && result.success) setBookedTimes(result.data.bookedSlots || []);
      })
      .catch(() => {
        if (!ignore) setBookedTimes([]);
      })
      .finally(() => {
        if (!ignore) setLoadingSlots(false);
      });

    return () => {
      ignore = true;
    };
  }, [dateInput]);

  function handleDateChange(event) {
    setDateInput(event.target.value);
    setSlot('');
    setError('');
  }

  function handleSlotSelect(slotId) {
    if (!dateInput) {
      setError('Choose a date first.');
      return;
    }
    if (bookedTimes.includes(slotLabels[slotId])) {
      setError('That slot is already booked. Please choose another.');
      return;
    }
    setSlot(slotId);
    setError('');
  }

  function handleSubmit() {
    if (!dateInput) {
      setError('Please choose a date.');
      return;
    }
    if (dateInput < minDate) {
      setError('Bookings open from tomorrow onward.');
      return;
    }
    if (!slot) {
      setError('Please choose a time slot.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number.');
      return;
    }
    if (!isValidPhone(whatsapp)) {
      setError('Enter a valid WhatsApp number.');
      return;
    }

    onComplete({
      date: toDateContext(dateInput),
      dateInput,
      slot,
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      extraTime: false,
    });
  }

  return (
    <div className="quick-reserve">
      <div className="step-title-wrap">
        <div className="section-label quick-reserve-label">Quick Reserve</div>
        <h2 className="step-title">Hold Your Slot</h2>
        <p className="step-subtitle">
          Pick a date, time, and contact number. Then choose your theme and package.
        </p>
      </div>

      <div className="quick-reserve-grid">
        <label className="quick-field quick-field--date">
          <span>Date</span>
          <input type="date" min={minDate} value={dateInput} onChange={handleDateChange} />
        </label>

        <label className="quick-field">
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="quick-field">
          <span>WhatsApp</span>
          <input
            type="tel"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="+91 98765 43210"
          />
        </label>
      </div>

      <div className="quick-slots" role="radiogroup" aria-label="Time slots">
        {BASE_SLOTS.map((item, index) => {
          const booked = bookedTimes.includes(slotLabels[item.id]);
          const selected = slot === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              className={`quick-slot${selected ? ' selected' : ''}${booked ? ' booked' : ''}`}
              onClick={() => handleSlotSelect(item.id)}
              disabled={booked}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              whileHover={!booked ? { y: -2 } : {}}
              whileTap={!booked ? { scale: 0.98 } : {}}
              role="radio"
              aria-checked={selected}
            >
              <span className="quick-slot-label">{item.label}</span>
              <strong>{item.start}</strong>
              <span>{item.end}</span>
              {booked && <em>Booked</em>}
            </motion.button>
          );
        })}
      </div>

      {loadingSlots && <p className="wizard-error">Checking slot availability...</p>}
      {error && <p className="wizard-error">{error}</p>}

      <div className="wizard-footer">
        <div className="quick-reserve-note">Your selection is saved while you choose a theme.</div>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Continue to Themes <span>→</span>
        </button>
      </div>
    </div>
  );
}
