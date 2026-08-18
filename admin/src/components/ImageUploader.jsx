import { useCallback, useRef, useState } from 'react'
import { ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentApi, getErrorMessage } from '../lib/services'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_BYTES = 5 * 1024 * 1024

/**
 * @param {object} props
 * @param {string[]} props.images
 * @param {(urls: string[]) => void} props.onChange
 * @param {number} [props.maxImages]
 * @param {string} [props.slot] Cloudinary/upload slot: hero|him|her|unisex|product
 * @param {{ title?: string, bullets?: string[] }} [props.guide]
 * @param {boolean} [props.replaceMode] If true, new upload replaces existing (max 1 typical)
 */
export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 8,
  slot = 'product',
  guide,
  replaceMode = false,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const setImages = useCallback(
    (next) => {
      onChange(next)
    },
    [onChange],
  )

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    const remaining = replaceMode ? files.length : maxImages - images.length
    if (!replaceMode && remaining <= 0) {
      toast.error(`Maximum ${maxImages} images`)
      return
    }

    const selected = replaceMode ? files.slice(0, 1) : files.slice(0, remaining)
    setUploading(true)
    const uploaded = []

    try {
      for (const file of selected) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is over 5 MB`)
          continue
        }
        const { data } = await contentApi.uploadImage(file, slot)
        if (data?.data?.url) uploaded.push(data.data.url)
      }
      if (uploaded.length) {
        setImages(replaceMode ? uploaded : [...images, ...uploaded])
        toast.success(
          uploaded.length === 1 ? 'Image uploaded' : `${uploaded.length} images uploaded`,
        )
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  const removeAt = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const makePrimary = (index) => {
    if (index === 0) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    setImages(next)
  }

  return (
    <div className="space-y-3">
      {guide ? (
        <div>
          {guide.title ? <h3 className="text-sm font-medium text-ink">{guide.title}</h3> : null}
          {guide.bullets?.length ? (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted">
              {guide.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
          dragging
            ? 'border-gold bg-gold/5'
            : 'border-line bg-panel hover:border-gold/60 hover:bg-elevated/40'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        {uploading ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-gold" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-gold" />
        )}
        <p className="text-sm font-medium text-ink">
          {uploading ? 'Uploading…' : 'Drag & drop images here'}
        </p>
        <p className="mt-1 text-xs text-muted">or click to browse from your PC / phone</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple={!replaceMode}
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {images.length ? (
        <div className={`grid gap-3 ${replaceMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-line bg-elevated"
            >
              <div className={replaceMode ? 'aspect-video bg-slate-100' : 'aspect-[4/5] bg-slate-100'}>
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              {!replaceMode && index === 0 ? (
                <span className="absolute left-2 top-2 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white">
                  Primary
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                {!replaceMode && index !== 0 ? (
                  <button
                    type="button"
                    className="rounded bg-white/90 p-1.5 text-ink hover:bg-white"
                    onClick={() => makePrimary(index)}
                    title="Make primary"
                  >
                    <Star size={14} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded bg-white/90 p-1.5 text-red-700 hover:bg-white"
                  onClick={() => removeAt(index)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!replaceMode && images.length < maxImages ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/5] flex-col items-center justify-center rounded-lg border border-dashed border-line text-muted hover:border-gold hover:text-gold"
            >
              <ImagePlus size={22} />
              <span className="mt-1 text-xs">Add more</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
