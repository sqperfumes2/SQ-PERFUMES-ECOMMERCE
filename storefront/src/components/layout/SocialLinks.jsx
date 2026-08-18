import { brand } from '../../lib/brand'

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9z"
        fill="currentColor"
      />
    </svg>
  )
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.6 3.2c.5 2.6 2.2 4.5 4.7 5v2.5c-1.6.1-3.1-.4-4.4-1.3v7.1c0 3.6-2.9 6.5-6.5 6.5S1.9 20.1 1.9 16.5 4.8 10 8.4 10c.5 0 1 .1 1.4.2v2.6a4 4 0 0 0-1.4-.2 3.8 3.8 0 1 0 3.8 3.8V3.2h2.4Z" />
    </svg>
  )
}

const links = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
]

const tones = {
  hero: 'h-11 w-11 rounded-full border border-gold/60 text-gold hover:border-gold hover:bg-gold hover:text-ink',
  footer:
    'h-10 w-10 rounded-sm border border-border text-muted hover:border-gold hover:text-gold',
}

export default function SocialLinks({ tone = 'footer', className = '' }) {
  const visible = links.filter(({ key }) => brand.socials[key])
  if (!visible.length) return null

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {visible.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={brand.socials[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${brand.name} on ${label}`}
          className={`inline-flex items-center justify-center transition ${tones[tone]}`}
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}
