import { useState } from 'react';

const BASE_PRICES = { romantic: 4999, birthday: 6499, surprise: 5999, '': 0 };
const GUEST_MULT = { '2': 1, '4': 1.2, '6': 1.4, '10': 1.6, '15': 2, '20+': 2.5 };
const DUR_MULT = { '1': 0.8, '2': 1, '3': 1.4, '4': 1.7 };
const ADDON_PRICES = {
  'Flower bouquet': 799, 'Cake': 999, 'Photographer': 1999,
  'Fog machine': 599, 'LED lights': 499, 'DJ & Music': 2499,
  'Photo booth': 1499, 'Welcome drinks': 699
};

const ADDONS = [
  { value: 'Flower bouquet', label: '💐 Flower bouquet' },
  { value: 'Cake', label: '🎂 Cake' },
  { value: 'Photographer', label: '📸 Photographer' },
  { value: 'Fog machine', label: '🌫️ Fog machine' },
  { value: 'LED lights', label: '💡 LED lights' },
  { value: 'DJ & Music', label: '🎵 DJ & Music' },
  { value: 'Photo booth', label: '🤳 Photo booth' },
  { value: 'Welcome drinks', label: '🥂 Welcome drinks' },
];

export default function PriceEstimator() {
  const [theme, setTheme] = useState('');
  const [guests, setGuests] = useState('2');
  const [duration, setDuration] = useState('2');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (val) => {
    setSelectedAddons(prev =>
      prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]
    );
  };

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const base = BASE_PRICES[theme] || 4999;
  const guestMult = GUEST_MULT[guests] || 1;
  const durMult = DUR_MULT[duration] || 1;
  const addonTotal = selectedAddons.reduce((sum, a) => sum + (ADDON_PRICES[a] || 0), 0);
  const subtotal = Math.round(base * guestMult * durMult);
  const total = subtotal + addonTotal;

  return (
    <section className="build-section" id="build" aria-label="Build your experience">
      <div className="container">
        <div className="build-inner">
          {/* Form */}
          <div className="build-form reveal">
            <h2 className="form-title">Craft Your <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Perfect</em> Evening</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="themeSelect">Choose Theme</label>
              <select className="form-control" id="themeSelect" value={theme} onChange={e => setTheme(e.target.value)}>
                <option value="">Select a theme…</option>
                <option value="romantic">🌹 Roses &amp; Candlelight (Romantic)</option>
                <option value="birthday">🎂 Your Special Day (Birthday)</option>
                <option value="surprise">🎁 The Grand Reveal (Surprise)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="guestsSelect">Guest Count</label>
                <select className="form-control" id="guestsSelect" value={guests} onChange={e => setGuests(e.target.value)}>
                  <option value="2">2 guests (intimate)</option>
                  <option value="4">4 guests</option>
                  <option value="6">6 guests</option>
                  <option value="10">10 guests</option>
                  <option value="15">15 guests</option>
                  <option value="20+">20+ guests</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="durationSelect">Duration</label>
                <select className="form-control" id="durationSelect" value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Add-ons</label>
              <div className="addons-list">
                {ADDONS.map(a => (
                  <label key={a.value} className="addon-check">
                    <input
                      type="checkbox"
                      value={a.value}
                      checked={selectedAddons.includes(a.value)}
                      onChange={() => toggleAddon(a.value)}
                    />
                    {' '}{a.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Price */}
            <div className="price-display">
              <div className="price-display-label">Estimated Price</div>
              <div className="price-display-amount" id="dynamicPrice">₹{total.toLocaleString('en-IN')}</div>
              <div className="price-breakdown">
                <div className="price-line">
                  <span>Base ({theme || 'theme'}) × {guests} guests × {duration}hr</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {addonTotal > 0 && (
                  <div className="price-line">
                    <span>Add-ons</span>
                    <span>₹{addonTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-line total">
                  <span>Estimated Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px' }}>
              <a href="#booking" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={e => handleAnchorClick(e, '#booking')}>
                <span>✦</span> Proceed to Book
              </a>
            </div>
          </div>

          {/* Right features */}
          <div className="build-right reveal reveal-delay-2">
            <div>
              <div className="section-label">Customizable</div>
              <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Every Detail, <em>Your Way</em></h2>
              <p className="section-subtitle">Mix and match to build the exact experience you've imagined. Our team handles every element with precision.</p>
            </div>
            {[
              { icon: '🎨', title: 'Themed Décor', desc: 'From floral arrangements to neon signs — every visual element is sourced and set up by our in-house décor team.' },
              { icon: '🎵', title: 'Curated Ambiance', desc: 'Custom playlists, fog machines, scent diffusers and color-matched lighting that transforms the space completely.' },
              { icon: '🧁', title: 'Gourmet Extras', desc: 'Artisanal cakes, dessert spreads, and welcome drinks — add any combination to make the evening unforgettable.' },
              { icon: '📸', title: 'Memory Capture', desc: 'Optional photography and video packages ensure every precious moment is captured and delivered within 48 hours.' },
            ].map(f => (
              <div key={f.title} className="build-feature">
                <div className="build-feature-icon">{f.icon}</div>
                <div>
                  <h4 className="build-feature-title">{f.title}</h4>
                  <p className="build-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
