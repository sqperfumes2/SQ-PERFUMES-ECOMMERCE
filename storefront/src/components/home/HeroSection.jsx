import Button from '../ui/Button'
import SocialLinks from '../layout/SocialLinks'
import Typewriter from '../ui/Typewriter'
import { cloudinarySrcSet, cloudinaryUrl } from '../../lib/cloudinary'
import { brand } from '../../lib/brand'

const defaultCopy = {
  title: 'SQ Perfumes',
  subtitle:
    'Official SQ Perfumes store — premium perfumes for him, her, and unisex. Lasting eau de parfum, Cash on Delivery across Pakistan.',
  ctaPrimaryLabel: 'Shop All',
  ctaPrimaryHref: '/shop',
  ctaSecondaryLabel: 'New Arrivals',
  ctaSecondaryHref: '/shop/new-arrivals',
}

export default function HeroSection({ homepage }) {
  const image = homepage?.image || ''
  const title = homepage?.title || defaultCopy.title
  const subtitle = homepage?.subtitle || defaultCopy.subtitle
  const ctaPrimaryLabel = homepage?.ctaPrimaryLabel || defaultCopy.ctaPrimaryLabel
  const ctaPrimaryHref = homepage?.ctaPrimaryHref || defaultCopy.ctaPrimaryHref
  const ctaSecondaryLabel = homepage?.ctaSecondaryLabel || defaultCopy.ctaSecondaryLabel
  const ctaSecondaryHref = homepage?.ctaSecondaryHref || defaultCopy.ctaSecondaryHref

  return (
    <section className="relative bg-ink">
      <div className="absolute inset-0 overflow-hidden">
        {image ? (
          <img
            src={cloudinaryUrl(image, { width: 1080 })}
            srcSet={cloudinarySrcSet(image, [640, 960, 1280, 1600])}
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover object-center"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-charcoal" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-ink/60 md:bg-ink/55" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/55" aria-hidden="true" />
      </div>

      <div className="container-site section-pad relative flex min-h-[calc(100dvh-8.5rem)] flex-col items-center justify-start pt-8 pb-14 sm:min-h-[calc(100dvh-9rem)] sm:pt-10 sm:pb-16 md:min-h-[calc(100dvh-8rem)] md:justify-start md:pt-12 md:pb-16 lg:pt-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-1 text-center">
          <h1 className="font-display text-[1.85rem] leading-tight text-gold text-balance xs:text-3xl sm:text-4xl md:text-6xl">
            SQ Perfumes
          </h1>
          {title && title.toLowerCase() !== 'sq perfumes' ? (
            <p className="mt-3 font-display text-xl leading-snug text-ivory sm:text-2xl md:text-3xl">
              {title}
            </p>
          ) : null}
          <Typewriter
            text={subtitle}
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg"
          />
          <div className="mt-14 flex w-full max-w-md flex-col gap-3 sm:mt-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Button to={ctaPrimaryHref} size="lg" className="w-full sm:w-auto">
              {ctaPrimaryLabel}
            </Button>
            <Button
              to={ctaSecondaryHref}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              {ctaSecondaryLabel}
            </Button>
          </div>
          {(brand.socials.instagram || brand.socials.facebook || brand.socials.tiktok) ? (
            <>
              <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-gold sm:mt-6">Follow SQ</p>
              <SocialLinks tone="hero" className="mt-3" />
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
