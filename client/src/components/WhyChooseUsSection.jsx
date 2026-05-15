import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const pillars = [
  {
    icon: '✦',
    title: 'Private by design',
    body: 'Every setup is yours alone — no shared halls, no rushed turnovers, no wandering crowds.',
  },
  {
    icon: '🎬',
    title: 'Cinematic craft',
    body: 'Lighting, scent, sound, and flow choreographed like a scene — not a checklist.',
  },
  {
    icon: '🛡️',
    title: 'White-glove coordination',
    body: 'We handle vendors, timing, and surprises so you stay present for the people you love.',
  },
  {
    icon: '💎',
    title: 'Transparent luxury',
    body: 'Clear packages and add-ons with no hidden fees — premium quality without the anxiety.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function WhyChooseUsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="why-us"
      className="relative border-y border-[rgba(201,168,76,0.1)] bg-gradient-to-b from-vn-black to-[#07071A] py-20 sm:py-28"
      aria-label="Why choose us"
    >
      <div className="container relative">
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label justify-center">The Velvet standard</div>
          <h2 className="section-title">
            Why hosts <em>trust us</em>
          </h2>
          <p className="section-subtitle mx-auto max-w-xl text-[var(--text-secondary)]">
            We obsess over atmosphere, discretion, and the tiny details that turn a room into a memory.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-5 md:grid-cols-2"
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {pillars.map((p) => (
            <motion.article
              key={p.title}
              variants={card}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(200,168,75,0.10)] bg-[rgba(10,8,24,0.60)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 ease-luxury hover:border-[rgba(201,168,76,0.3)] hover:shadow-glow-gold sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[rgba(200,168,75,0.06)] blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.06)] text-xl text-gold-light shadow-inner">
                {p.icon}
              </div>
              <h3 className="font-display mb-2 text-2xl text-[var(--text-primary)]">{p.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">{p.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
