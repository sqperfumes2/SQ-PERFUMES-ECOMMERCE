import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-ink/80"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[88dvh] w-full overflow-y-auto border border-border bg-charcoal p-4 pb-safe shadow-gold sm:max-h-[90vh] sm:p-6 ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? <h2 className="font-display text-xl text-ivory">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center rounded-sm text-muted hover:text-gold-bright"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
