import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StepDate from './StepDate';
import StepTime from './StepTime';

// Steps: 0=Date, 1=Time — after Time, we send users to browse themes on the main page
const STEPS = ['Date', 'Time'];

const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

export default function BookingWizard({ initialTheme, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [booking, setBooking] = useState({
    date: null,
    slot: null,
    extraTime: false,
    theme: initialTheme || null,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const goNext = () => { setDir(1); setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 0)); };
  const update = (patch) => setBooking(b => ({ ...b, ...patch }));

  // After time is selected: save context to sessionStorage, close wizard, scroll to themes
  const handleTimeDone = () => {
    try {
      sessionStorage.setItem('vn_booking_context', JSON.stringify({
        date: booking.date,
        slot: booking.slot,
        extraTime: booking.extraTime,
      }));
    } catch (error) {
      console.warn('Could not save booking context.', error);
    }
    onClose();
    navigate('/#themes');
    setTimeout(() => {
      document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const stepComponents = [
    <StepDate key="date" booking={booking} update={update} onNext={goNext} />,
    <StepTime key="time" booking={booking} update={update} onNext={handleTimeDone} onBack={goPrev} />,
  ];

  return (
    <motion.div
      className="wizard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="wizard-panel"
        initial={{ opacity: 0, scale: 0.96, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="wizard-header">
          <div className="wizard-logo">
            <span className="wizard-logo-name">Velvet Nights</span>
          </div>
          <div className="wizard-steps">
            {STEPS.map((label, i) => (
              <div key={label} className={`wizard-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="wizard-step-dot">
                  {i < step ? <span>✓</span> : <span>{i + 1}</span>}
                </div>
                <span className="wizard-step-label">{label}</span>
                {i < STEPS.length - 1 && <div className="wizard-step-connector" />}
              </div>
            ))}
          </div>
          <button className="wizard-close" onClick={onClose} aria-label="Close booking wizard">✕</button>
        </div>

        <div className="wizard-body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
