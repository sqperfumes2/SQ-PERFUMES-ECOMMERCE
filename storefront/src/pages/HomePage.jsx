import { useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import CategoriesSection from '../components/home/CategoriesSection'
import ProductRail from '../components/home/ProductRail'
import WhyChooseUs from '../components/home/WhyChooseUs'
import ReviewsSection from '../components/home/ReviewsSection'
import NewsletterSection from '../components/home/NewsletterSection'
import QuickViewModal from '../components/product/QuickViewModal'
import Seo, { homeJsonLd } from '../components/seo/Seo'
import { brand } from '../lib/brand'
import { useHomepageMedia } from '../hooks/useCatalog'

export default function HomePage() {
  const [quickView, setQuickView] = useState(null)
  const { homepage, categories } = useHomepageMedia()

  return (
    <>
      <Seo
        title="SQ Perfumes | Premium Perfumes in Pakistan"
        description={brand.description}
        path="/"
        jsonLd={homeJsonLd()}
        jsonLdId="home-jsonld"
      />
      <HeroSection homepage={homepage} />
      <CategoriesSection homepage={homepage} categories={categories} />
      {homepage.showBestSellersSection ? (
        <ProductRail
          title="Best Sellers"
          align="center"
          tone="gold"
          apiParams={{ collection: 'best' }}
          filterFn={(p) => p.bestSeller}
          minItems={3}
          onQuickView={setQuickView}
        />
      ) : null}
      {homepage.showNewArrivalsSection ? (
        <ProductRail
          title="New Arrivals"
          align="center"
          tone="gold"
          apiParams={{ collection: 'new' }}
          filterFn={(p) => p.newArrival}
          minItems={3}
          onQuickView={setQuickView}
        />
      ) : null}
      {homepage.showFeaturedSection ? (
        <ProductRail
          title="Featured"
          align="center"
          tone="gold"
          apiParams={{ featured: 'true' }}
          filterFn={(p) => p.featured}
          minItems={3}
          onQuickView={setQuickView}
        />
      ) : null}
      <WhyChooseUs />
      <ReviewsSection />
      <NewsletterSection />
      <QuickViewModal
        product={quickView}
        open={Boolean(quickView)}
        onClose={() => setQuickView(null)}
      />
    </>
  )
}
