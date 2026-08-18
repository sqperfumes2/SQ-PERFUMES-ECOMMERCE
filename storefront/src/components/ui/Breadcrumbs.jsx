import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-[11px] text-muted sm:text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight size={12} className="shrink-0 text-muted/60" /> : null}
              {isLast || !item.to ? (
                <span className="truncate text-ivory">{item.label}</span>
              ) : (
                <Link to={item.to} className="shrink-0 hover:text-gold-bright">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
