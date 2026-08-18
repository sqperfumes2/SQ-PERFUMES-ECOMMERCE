import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button, Card, Input, PageHeader, TextArea } from '../components/ui'
import ImageUploader from '../components/ImageUploader'
import { contentApi, getErrorMessage } from '../lib/services'

const defaultHomepage = {
  image: '',
  eyebrow: 'SQ Perfumes',
  title: 'Crafted for lasting presence',
  subtitle:
    'Discover the SQ Perfumes collection — refined perfume oils and eau de parfum in black and gold.',
  ctaPrimaryLabel: 'Shop All',
  ctaPrimaryHref: '/shop',
  ctaSecondaryLabel: 'New Arrivals',
  ctaSecondaryHref: '/shop/new-arrivals',
  shopAllImage: '',
  bestSellersImage: '',
  showBestSellersSection: false,
  showNewArrivalsSection: false,
  showFeaturedSection: false,
}

export default function HomepageMediaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [heroImage, setHeroImage] = useState('')
  const [shopAllImage, setShopAllImage] = useState('')
  const [bestSellersImage, setBestSellersImage] = useState('')
  const [categories, setCategories] = useState([])
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: defaultHomepage })

  const showBest = watch('showBestSellersSection')
  const showNew = watch('showNewArrivalsSection')
  const showFeatured = watch('showFeaturedSection')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data } = await contentApi.getHomepage()
        if (!active) return
        const hp = { ...defaultHomepage, ...(data.data?.homepage || {}) }
        reset({
          ...hp,
          showBestSellersSection: Boolean(hp.showBestSellersSection),
          showNewArrivalsSection: Boolean(hp.showNewArrivalsSection),
          showFeaturedSection: Boolean(hp.showFeaturedSection),
        })
        setHeroImage(hp.image || '')
        setShopAllImage(hp.shopAllImage || '')
        setBestSellersImage(hp.bestSellersImage || '')
        setCategories(data.data?.categories || [])
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load homepage media'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [reset])

  const onSave = async (form) => {
    if (!shopAllImage) {
      toast.error('Shop All cover image is required')
      return
    }
    if (!bestSellersImage) {
      toast.error('Best Sellers cover image is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        homepage: {
          ...form,
          image: heroImage,
          shopAllImage,
          bestSellersImage,
          showBestSellersSection: Boolean(form.showBestSellersSection),
          showNewArrivalsSection: Boolean(form.showNewArrivalsSection),
          showFeaturedSection: Boolean(form.showFeaturedSection),
        },
      }
      const { data } = await contentApi.updateHomepage(payload)
      const hp = { ...defaultHomepage, ...(data.data?.homepage || {}) }
      reset({
        ...hp,
        showBestSellersSection: Boolean(hp.showBestSellersSection),
        showNewArrivalsSection: Boolean(hp.showNewArrivalsSection),
        showFeaturedSection: Boolean(hp.showFeaturedSection),
      })
      setHeroImage(hp.image || '')
      setShopAllImage(hp.shopAllImage || '')
      setBestSellersImage(hp.bestSellersImage || '')
      setCategories(data.data?.categories || [])
      toast.success('Homepage media saved')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading homepage media…</p>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Media"
        description="Hero, Shop by category covers, and which product rails appear on the storefront."
      />

      <Card className="space-y-4 p-5">
        <ImageUploader
          replaceMode
          maxImages={1}
          slot="hero"
          images={heroImage ? [heroImage] : []}
          onChange={(urls) => setHeroImage(urls[0] || '')}
          guide={{
            title: 'Home page background',
            bullets: [
              'Recommended: 1920×1080 px (16:9)',
              'Max 5 MB · JPG/WebP · Cloudinary',
            ],
          }}
        />
      </Card>

      <Card className="p-5">
        <form className="space-y-6" onSubmit={handleSubmit(onSave)}>
          <div>
            <h3 className="text-sm font-medium text-ink">Hero text (centered)</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input label="Headline" {...register('title', { required: true })} />
              <Input label="Primary button label" {...register('ctaPrimaryLabel')} />
              <Input label="Primary button link" {...register('ctaPrimaryHref')} />
              <Input label="Secondary button label" {...register('ctaSecondaryLabel')} />
              <Input label="Secondary button link" {...register('ctaSecondaryHref')} />
            </div>
            <div className="mt-4">
              <TextArea label="Subtitle" rows={3} {...register('subtitle')} />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-ink">Shop by category cards</h3>
            <p className="mb-4 text-xs text-muted">
              Fixed first two cards: <strong>Shop All</strong> and <strong>Best Sellers</strong> (covers
              required). Extra cards come from Categories you create (e.g. Unisex, For Him).
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-line p-4">
                <ImageUploader
                  replaceMode
                  maxImages={1}
                  slot="hero"
                  images={shopAllImage ? [shopAllImage] : []}
                  onChange={(urls) => setShopAllImage(urls[0] || '')}
                  guide={{
                    title: 'Shop All cover (required)',
                    bullets: ['1200×1500 (4:5)', 'Links to /shop'],
                  }}
                />
              </div>
              <div className="rounded-xl border border-line p-4">
                <ImageUploader
                  replaceMode
                  maxImages={1}
                  slot="product"
                  images={bestSellersImage ? [bestSellersImage] : []}
                  onChange={(urls) => setBestSellersImage(urls[0] || '')}
                  guide={{
                    title: 'Best Sellers cover (required)',
                    bullets: ['1200×1500 (4:5)', 'Links to /shop/best-sellers'],
                  }}
                />
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-line bg-canvas/60 p-4 text-sm">
              <p className="font-medium text-ink">Your category cards</p>
              {categories.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {categories.map((c) => (
                    <li key={c._id || c.slug}>
                      {c.name} ({c.slug}){c.image ? '' : ' — add cover in Categories'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">
                  No custom categories yet.{' '}
                  <Link to="/categories" className="text-gold hover:underline">
                    Create categories
                  </Link>{' '}
                  (e.g. Unisex) with a cover image.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-ink">Homepage product sections</h3>
            <p className="mb-3 text-xs text-muted">
              When enabled, a section only appears if at least <strong>3</strong> matching products are
              tagged (Best Seller / New / Featured on Products).
            </p>
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-3 rounded-lg border border-line p-3">
                <input type="checkbox" className="mt-1" {...register('showBestSellersSection')} />
                <span>
                  <span className="font-medium text-ink">Show Best Sellers section</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {showBest ? 'On — needs ≥3 products marked Best Seller' : 'Off'}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-line p-3">
                <input type="checkbox" className="mt-1" {...register('showNewArrivalsSection')} />
                <span>
                  <span className="font-medium text-ink">Show New Arrivals section</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {showNew ? 'On — needs ≥3 products marked New' : 'Off'}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-line p-3">
                <input type="checkbox" className="mt-1" {...register('showFeaturedSection')} />
                <span>
                  <span className="font-medium text-ink">Show Featured section</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {showFeatured ? 'On — needs ≥3 products marked Featured' : 'Off'}
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save homepage media'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
