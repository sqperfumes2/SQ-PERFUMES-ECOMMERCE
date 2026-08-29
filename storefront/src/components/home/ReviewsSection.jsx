import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { SectionHeader } from '../ui/PageHero'
import StarRating from '../ui/StarRating'
import { storeApi } from '../../lib/services'
import { featuredReviews, mergeStorefrontReviews, reviewInitials } from '../../data/reviews'

export default function ReviewsSection() {
  const [apiReviews, setApiReviews] = useState([])

  useEffect(() => {
    let alive = true
    storeApi
      .reviews()
      .then(({ data }) => {
        if (alive) setApiReviews(data.data || [])
      })
      .catch(() => {
        if (alive) setApiReviews([])
      })
    return () => {
      alive = false
    }
  }, [])

  const reviews = useMemo(() => mergeStorefrontReviews(apiReviews, 6), [apiReviews])
  const average =
    reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / (reviews.length || 1)

  return (
    <section className="border-y border-border bg-charcoal/40">
      <div className="container-site section-pad py-12 sm:py-16 md:py-20">
        <SectionHeader
          eyebrow="Loved in Pakistan"
          title="Customer reviews"
          description="Four and five star notes from customers in Karachi, Lahore, Islamabad, and across the country."
          align="center"
        />

        <div className="mb-8 flex flex-col items-center gap-2 sm:mb-10">
          <div className="flex items-center gap-3">
            <p className="font-display text-3xl text-ivory sm:text-4xl">{average.toFixed(1)}</p>
            <div className="text-left">
              <StarRating rating={average} size={16} />
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                {reviews.length} verified reviews
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, index) => {
            const urdu = review.locale === 'ur'
            const city = review.city || review.product?.name
            return (
              <motion.blockquote
                key={review._id || review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex h-full flex-col border border-border bg-ink/50 p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <StarRating rating={review.rating} />
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-gold">
                    <BadgeCheck size={13} strokeWidth={1.6} />
                    Verified
                  </span>
                </div>
                <p
                  className={`mt-4 text-lg text-ivory sm:text-xl ${urdu ? 'font-urdu text-right' : 'font-display'}`}
                  lang={urdu ? 'ur' : 'en'}
                  dir={urdu ? 'rtl' : 'ltr'}
                >
                  {review.title}
                </p>
                <p
                  className={`mt-3 flex-1 text-sm leading-relaxed text-muted ${urdu ? 'font-urdu text-right text-[15px] leading-8' : ''}`}
                  lang={urdu ? 'ur' : 'en'}
                  dir={urdu ? 'rtl' : 'ltr'}
                >
                  “{review.body}”
                </p>
                <footer className="mt-5 flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-charcoal text-[11px] uppercase tracking-[0.08em] text-gold"
                    aria-hidden="true"
                  >
                    {reviewInitials(review.customerName)}
                  </span>
                  <div>
                    <p className="text-sm text-ivory">{review.customerName}</p>
                    {city ? (
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">{city}</p>
                    ) : null}
                  </div>
                </footer>
              </motion.blockquote>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { featuredReviews }
