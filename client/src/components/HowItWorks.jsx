const steps = [
  {
    icon: '✦',
    title: 'Choose & Customize',
    desc: 'Pick your theme, set the guest count, select add-ons, and use our price calculator to build your perfect experience.',
    delay: 1,
  },
  {
    icon: '📅',
    title: 'Reserve Your Date',
    desc: 'Select your preferred date and time slot. Confirm your booking with a 30% advance payment — safe and secure.',
    delay: 2,
  },
  {
    icon: '🌟',
    title: 'Arrive & Celebrate',
    desc: 'Walk in to your perfectly set-up space. Our team handles everything — you just enjoy every moment of it.',
    delay: 3,
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how" aria-label="How it works">
      <div className="container">
        <div className="how-header reveal">
          <div className="section-label">Simple Process</div>
          <h2 className="section-title">Three Steps to <em>Magic</em></h2>
        </div>
        <div className="how-steps">
          {steps.map(step => (
            <div key={step.title} className={`how-step reveal reveal-delay-${step.delay}`}>
              <div className="how-step-num">
                <span className="how-step-icon">{step.icon}</span>
              </div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
