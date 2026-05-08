import ThemeCard from './ThemeCard';

const themes = [
  {
    key: 'romantic',
    tag: '🌹 Romantic',
    img: '/themes/romantic/romantic1.jpg',
    title: 'Heart Theme',
    desc: 'An intimate escape draped in petals, soft candlelight, and whispered elegance. Perfect for proposals, anniversaries, and heartfelt date nights.',
    price: '₹4,999',
    priceSub: '/ 2 hours for 2',
    features: ['Candles', 'Rose petals', 'Music'],
  },
  {
    key: 'birthday',
    tag: '🎉 Birthday',
    emoji: '🎂',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Ballon Theme',
    desc: 'Vibrant balloons, custom décor, and a personalized setup that turns every birthday into a grand memory worth celebrating.',
    price: '₹6,499',
    priceSub: '/ 3 hours up to 10',
    features: ['Balloons', 'Custom banner', 'Cake'],
  },
  {
    key: 'surprise',
    tag: '✨ Surprise',
    emoji: '🎁',
    mediaStyle: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d1a2e,#1a2d4e,#0d1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
    title: 'Partition Theme',
    desc: 'A perfectly orchestrated surprise that leaves them breathless. We coordinate every detail in complete secrecy — you just show up and enjoy.',
    price: '₹5,999',
    priceSub: '/ 2.5 hours up to 8',
    features: ['Secret setup', 'Reveal décor', 'Timing'],
  },
];

export default function ThemeSection() {
  return (
    <section className="themes-section" id="themes" aria-label="Theme experiences">
      <div className="container">
        <div className="themes-header reveal">
          <div className="section-label">Theme Experiences</div>
          <h2 className="section-title">Choose Your <em>Story</em></h2>
          <p className="section-subtitle">
            Every theme is a world of its own — designed to immerse, delight, and leave an imprint that lasts long after the evening ends.
          </p>
        </div>

        <div className="themes-grid">
          {themes.map((theme, i) => (
            <ThemeCard
              key={theme.key}
              theme={theme}
              revealDelay={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
