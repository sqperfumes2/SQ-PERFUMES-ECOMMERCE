import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PageHero({ eyebrow, title, description, crumbs }) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-charcoal to-ink">
      <div className="container-site section-pad py-8 sm:py-12 md:py-16">
        {crumbs}
        {eyebrow ? (
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-gold sm:mb-3 sm:text-xs sm:tracking-[0.28em]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl leading-tight text-ivory sm:text-3xl md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}

const headerMotion = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.6 },
  transition: { duration: 0.55, ease: 'easeOut' },
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  tone = 'gold',
}) {
  const centered = align === 'center'
  const titleClass =
    tone === 'gold'
      ? 'font-display text-xl text-gold sm:text-2xl md:text-4xl'
      : 'font-display text-xl text-ivory sm:text-2xl md:text-4xl'

  if (centered) {
    return (
      <motion.div className="mb-8 text-center md:mb-10" {...headerMotion}>
        {eyebrow ? (
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
        ) : null}
        <h2 className={`${titleClass} text-balance`}>{title}</h2>
        {description ? (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">{description}</p>
        ) : null}
        {action?.to ? (
          <Link to={action.to} className="mt-4 inline-block text-sm text-gold hover:text-gold-bright">
            {action.label}
          </Link>
        ) : null}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between"
      {...headerMotion}
    >
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
        ) : null}
        <h2 className={titleClass}>{title}</h2>
        {description ? <p className="mt-3 max-w-xl text-sm text-muted md:text-base">{description}</p> : null}
      </div>
      {action?.href ? (
        <a
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gold hover:text-gold-bright"
        >
          {action.label}
        </a>
      ) : action?.to ? (
        <Link to={action.to} className="text-sm text-gold hover:text-gold-bright">
          {action.label}
        </Link>
      ) : null}
    </motion.div>
  )
}
