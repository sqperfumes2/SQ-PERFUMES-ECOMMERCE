export default function Badge({ children, tone = 'gold', className = '' }) {
  const tones = {
    gold: 'border-gold/40 text-gold-bright bg-gold/10',
    ivory: 'border-ivory/20 text-ivory bg-ivory/5',
    danger: 'border-danger/40 text-danger bg-danger/10',
  }

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
