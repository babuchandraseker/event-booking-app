import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StepQuickReserve from './StepQuickReserve';

const STEPS = ['Quick Reserve'];

const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

export default function BookingWizard({ onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleQuickReserveDone = (payload) => {
    try {
      sessionStorage.setItem('vn_booking_context', JSON.stringify({
        ...payload,
        quickReserve: true,
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
            <span className="wizard-logo-name">A WonderOne Suprise</span>
          </div>
          <div className="wizard-steps">
            {STEPS.map((label, i) => (
              <div key={label} className="wizard-step active">
                <div className="wizard-step-dot">
                  <span>{i + 1}</span>
                </div>
                <span className="wizard-step-label">{label}</span>
                {i < STEPS.length - 1 && <div className="wizard-step-connector" />}
              </div>
            ))}
          </div>
          <button className="wizard-close" onClick={onClose} aria-label="Close booking wizard">✕</button>
        </div>

        <div className="wizard-body">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key="quick-reserve"
              custom={1}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              <StepQuickReserve onComplete={handleQuickReserveDone} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
