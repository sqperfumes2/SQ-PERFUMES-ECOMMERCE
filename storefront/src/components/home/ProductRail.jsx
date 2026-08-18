import { motion } from 'framer-motion'
import { SectionHeader } from '../ui/PageHero'
import ProductCard from '../product/ProductCard'
import { useProducts } from '../../hooks/useCatalog'

export default function ProductRail({
  eyebrow,
  title,
  description,
  action,
  apiParams = {},
  filterFn,
  limit = 4,
  minItems = 0,
  onQuickView,
  align = 'left',
  tone = 'gold',
}) {
  const { products, loading } = useProducts({ ...apiParams, limit: 24 })
  const list = (filterFn ? products.filter(filterFn) : products).slice(0, limit)

  if (!loading && minItems > 0 && list.length < minItems) {
    return null
  }

  return (
    <section className="container-site section-pad py-12 sm:py-16 md:py-20">
      <SectionHeader
        title={title}
        description={description}
        action={action}
        align={align}
        tone={tone}
        eyebrow={eyebrow}
      />
      {loading ? (
        <p className="text-sm text-muted">Loading fragrances…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {list.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
            >
              <ProductCard product={product} onQuickView={onQuickView} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
