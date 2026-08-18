import { motion } from 'framer-motion'
import { SectionHeader } from '../ui/PageHero'

const qualities = [
  {
    title: 'Top notes',
    body: 'The first impression — citrus, spice, or soft florals that open the composition.',
  },
  {
    title: 'Heart notes',
    body: 'The character of the scent — rose, oud, incense, or musk that defines the signature.',
  },
  {
    title: 'Base notes',
    body: 'The lasting trail — woods, amber, vanilla, and musk that remain on skin and fabric.',
  },
]

export default function FragranceQualities() {
  return (
    <section className="container-site section-pad py-16 md:py-20">
      <SectionHeader
        eyebrow="The ritual"
        title="Fragrance qualities"
        description="Every SQ Perfumes bottle is built in three acts — opening, heart, and lasting trail."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {qualities.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border border-border p-6"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-gold">0{index + 1}</p>
            <h3 className="mt-3 font-display text-2xl text-ivory">{item.title}</h3>
            <p className="mt-3 text-sm text-muted">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
