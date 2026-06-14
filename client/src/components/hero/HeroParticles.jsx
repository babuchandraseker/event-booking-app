import { useEffect, useRef } from 'react'

/** Soft ambient particles for hero atmosphere */
export default function HeroParticles() {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return undefined
    const ctx = c.getContext('2d')
    const resize = () => {
      c.width = c.offsetWidth
      c.height = c.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let raf
    let lastTs = 0
    const FRAME_INTERVAL = 1000 / 30 // cap at ~30fps — visually identical, half the CPU cost
    const pts = Array.from({ length: 64 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.08,
      dy: (Math.random() - 0.5) * 0.06,
      a: Math.random() * 0.35 + 0.08,
      ph: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.4,
    }))

    const draw = (ts) => {
      raf = requestAnimationFrame(draw)
      if (document.hidden) return
      if (ts - lastTs < FRAME_INTERVAL) return
      lastTs = ts
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach((p) => {
        p.ph += 0.01
        const a = p.a * (0.5 + 0.5 * Math.sin(p.ph))
        ctx.beginPath()
        ctx.arc(p.x % c.width, p.y % c.height, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(215,172,40,${a * 0.95})`
          : `rgba(130,56,179,${a * 0.4})`
        ctx.fill()
        p.x += p.dx * 2
        p.y += p.dy * 2
        if (p.x > c.width + 2) p.x = -2
        if (p.x < -2) p.x = c.width + 2
        if (p.y > c.height + 2) p.y = -2
        if (p.y < -2) p.y = c.height + 2
      })
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="cinematic-hero__particles" aria-hidden />
}
