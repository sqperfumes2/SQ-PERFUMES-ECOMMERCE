export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="touch-target inline-flex items-center justify-center border border-border px-3 text-sm text-muted hover:border-gold hover:text-gold-bright disabled:opacity-40"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`touch-target inline-flex min-w-11 items-center justify-center border text-sm ${
            p === page
              ? 'border-gold bg-gold/15 text-gold-bright'
              : 'border-border text-muted hover:border-gold hover:text-gold-bright'
          }`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="touch-target inline-flex items-center justify-center border border-border px-3 text-sm text-muted hover:border-gold hover:text-gold-bright disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  )
}
