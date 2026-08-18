export default function Input({
  label,
  id,
  error,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <label className={`block ${containerClassName}`} htmlFor={id}>
      {label ? <span className="mb-1.5 block text-sm text-muted">{label}</span> : null}
      <input
        id={id}
        className={`w-full rounded-sm border border-border bg-charcoal px-3 py-3 text-base text-ivory placeholder:text-muted/70 focus:border-gold focus:outline-none sm:py-2.5 sm:text-sm ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function TextArea({ label, id, error, className = '', ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label ? <span className="mb-1.5 block text-sm text-muted">{label}</span> : null}
      <textarea
        id={id}
        className={`w-full rounded-sm border border-border bg-charcoal px-3 py-3 text-base text-ivory placeholder:text-muted/70 focus:border-gold focus:outline-none sm:py-2.5 sm:text-sm ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}

export function Select({ label, id, error, children, className = '', ...props }) {
  return (
    <label className="block" htmlFor={id}>
      {label ? <span className="mb-1.5 block text-sm text-muted">{label}</span> : null}
      <select
        id={id}
        className={`w-full rounded-sm border border-border bg-charcoal px-3 py-3 text-base text-ivory focus:border-gold focus:outline-none sm:py-2.5 sm:text-sm ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}
