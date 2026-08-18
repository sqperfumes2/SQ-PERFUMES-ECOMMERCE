import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { Badge, Button, Card, EmptyRow, Input, Modal, PageHeader, Select, Table } from '../components/ui'
import { familiesApi, getErrorMessage, productsApi } from '../lib/services'
import { slugify } from '../lib/productHelpers'

export function FamiliesPage() {
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await familiesApi.list()
      setFamilies(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load fragrance families'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (item) => {
    const next = item
      ? { ...item, id: item._id || item.id }
      : { id: '', name: '', slug: '' }
    setEditing(next)
    reset({ name: next.name || '', slug: next.slug || '' })
    setOpen(true)
  }

  const save = async (data) => {
    const payload = { name: data.name, slug: data.slug || slugify(data.name) }
    try {
      if (editing?.id) await familiesApi.update(editing.id, payload)
      else await familiesApi.create(payload)
      toast.success('Family saved')
      setOpen(false)
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save family'))
    }
  }

  const remove = async (item) => {
    try {
      await familiesApi.remove(item._id || item.id)
      toast.success('Family deleted')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete family'))
    }
  }

  return (
    <div>
      <PageHeader
        title="Fragrance families"
        description="Woody, floral, oriental, and other scent families."
        actions={
          <Button onClick={() => openModal(null)}>
            <Plus size={16} /> Add family
          </Button>
        }
      />
      <Card>
        {loading ? (
          <p className="py-8 text-sm text-muted">Loading families…</p>
        ) : families.length ? (
          <Table headers={['Name', 'Slug', 'Actions']}>
            {families.map((item) => (
              <tr key={item._id || item.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-muted">{item.slug}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openModal(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(item)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No fragrance families yet." />
        )}
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Fragrance family">
        <form className="space-y-4" onSubmit={handleSubmit(save)}>
          <Input label="Name" {...register('name', { required: true })} />
          <Input label="Slug" {...register('slug')} />
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

export function InventoryPage() {
  const [rows, setRows] = useState([])
  const [threshold, setThreshold] = useState(8)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [busyKey, setBusyKey] = useState('')

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    try {
      const { data } = await productsApi.inventory()
      setRows(data.data || [])
      setThreshold(data.meta?.lowStockThreshold ?? 8)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load inventory'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (filter === 'low') return row.low
        if (filter === 'out') return row.out
        return true
      }),
    [rows, filter],
  )

  const adjust = async (row, delta) => {
    const key = `${row.productId}-${row.sku}`
    setBusyKey(key)
    try {
      await productsApi.adjustStock(row.productId, { sku: row.sku, delta })
      toast.success(delta > 0 ? `+${delta} stock` : `${delta} stock`)
      await load(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update stock'))
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`Live stock per bottle size from Atlas. Low-stock threshold: ${threshold}.`}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="min-w-40">
            <option value="all">All variants</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </Select>
        }
      />
      <Card>
        {loading ? (
          <p className="px-3 py-8 text-sm text-muted">Loading inventory…</p>
        ) : filtered.length ? (
          <Table headers={['Product', 'Size / SKU', 'Stock', 'Status', 'Quick adjust']}>
            {filtered.map((row) => {
                const key = `${row.productId}-${row.sku}`
                const busy = busyKey === key
                return (
                  <tr key={key} className="border-b border-line last:border-0">
                    <td className="px-3 py-3 font-medium">
                      {row.productName}
                      <p className="text-xs text-muted">Total {row.totalStock}</p>
                    </td>
                    <td className="px-3 py-3">
                      {row.size}
                      <p className="text-xs text-muted">{row.sku}</p>
                    </td>
                    <td className="px-3 py-3">{row.stock}</td>
                    <td className="px-3 py-3">
                      {row.out ? (
                        <Badge tone="danger">Out</Badge>
                      ) : row.low ? (
                        <Badge tone="warning">Low</Badge>
                      ) : (
                        <Badge tone="success">OK</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => adjust(row, 5)}
                        >
                          +5
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy || row.stock <= 0}
                          onClick={() => adjust(row, -1)}
                        >
                          -1
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </Table>
        ) : (
          <EmptyRow message="No products yet. Add stock from Products, then it appears here." />
        )}
      </Card>
    </div>
  )
}
