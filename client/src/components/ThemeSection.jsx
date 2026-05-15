import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ThemeCard from './ThemeCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SLOT_MAP = {
  slot1: '10:00 AM', slot2: '12:00 PM', slot3: '2:00 PM',
  slot4: '4:00 PM',  slot5: '6:00 PM',  slot6: '8:00 PM',
};

const themes = [
  {
    key: 'romantic',
    tag: '🌹 Romantic',
    img: '/themes/romantic/romantic1.jpg',
    title: 'Heart Theme',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.',
    features: ['Candles', 'Rose petals', 'Music'],
  },
  {
    key: 'birthday',
    tag: '🎉 Birthday',
    emoji: '🎂',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Balloon Theme',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.',
    features: ['Balloons', 'Custom banner', 'Cake'],
  },
  {
    key: 'surprise',
    tag: '✨ Surprise',
    emoji: '🎁',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d1a2e,#1a2d4e,#0d1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Partition Theme',
    desc: 'A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.',
    features: ['Secret setup', 'Reveal décor', 'Timing'],
  },
];

// Read booking context from sessionStorage
function getBookingContext() {
  try {
    const raw = sessionStorage.getItem('vn_booking_context');
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Could not read booking context.', error);
  }
  return null;
}

export default function ThemeSection({ onBook }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const ctx = getBookingContext();
  const dateStr = ctx?.date
    ? `${MONTHS[ctx.date.month]} ${ctx.date.day}, ${ctx.date.year}`
    : null;
  const slotStr = ctx?.slot ? SLOT_MAP[ctx.slot] : null;

  return (
    <section className="themes-section" id="themes" ref={ref}>
      <div className="container">
        <motion.div
          className="themes-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label">Theme Experiences</div>
          <h2 className="section-title">Choose Your <em>Story</em></h2>
          <p className="section-subtitle">
            Every theme is a world of its own — designed to immerse, delight, and leave an imprint that lasts long after the evening ends.
          </p>

          {/* Booking context banner */}
          {(dateStr || slotStr) && (
            <motion.div
              className="themes-booking-ctx"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="themes-booking-ctx-icon">✦</span>
              <span>
                Your slot is reserved for
                {dateStr && <strong> {dateStr}</strong>}
                {slotStr && <> at <strong>{slotStr}</strong></>}
                — now choose your theme below.
              </span>
            </motion.div>
          )}
        </motion.div>

        <div className="themes-grid">
          {themes.map((theme, i) => (
            <ThemeCard
              key={theme.key}
              theme={theme}
              index={i}
              inView={inView}
              onBook={onBook}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
