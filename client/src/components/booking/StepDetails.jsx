import { useState } from 'react';
import { motion } from 'framer-motion';

const OCCASIONS = ['Birthday', 'Anniversary', 'Romantic Date', 'Surprise Party', 'Baby Shower', 'Proposal', 'Engagement', 'Farewell', 'Reunion', 'Other'];

const fields = [
  { id: 'name', label: 'Your Name', icon: '👤', type: 'text', placeholder: 'Full name', key: 'name' },
  { id: 'phone', label: 'Phone Number', icon: '📱', type: 'tel', placeholder: '+91 98765 43210', key: 'phone' },
  { id: 'location', label: 'Your Location', icon: '📍', type: 'text', placeholder: 'City, State', key: 'location' },
  { id: 'specialPerson', label: 'Special Person\'s Name', icon: '💝', type: 'text', placeholder: 'Who is this for?', key: 'specialPerson' },
];

export default function StepDetails({ booking, update, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!booking.name?.trim()) e.name = 'Name is required';
    if (!booking.phone?.trim() || booking.phone.replace(/\D/g,'').length < 10) e.phone = 'Valid phone required';
    if (!booking.location?.trim()) e.location = 'Location is required';
    if (!booking.occasion) e.occasion = 'Please select an occasion';
    if (!booking.specialPerson?.trim()) e.specialPerson = 'Special person name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (e) => {
    update({ [key]: e.target.value });
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  return (
    <div className="step-details">
      <div className="step-title-wrap">
        <h2 className="step-title">Your Details</h2>
        <p className="step-subtitle">Help us personalize your experience to perfection.</p>
      </div>

      <div className="details-form-grid">
        {fields.map((f, i) => (
          <motion.div
            key={f.id}
            className="detail-field"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <label className="detail-label" htmlFor={f.id}>
              <span className="detail-icon">{f.icon}</span>
              {f.label}
            </label>
            <input
              id={f.id}
              type={f.type}
              className={`detail-input ${errors[f.key] ? 'error' : ''}`}
              value={booking[f.key] || ''}
              onChange={handleChange(f.key)}
              placeholder={f.placeholder}
            />
            {errors[f.key] && <span className="detail-error">{errors[f.key]}</span>}
          </motion.div>
        ))}

        <motion.div
          className="detail-field"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <label className="detail-label" htmlFor="occasion">
            <span className="detail-icon">🎉</span>
            Occasion
          </label>
          <select
            id="occasion"
            className={`detail-input detail-select ${errors.occasion ? 'error' : ''}`}
            value={booking.occasion || ''}
            onChange={handleChange('occasion')}
          >
            <option value="" disabled>Select occasion</option>
            {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.occasion && <span className="detail-error">{errors.occasion}</span>}
        </motion.div>

        <motion.div
          className="detail-field detail-field--full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="detail-label" htmlFor="notes">
            <span className="detail-icon">📝</span>
            Notes / Requests <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <textarea
            id="notes"
            className="detail-input"
            rows={3}
            value={booking.notes || ''}
            onChange={handleChange('notes')}
            placeholder="Special requests, dietary needs, decoration preferences..."
          />
        </motion.div>
      </div>

      <div className="wizard-footer">
        <button className="btn btn-outline-sm" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={() => validate() && onNext()}>
          Review & Pay →
        </button>
      </div>
    </div>
  );
}
