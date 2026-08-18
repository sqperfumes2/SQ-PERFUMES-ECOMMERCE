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
import ImageUploader from '../components/ImageUploader'
import { categoriesApi, getErrorMessage } from '../lib/services'
import { slugify } from '../lib/productHelpers'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [image, setImage] = useState('')
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm()
  const nameValue = watch('name')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.data || [])
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load categories'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (open && !editing?.id && nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }, [nameValue, open, editing, setValue])

  const openModal = (item) => {
    const next = item
      ? {
          ...item,
          id: item._id || item.id,
          showInNav: item.showInNav !== false,
          showOnHome: item.showOnHome !== false,
        }
      : {
          id: '',
          name: '',
          slug: '',
          description: '',
          status: 'active',
          sortOrder: categories.length,
          showInNav: true,
          showOnHome: true,
        }
    setEditing(next)
    setImage(next.image || '')
    reset({
      name: next.name || '',
      slug: next.slug || '',
      description: next.description || '',
      status: next.status || 'active',
      sortOrder: next.sortOrder ?? 0,
      showInNav: next.showInNav !== false,
      showOnHome: next.showOnHome !== false,
    })
    setOpen(true)
  }

  const onSave = async (form) => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || '',
        status: form.status,
        sortOrder: Number(form.sortOrder || 0),
        showInNav: Boolean(form.showInNav),
        showOnHome: Boolean(form.showOnHome),
        image,
      }
      if (editing?.id) {
        await categoriesApi.update(editing.id, payload)
      } else {
        await categoriesApi.create(payload)
      }
      toast.success('Category saved')
      setOpen(false)
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (item) => {
    if (!window.confirm(`Delete category “${item.name}”?`)) return
    try {
      await categoriesApi.remove(item._id || item.id)
      toast.success('Category deleted')
      load()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Create any categories (Unisex, For Him, For Her, etc.). They appear in the navbar and Shop by category after Shop All + Best Sellers."
        actions={
          <Button onClick={() => openModal(null)}>
            <Plus size={16} /> Add category
          </Button>
        }
      />
      <Card>
        {loading ? (
          <p className="p-4 text-sm text-muted">Loading…</p>
        ) : categories.length ? (
          <Table headers={['Cover', 'Name', 'Slug', 'Nav / Home', 'Status', 'Actions']}>
            {categories.map((item) => (
              <tr key={item._id || item.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-12 w-10 rounded object-cover" />
                  ) : (
                    <span className="text-xs text-muted">No image</span>
                  )}
                </td>
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-muted">{item.slug}</td>
                <td className="px-3 py-3 text-xs text-muted">
                  {item.showInNav !== false ? 'Nav' : '—'} /{' '}
                  {item.showOnHome !== false ? 'Home' : '—'}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={item.status === 'active' ? 'success' : 'neutral'}>{item.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openModal(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(item)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyRow message="No categories yet. Add Unisex (or any name) to start." />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing?.id ? 'Edit category' : 'Add category'}
        wide
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" {...register('name', { required: true })} placeholder="e.g. Unisex" />
            <Input label="Slug (URL)" {...register('slug', { required: true })} placeholder="unisex" />
            <Select label="Status" {...register('status')}>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </Select>
            <Input label="Sort order" type="number" {...register('sortOrder')} />
          </div>
          <TextArea label="Short description" rows={2} {...register('description')} />
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register('showInNav')} />
              Show in navbar
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register('showOnHome')} />
              Show on homepage Shop by category
            </label>
          </div>
          <ImageUploader
            replaceMode
            maxImages={1}
            slot="him"
            images={image ? [image] : []}
            onChange={(urls) => setImage(urls[0] || '')}
            guide={{
              title: 'Category cover',
              bullets: ['Recommended 1200×1500 (4:5)', 'Max 5 MB · Cloudinary'],
            }}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
