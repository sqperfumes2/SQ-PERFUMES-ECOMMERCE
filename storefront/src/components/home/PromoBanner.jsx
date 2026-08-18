import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { promoBanner } from '../../data/content'

export default function PromoBanner() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      {promoBanner.image ? (
        <img
          src={promoBanner.image}
          alt="Seasonal fragrance promotion"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-charcoal" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-ink/75" />
      <div className="container-site section-pad relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold">Limited offer</p>
          <h2 className="font-display text-3xl text-ivory md:text-5xl">{promoBanner.title}</h2>
          <p className="mt-4 text-muted">{promoBanner.subtitle}</p>
          <Link
            to={promoBanner.cta.href}
            className="mt-8 inline-flex border border-gold bg-gold px-6 py-3 text-sm font-medium text-ink hover:bg-gold-bright"
          >
            {promoBanner.cta.label}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
