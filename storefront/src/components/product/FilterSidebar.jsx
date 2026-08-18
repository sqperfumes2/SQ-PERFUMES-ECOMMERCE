import Button from '../ui/Button'
import { useFamilies } from '../../hooks/useCatalog'

const genders = [
  { value: '', label: 'All' },
  { value: 'men', label: 'For Him' },
  { value: 'women', label: 'For Her' },
  { value: 'unisex', label: 'Unisex' },
]

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  mobile = false,
  bottleSizes = [],
}) {
  const fragranceFamilies = useFamilies()
  const update = (patch) => onChange({ ...filters, ...patch, page: 1 })

  const toggleArrayValue = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    update({ [key]: next })
  }

  return (
    <aside className={`${mobile ? '' : 'sticky top-28'} space-y-8`}>
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-gold">Gender</h3>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <button
              key={g.label}
              type="button"
              onClick={() => update({ gender: g.value || undefined })}
              className={`min-h-11 border px-3 py-2 text-sm ${
                (filters.gender || '') === g.value
                  ? 'border-gold bg-gold/15 text-gold-bright'
                  : 'border-border text-muted hover:border-gold'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {fragranceFamilies.length ? (
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-gold">Fragrance family</h3>
        <div className="space-y-2">
          {fragranceFamilies.map((family) => (
            <label key={family.id} className="flex min-h-11 items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={(filters.fragranceFamily || []).includes(family.slug)}
                onChange={() => toggleArrayValue('fragranceFamily', family.slug)}
                className="accent-gold"
              />
              {family.name}
            </label>
          ))}
        </div>
      </div>
      ) : null}

      {bottleSizes.length ? (
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-gold">Bottle size</h3>
        <div className="flex flex-wrap gap-2">
          {bottleSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleArrayValue('sizes', size)}
              className={`min-h-10 border px-3 py-2 text-xs ${
                (filters.sizes || []).includes(size)
                  ? 'border-gold bg-gold/15 text-gold-bright'
                  : 'border-border text-muted hover:border-gold'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      ) : null}

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-gold">Price range (Rs.)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              update({ minPrice: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            className="w-full border border-border bg-charcoal px-2 py-3 text-base text-ivory sm:py-2 sm:text-sm"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              update({ maxPrice: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            className="w-full border border-border bg-charcoal px-2 py-3 text-base text-ivory sm:py-2 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-gold">Availability</h3>
        <div className="space-y-2 text-sm text-muted">
          {[
            { value: '', label: 'All' },
            { value: 'in-stock', label: 'In stock' },
            { value: 'out-of-stock', label: 'Out of stock' },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2">
              <input
                type="radio"
                name="availability"
                checked={(filters.availability || '') === opt.value}
                onChange={() => update({ availability: opt.value || undefined })}
                className="accent-gold"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Button variant="secondary" onClick={onClear} className="w-full">
        Clear filters
      </Button>
    </aside>
  )
}
