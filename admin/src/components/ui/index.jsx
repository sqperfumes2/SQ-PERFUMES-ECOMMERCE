import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-gold text-white hover:bg-amber-800',
    secondary: 'bg-white text-ink border border-line hover:bg-canvas',
    danger: 'bg-danger text-white hover:bg-red-800',
    ghost: 'bg-transparent text-slate hover:bg-canvas',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ label, error, className = '', type = 'text', ...props }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (visible ? 'text' : 'password') : type

  return (
    <label className="block text-sm">
      {label ? <span className="mb-1.5 block font-medium text-slate">{label}</span> : null}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full rounded-md border border-line bg-panel px-3 py-2 text-ink placeholder:text-muted focus:border-gold ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : null}
      </div>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1.5 block font-medium text-slate">{label}</span> : null}
      <select
        className={`w-full rounded-md border border-line bg-panel px-3 py-2 text-ink focus:border-gold ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function TextArea({ label, error, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1.5 block font-medium text-slate">{label}</span> : null}
      <textarea
        className={`w-full rounded-md border border-line bg-panel px-3 py-2 text-ink placeholder:text-muted focus:border-gold ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-panel shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title ? <h2 className="font-display text-lg text-ink">{title}</h2> : <span />}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-success',
    warning: 'bg-amber-100 text-warning',
    danger: 'bg-red-100 text-danger',
    info: 'bg-blue-100 text-info',
    gold: 'bg-gold-soft text-gold',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl text-ink md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyRow({ message = 'No records found.' }) {
  return <p className="py-8 text-center text-sm text-muted">{message}</p>
}

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-gold-soft p-2 text-gold">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-xl border border-line bg-panel p-5 shadow-xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
