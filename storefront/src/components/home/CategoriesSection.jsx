import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionHeader } from '../ui/PageHero'
import { cloudinaryUrl } from '../../lib/cloudinary'

export default function CategoriesSection({ homepage, categories = [] }) {
  const tiles = [
    {
      key: 'shop-all',
      name: 'Shop All',
      description: 'Browse the full collection.',
      to: '/shop',
      image: homepage?.shopAllImage || '',
    },
    {
      key: 'best-sellers',
      name: 'Best Sellers',
      description: 'Customer favorites.',
      to: '/shop/best-sellers',
      image: homepage?.bestSellersImage || '',
    },
    ...categories
      .filter((c) => c.showOnHome !== false)
      .map((c) => ({
        key: c.slug,
        name: c.name,
        description: c.description || '',
        to: `/shop/${c.slug}`,
        image: c.image || '',
      })),
  ]

  const compact = tiles.length <= 2

  return (
    <section className="container-site section-pad py-12 sm:py-16 md:py-24">
      <SectionHeader title="Shop by category" align="center" tone="gold" />
      <div
        className={
          compact
            ? 'mx-auto grid max-w-xl grid-cols-1 justify-items-center gap-4 sm:max-w-3xl sm:grid-cols-2 sm:gap-5'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3'
        }
      >
        {tiles.map((tile, index) => (
          <motion.div
            key={tile.key}
            className={compact ? 'w-full max-w-[260px] sm:max-w-none' : 'w-full'}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
          >
            <Link
              to={tile.to}
              className="group relative block aspect-square overflow-hidden border border-border bg-charcoal"
            >
              {tile.image ? (
                <img
                  src={cloudinaryUrl(tile.image, { width: 720 })}
                  alt={tile.name}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width={720}
                  height={720}
                />
              ) : (
                <div className="h-full w-full bg-charcoal" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-display text-xl text-ivory sm:text-2xl">{tile.name}</h3>
                {tile.description ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{tile.description}</p>
                ) : null}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
