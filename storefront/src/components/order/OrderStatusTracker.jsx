const STEPS = [
  { key: 'Pending', label: 'Placed' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
]

function stepIndex(status) {
  if (status === 'Processing') return 1
  const i = STEPS.findIndex((step) => step.key === status)
  return i
}

export default function OrderStatusTracker({ status, history = [] }) {
  if (status === 'Cancelled' || status === 'Returned') {
    return (
      <div className="border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
        This order is {status.toLowerCase()}. Contact us if you need help.
      </div>
    )
  }

  const current = Math.max(0, stepIndex(status))

  return (
    <div>
      <ol className="grid grid-cols-4 gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const done = index <= current
          return (
            <li key={step.key} className="flex flex-col items-center text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                  done
                    ? 'border-gold bg-gold text-ink'
                    : 'border-border bg-charcoal text-muted'
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`mt-2 text-[10px] uppercase tracking-[0.14em] ${
                  done ? 'text-gold-bright' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
      {history.length ? (
        <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-muted">
          {[...history]
            .slice()
            .reverse()
            .map((entry, index) => (
              <li key={`${entry.status}-${entry.at || index}`}>
                <span className="text-ivory">{entry.status}</span>
                {entry.at ? (
                  <span className="text-muted">
                    {' '}
                    · {new Date(entry.at).toLocaleString('en-PK')}
                  </span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  )
}
