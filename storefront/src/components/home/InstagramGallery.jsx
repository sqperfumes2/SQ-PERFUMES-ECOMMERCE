import { motion } from 'framer-motion'
import { SectionHeader } from '../ui/PageHero'
import { galleryImages } from '../../data/content'
import { brand } from '../../lib/brand'

export default function InstagramGallery() {
  return (
    <section className="container-site section-pad py-16 md:py-20">
      <SectionHeader
        eyebrow="Gallery"
        title="On the feed"
        description="A glimpse of the SQ Perfumes world — bottles, rituals, and evening light."
        action={
          brand.socials.instagram
            ? { href: brand.socials.instagram, label: '@sqperfumes' }
            : undefined
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {galleryImages.map((image, index) => (
          <motion.a
            key={image.id}
            href={brand.socials.instagram}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-square overflow-hidden border border-border"
          >
            {image.src ? (
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-charcoal" aria-hidden="true" />
            )}
          </motion.a>
        ))}
      </div>
    </section>
  )
}
