import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
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
import { formatDate, formatPrice } from '../lib/utils'
import {
  contentApi,
  couponsApi,
  getErrorMessage,
  productsApi,
  reviewsApi,
} from '../lib/services'

function itemId(item) {
  return item._id || item.id
}

function dateInputValue(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

export function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await couponsApi.list()
      setCoupons(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load coupons'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (item) => {
    const next = item
      ? { ...item, id: itemId(item), expires: dateInputValue(item.expires) }
      : {
          id: '',
          code: '',
          type: 'percent',
          value: 10,
          usageLimit: 100,
          used: 0,
          status: 'active',
          expires: '',
        }
    setEditing(next)
    reset(next)
    setOpen(true)
  }

  const save = async (data) => {
    const payload = {
      code: data.code,
      type: data.type,
      value: Number(data.value),
      usageLimit: Number(data.usageLimit),
      status: data.status,
      expires: data.expires,
    }
    try {
      if (editing?.id) await couponsApi.update(editing.id, payload)
      else await couponsApi.create(payload)
      toast.success('Coupon saved')
      setOpen(false)
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save coupon'))
    }
  }

  const remove = async (coupon) => {
    try {
      await couponsApi.remove(itemId(coupon))
      toast.success('Coupon deleted')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete coupon'))
    }
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Discount and free-shipping codes for the storefront."
        actions={
          <Button onClick={() => openModal(null)}>
            <Plus size={16} /> Add coupon
          </Button>
        }
      />
      <Card>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading coupons…</p>
        ) : coupons.length ? (
          <Table headers={['Code', 'Type', 'Value', 'Usage', 'Expires', 'Status', 'Actions']}>
            {coupons.map((coupon) => (
              <tr key={itemId(coupon)} className="border-b border-line last:border-0">
                <td className="px-3 py-3 font-medium">{coupon.code}</td>
                <td className="px-3 py-3 capitalize">{coupon.type}</td>
                <td className="px-3 py-3">
                  {coupon.type === 'percent'
                    ? `${coupon.value}%`
                    : coupon.type === 'shipping'
                      ? 'Free ship'
                      : formatPrice(coupon.value)}
                </td>
                <td className="px-3 py-3">
                  {coupon.used}/{coupon.usageLimit}
                </td>
                <td className="px-3 py-3">{formatDate(coupon.expires)}</td>
                <td className="px-3 py-3">
                  <Badge tone={coupon.status === 'active' ? 'success' : 'neutral'}>{coupon.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openModal(coupon)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(coupon)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No coupons yet." />
        )}
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Coupon">
        <form className="space-y-4" onSubmit={handleSubmit(save)}>
          <Input label="Code" {...register('code', { required: true })} />
          <Select label="Type" {...register('type')}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
            <option value="shipping">Free shipping</option>
          </Select>
          <Input label="Value" type="number" {...register('value', { required: true })} />
          <Input label="Usage limit" type="number" {...register('usageLimit', { required: true })} />
          <Input label="Expires" type="date" {...register('expires', { required: true })} />
          <Select label="Status" {...register('status')}>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function CampaignsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await productsApi.list({ limit: 100 })
      setProducts(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load products'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (product, key) => {
    try {
      await productsApi.patchFlags(product._id || product.id, { [key]: !product[key] })
      toast.success('Merchandising updated')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update product'))
    }
  }

  return (
    <div>
      <PageHeader
        title="Merchandising"
        description="Control which live products appear as Featured, Best sellers, or New arrivals."
      />
      <Card>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading products…</p>
        ) : products.length ? (
          <Table headers={['Product', 'Featured', 'Best seller', 'New arrival']}>
            {products.map((product) => (
              <tr key={product._id || product.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3 font-medium">{product.name}</td>
                {['featured', 'bestSeller', 'newArrival'].map((key) => (
                  <td key={key} className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(product[key])}
                      onChange={() => toggle(product, key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="Add products first, then flag them here." />
        )}
      </Card>
    </div>
  )
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await reviewsApi.list()
      setReviews(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load reviews'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const moderate = async (review, status) => {
    try {
      await reviewsApi.moderate(itemId(review), { status })
      toast.success(`Review ${status}`)
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update review'))
    }
  }

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews before they appear publicly." />
      <Card>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading reviews…</p>
        ) : reviews.length ? (
          <Table headers={['Product', 'Customer', 'Rating', 'Review', 'Status', 'Actions']}>
            {reviews.map((review) => (
              <tr key={itemId(review)} className="border-b border-line last:border-0 align-top">
                <td className="px-3 py-3 font-medium">{review.product?.name || '—'}</td>
                <td className="px-3 py-3">
                  {review.customerName}
                  <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                </td>
                <td className="px-3 py-3">{review.rating}/5</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{review.title}</p>
                  <p className="text-muted">{review.body}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    tone={
                      review.status === 'approved'
                        ? 'success'
                        : review.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {review.status}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => moderate(review, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => moderate(review, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No reviews yet." />
        )}
      </Card>
    </div>
  )
}

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentApi
      .newsletter()
      .then(({ data }) => setSubscribers(data.data || []))
      .catch((error) => toast.error(getErrorMessage(error, 'Failed to load subscribers')))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Newsletter subscribers" description="Emails captured from the storefront form." />
      <Card>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading subscribers…</p>
        ) : subscribers.length ? (
          <Table headers={['Email', 'Joined']}>
            {subscribers.map((sub) => (
              <tr key={itemId(sub)} className="border-b border-line last:border-0">
                <td className="px-3 py-3 font-medium">{sub.email}</td>
                <td className="px-3 py-3">{formatDate(sub.createdAt)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No subscribers yet." />
        )}
      </Card>
    </div>
  )
}

export function InquiriesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contentApi.inquiries()
      setMessages(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load inquiries'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markReplied = async (msg) => {
    try {
      await contentApi.updateInquiry(itemId(msg), { status: 'replied' })
      toast.success('Marked as replied')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update inquiry'))
    }
  }

  return (
    <div>
      <PageHeader title="Contact inquiries" description="Messages submitted through Contact Us." />
      {loading ? (
        <p className="text-sm text-muted">Loading inquiries…</p>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <Card key={itemId(msg)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{msg.subject || 'Inquiry'}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {msg.name} · {msg.email} {msg.phone ? `· ${msg.phone}` : ''} ·{' '}
                    {formatDate(msg.createdAt)}
                  </p>
                  <p className="mt-3 text-sm">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={msg.status === 'open' ? 'warning' : 'success'}>{msg.status}</Badge>
                  {msg.status === 'open' ? (
                    <Button size="sm" variant="secondary" onClick={() => markReplied(msg)}>
                      Mark replied
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
          {!messages.length ? <EmptyRow message="No inquiries yet." /> : null}
        </div>
      )}
    </div>
  )
}

export function ContentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { about: '', announcement: '', tagline: '' },
  })

  useEffect(() => {
    contentApi
      .settings()
      .then(({ data }) => {
        const s = data.data || {}
        reset({
          about: s.about || '',
          announcement: s.announcement || '',
          tagline: s.tagline || '',
        })
      })
      .catch((error) => toast.error(getErrorMessage(error, 'Failed to load content')))
      .finally(() => setLoading(false))
  }, [reset])

  const onSave = async (data) => {
    setSaving(true)
    try {
      await contentApi.updateSettings(data)
      toast.success('Content saved')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save content'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Website content" description="Tagline, announcement bar, and about text on the storefront." />
      <Card>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
            <Input label="Tagline" {...register('tagline')} />
            <TextArea label="Announcement bar" rows={2} {...register('announcement')} />
            <TextArea label="About the brand" rows={5} {...register('about')} />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save content'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
