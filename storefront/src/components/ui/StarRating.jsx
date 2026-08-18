import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, size = 14, showValue = false }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5

  return (
    <div className="inline-flex items-center gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf)
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'fill-gold text-gold' : 'text-muted/40'}
            strokeWidth={1.5}
          />
        )
      })}
      {showValue ? <span className="ml-1 text-xs text-muted">{rating.toFixed(1)}</span> : null}
    </div>
  )
}
