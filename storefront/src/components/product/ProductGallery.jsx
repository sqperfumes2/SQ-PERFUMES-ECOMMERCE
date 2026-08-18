import { useState } from 'react'
import { X } from 'lucide-react'
import { cloudinaryUrl } from '../../lib/cloudinary'

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (!images.length) return null

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
      <button
        type="button"
        className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-elevated"
        onClick={() => setZoomed(true)}
        aria-label={`Enlarge image of ${name}`}
      >
        <img
          src={cloudinaryUrl(images[active], { width: 900 })}
          alt={`${name} by SQ Perfumes`}
          className="h-full w-full object-cover object-center"
          width={800}
          height={1000}
          fetchPriority="high"
        />
        <span className="absolute bottom-3 right-3 border border-border bg-ink/70 px-2 py-1 text-[10px] uppercase tracking-widest text-muted backdrop-blur">
          Tap to enlarge
        </span>
      </button>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            className={`h-14 w-12 shrink-0 overflow-hidden border sm:h-16 sm:w-14 ${
              active === index ? 'border-gold' : 'border-border opacity-70 hover:opacity-100'
            }`}
            aria-label={`Show image ${index + 1}`}
          >
            <img src={cloudinaryUrl(src, { width: 160 })} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {zoomed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-3 pb-safe sm:p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close enlarged image"
            onClick={() => setZoomed(false)}
          />
          <button
            type="button"
            className="touch-target absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-sm border border-border bg-charcoal text-ivory hover:text-gold sm:right-4 sm:top-4"
            style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
            onClick={() => setZoomed(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <img
            src={cloudinaryUrl(images[active], { width: 1400 })}
            alt={`${name} enlarged`}
            className="relative z-10 max-h-[88dvh] max-w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  )
}
