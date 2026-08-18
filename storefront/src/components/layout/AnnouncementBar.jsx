import { Link } from 'react-router-dom'
import { brand } from '../../lib/brand'
import { useStoreSettings } from '../../hooks/useStoreSettings'

export default function AnnouncementBar() {
  const { settings } = useStoreSettings()
  const announcement = settings?.announcement || brand.announcement
  const phone = settings?.phone || brand.contact.phone
  const email = settings?.email || brand.contact.email

  if (!announcement) return null

  return (
    <div className="border-b border-border bg-charcoal">
      <p className="section-pad line-clamp-2 py-2 text-center text-[10px] uppercase leading-relaxed tracking-[0.14em] text-gold-bright sm:text-[11px] sm:tracking-[0.18em] md:line-clamp-none md:text-xs">
        {announcement}
      </p>
      <span className="sr-only">
        Contact {phone} or {email}
      </span>
      <Link to="/shop/sale" className="sr-only">
        View sale
      </Link>
    </div>
  )
}
