/**
 * SceneText — editorial-style text block for the hero scene.
 *
 * Props:
 *   eyebrow  {string}  small uppercase label above main text
 *   heading  {string}  large display heading
 *   visible  {boolean} drives entrance animation
 */
export default function SceneText({ eyebrow, heading, visible = false }) {
  return (
    <div style={styles.wrapper}>
      {eyebrow && (
        <p
          style={{
            ...styles.eyebrow,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
          }}
        >
          {eyebrow}
        </p>
      )}

      {heading && (
        <h2
          style={{
            ...styles.heading,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
          }}
        >
          {heading}
        </h2>
      )}

      {/* Thin rule */}
      <div
        style={{
          ...styles.rule,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 1s cubic-bezier(0.16,1,0.3,1) 0.7s',
        }}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  eyebrow: {
    margin: 0,
    fontFamily: '"DM Mono", "Courier New", monospace',
    fontSize: 'clamp(9px, 1vw, 11px)',
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    willChange: 'opacity, transform',
  },
  heading: {
    margin: 0,
    fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    fontSize: 'clamp(32px, 6vw, 72px)',
    fontWeight: 300,
    lineHeight: 1.12,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: '-0.01em',
    maxWidth: '14ch',
    willChange: 'opacity, transform',
  },
  rule: {
    height: 1,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transformOrigin: 'left center',
    marginTop: 8,
  },
};
