import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { THEME_DATA } from '../themeData';

export default function ThemeDetailPage({ onBook }) {
  const { themeKey } = useParams();
  const navigate = useNavigate();
  const d = THEME_DATA[themeKey];

  if (!d) return <div style={{ color: '#fff', padding: '4rem', textAlign: 'center' }}>Theme not found. <button onClick={() => navigate('/')}>Go Home</button></div>;

  return (
    <div style={{ background: '#0B0B0F', minHeight: '100vh', color: '#F5F5F5', padding: '2rem 1.5rem 5rem' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '8px 20px', borderRadius: 999, cursor: 'pointer', marginBottom: '2rem', fontFamily: 'inherit' }}>
        ← Back
      </button>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h1
          style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {d.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </motion.h1>
        <p style={{ color: '#9CA3AF', marginBottom: '2rem', maxWidth: 600 }}>{d.tagline}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12, marginBottom: '3rem' }}>
          {d.gallery.map((item, i) => (
            <motion.div
              key={i}
              style={{ aspectRatio: '1', background: '#15151D', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              {item.src ? (
                <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '3rem' }}>{item.emoji}</span>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#D4AF37', marginBottom: '1rem', textTransform: 'uppercase' }}>What's included</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {d.includes.map((item) => (
                <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: '#9CA3AF' }}>
                  <span style={{ color: '#D4AF37' }}>✦</span> {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#15151D', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(212,175,55,0.15)' }}>
            <div style={{ fontSize: '2rem', fontFamily: '"Playfair Display",serif', color: '#D4AF37' }}>{d.price}</div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1rem' }}>{d.priceNote}</div>
            <button
              onClick={() => onBook(themeKey)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #C9A84C, #D4AF37)', color: '#0B0B0F', border: 'none', padding: '14px', borderRadius: 999, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
            >
              ✦ Reserve This Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
