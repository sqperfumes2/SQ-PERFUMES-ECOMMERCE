import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-gold text-ink hover:bg-gold-bright border border-gold font-medium',
  secondary:
    'bg-transparent text-ivory border border-border hover:border-gold hover:text-gold-bright',
  ghost: 'bg-transparent text-ivory hover:text-gold-bright',
  danger: 'bg-danger text-ivory border border-danger',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to,
  href,
  type = 'button',
  disabled,
  onClick,
  ...props
}) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
