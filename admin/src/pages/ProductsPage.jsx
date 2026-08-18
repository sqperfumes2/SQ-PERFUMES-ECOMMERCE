import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Copy, ExternalLink, Plus } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyRow,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  TextArea,
} from '../components/ui'
import ImageUploader from '../components/ImageUploader'
import { formatPrice, formatDate } from '../lib/utils'
import { productsApi, getErrorMessage } from '../lib/services'
import {
  audienceLabel,
  fromApiProduct,
  isSoldOut,
  slugify,
  toProductPayload,
  totalStock,
} from '../lib/productHelpers'

const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'

const emptyProduct = {
  id: '',
  name: '',
  slug: '',
  sku: '',
  gender: 'men',
  fragranceFamily: 'oriental',
  status: 'active',
  featured: false,
  bestSeller: false,
  newArrival: false,
  onSale: false,
  shortDescription: '',
  description: '',
  topNotes: '',
  middleNotes: '',
  baseNotes: '',
  occasion: '',
  longevity: '',
  sillage: '',
  images: [],
  variants: [
    { size: '30ml', sku: '', price: 5000, compareAtPrice: '', stock: 10 },
  ],
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await productsApi.list({ limit: 100 })
      setProducts((data.data || []).map(fromApiProduct))
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load products'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        audienceLabel(p.gender).toLowerCase().includes(q),
    )
  }, [products, query])

  const openCreate = () => {
    setEditing({ ...emptyProduct })
    setOpen(true)
  }

  const openEdit = (product) => {
    setEditing({ ...product })
    setOpen(true)
  }

  const duplicateProduct = (product) => {
    const copy = { ...product }
    setEditing({
      ...copy,
      id: '',
      _id: undefined,
      name: `${copy.name} Copy`,
      slug: `${copy.slug}-copy`,
      sku: `${copy.sku}-COPY`,
      variants: copy.variants.map((v) => ({
        ...v,
        sku: `${v.sku}-COPY`,
      })),
    })
    setOpen(true)
  }

  const handleArchive = async (product) => {
    try {
      await productsApi.archive(product.id || product._id)
      toast.success(product.status === 'archived' ? 'Product restored' : 'Product archived')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Permanently delete "${product.name}"? Prefer Archive when possible.`)) return
    try {
      await productsApi.remove(product.id || product._id)
      toast.success('Product deleted')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const markSoldOut = async (product) => {
    try {
      await productsApi.setSoldOut(product.id || product._id, true)
      toast.success('Marked as sold out')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const markUnsold = async (product) => {
    try {
      await productsApi.setSoldOut(product.id || product._id, false)
      toast.success('Product is available again')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = toProductPayload(form)
      if (form.id || form._id) {
        await productsApi.update(form.id || form._id, payload)
        toast.success('Product updated')
      } else {
        await productsApi.create(payload)
        toast.success('Product created')
      }
      setOpen(false)
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save product'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Add fragrances, set Actual vs Discounted prices, badges, stock, and images."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add product
          </Button>
        }
      />

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by name, SKU, or audience (For Him / For Her)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Loading products…</p>
        ) : filtered.length ? (
          <Table headers={['Product', 'Audience', 'Pricing', 'Stock', 'Flags', 'Actions']}>
            {filtered.map((product) => {
              const soldOut = isSoldOut(product)
              const minPrice = Math.min(...product.variants.map((v) => v.price))
              const maxCompare = Math.max(
                ...product.variants.map((v) => v.compareAtPrice || 0),
                0,
              )
              return (
                <tr key={product.id || product._id} className="border-b border-line last:border-0 align-top">
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      <img
                        src={product.images?.[0] || product.image}
                        alt=""
                        className="h-12 w-12 rounded object-cover bg-canvas"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted">{product.sku}</p>
                        <a
                          href={`${storefrontUrl}/product/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-gold hover:underline"
                        >
                          Preview <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {audienceLabel(product.gender)}
                    <p className="text-xs text-muted">{product.fragranceFamily}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">{formatPrice(minPrice)}</p>
                    {maxCompare > minPrice ? (
                      <p className="text-xs text-muted line-through">{formatPrice(maxCompare)}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    {soldOut ? (
                      <Badge tone="danger">Sold out</Badge>
                    ) : (
                      <span>{totalStock(product)}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={product.status === 'active' ? 'success' : 'neutral'}>
                        {product.status}
                      </Badge>
                      {product.bestSeller ? <Badge tone="info">Best seller</Badge> : null}
                      {product.featured ? <Badge tone="gold">Featured</Badge> : null}
                      {product.newArrival ? <Badge tone="warning">New</Badge> : null}
                      {product.onSale ? <Badge tone="danger">Sale</Badge> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateProduct(product)}>
                        <Copy size={14} />
                      </Button>
                      {!soldOut ? (
                        <Button size="sm" variant="ghost" onClick={() => markSoldOut(product)}>
                          Sold out
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => markUnsold(product)}>
                          Unsold
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleArchive(product)}>
                        {product.status === 'archived' ? 'Restore' : 'Archive'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(product)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </Table>
        ) : (
          <EmptyRow message="No products yet. Add your first fragrance." />
        )}
      </Card>

      <ProductFormModal
        open={open}
        product={editing}
        saving={saving}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

function ProductFormModal({ open, product, onClose, onSave, saving }) {
  const { register, control, handleSubmit, watch, setValue, reset } = useForm({
    values: product || emptyProduct,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const nameValue = watch('name')
  const images = watch('images') || []

  useEffect(() => {
    if (!product?.id && !product?._id && nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }, [nameValue, product, setValue])

  if (!product) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.id || product._id ? `Edit ${product.name}` : 'Add product'}
      wide
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Product name" {...register('name', { required: true })} />
          <Input label="Slug (URL)" {...register('slug', { required: true })} />
          <Input label="SKU" {...register('sku', { required: true })} />
          <Select label="Audience / category" {...register('gender')}>
            <option value="unisex">Unisex</option>
            <option value="men">For Him</option>
            <option value="women">For Her</option>
          </Select>
          <p className="text-xs text-muted sm:col-span-2">
            Tip: create custom shop categories under <strong>Categories</strong>. Assign products as
            Unisex / For Him / For Her here; category pages filter by that audience slug.
          </p>
          <Input label="Fragrance family" {...register('fragranceFamily', { required: true })} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active (visible in shop)</option>
            <option value="archived">Archived (hidden)</option>
          </Select>
        </div>

        <TextArea label="Short description" rows={2} {...register('shortDescription')} />
        <TextArea label="Full description" rows={4} {...register('description')} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Top notes (comma separated)" {...register('topNotes')} />
          <Input label="Heart notes" {...register('middleNotes')} />
          <Input label="Base notes" {...register('baseNotes')} />
        </div>

        <ImageUploader
          slot="product"
          images={images}
          onChange={(next) => setValue('images', next, { shouldDirty: true })}
          guide={{
            title: 'Product images',
            bullets: [
              'Recommended: 1200×1500 px (4:5 portrait), up to 1600×2000',
              'Max 5 MB each · JPG/WebP · Stored on Cloudinary so they stay after deploys',
              'First image is primary on shop cards and product page',
            ],
          }}
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register('bestSeller')} />
            Best seller
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register('featured')} />
            Featured on homepage
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register('newArrival')} />
            New arrival
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register('onSale')} />
            On sale badge
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Bottle sizes & pricing</h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                append({ size: '50ml', sku: '', price: 0, compareAtPrice: '', stock: 0 })
              }
            >
              Add size
            </Button>
          </div>
          <p className="mb-3 text-xs text-muted">
            <strong>Discounted price</strong> is what customers pay.{' '}
            <strong>Actual price</strong> (optional) shows struck through when higher.
            Set stock to 0 to mark that size sold out.
          </p>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-6"
              >
                <Input label="Size" {...register(`variants.${index}.size`, { required: true })} />
                <Input label="SKU" {...register(`variants.${index}.sku`, { required: true })} />
                <Input
                  label="Discounted price"
                  type="number"
                  {...register(`variants.${index}.price`, { required: true })}
                />
                <Input
                  label="Actual price"
                  type="number"
                  placeholder="Optional"
                  {...register(`variants.${index}.compareAtPrice`)}
                />
                <Input
                  label="Stock"
                  type="number"
                  {...register(`variants.${index}.stock`, { required: true })}
                />
                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => remove(index)}>
                    Remove size
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset(product)
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
