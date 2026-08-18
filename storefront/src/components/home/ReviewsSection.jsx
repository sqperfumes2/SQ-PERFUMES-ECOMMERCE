import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHeader } from '../ui/PageHero'
import StarRating from '../ui/StarRating'
import { storeApi } from '../../lib/services'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let alive = true
    storeApi
      .reviews()
      .then(({ data }) => {
        if (alive) setReviews((data.data || []).slice(0, 3))
      })
      .catch(() => {
        if (alive) setReviews([])
      })
    return () => {
      alive = false
    }
  }, [])

  if (!reviews.length) return null

  return (
    <section className="border-y border-border bg-charcoal/40">
      <div className="container-site section-pad py-12 sm:py-16 md:py-20">
        <SectionHeader
          title="Customer reviews"
          description="Approved reviews from SQ Perfumes customers."
          align="center"
        />
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.blockquote
              key={review._id || review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="border border-border bg-ink/50 p-5 sm:p-6"
            >
              <StarRating rating={review.rating} />
              <p className="mt-4 font-display text-lg text-ivory sm:text-xl">{review.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">“{review.body}”</p>
              <footer className="mt-5 text-xs uppercase tracking-[0.16em] text-gold">
                {review.customerName}
                {review.product?.name ? ` · ${review.product.name}` : ''}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
