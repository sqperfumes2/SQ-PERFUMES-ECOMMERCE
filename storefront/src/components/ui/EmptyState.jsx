import Button from './Button'

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-charcoal/60 px-6 py-16 text-center">
      {Icon ? <Icon className="mb-4 text-gold" size={36} strokeWidth={1.25} /> : null}
      <h2 className="font-display text-2xl text-ivory">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Button to={actionTo} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
