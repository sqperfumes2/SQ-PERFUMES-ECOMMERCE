import { useState } from 'react'
import toast from 'react-hot-toast'
import { jazzCash, jazzCashWhatsAppHref } from '../../lib/payments'
import { formatPrice } from '../../lib/format'

function JazzCashLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 40"
      className="h-9 w-[10.125rem]"
      role="img"
      aria-label="JazzCash"
    >
      <rect width="180" height="40" rx="8" fill="#E2136E" />
      <text
        x="90"
        y="26.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="0.4"
      >
        JazzCash
      </text>
    </svg>
  )
}

export default function JazzCashDetails({ total, orderNumber, className = '' }) {
  const [copied, setCopied] = useState(false)
  const totalLabel = typeof total === 'number' ? formatPrice(total) : ''

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(jazzCash.accountNumber)
      setCopied(true)
      toast.success('JazzCash number copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy number')
    }
  }

  return (
    <div className={`border border-gold/35 bg-gold/5 p-4 text-left ${className}`}>
      <div className="flex items-center gap-3">
        <JazzCashLogo />
      </div>
      <p className="mt-3 text-sm text-muted">
        Send the order amount on JazzCash, then WhatsApp the payment screenshot so we can confirm
        your order.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted">Account name</dt>
          <dd className="font-medium text-ivory">{jazzCash.accountName}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">JazzCash number</dt>
          <dd className="flex items-center gap-2">
            <span className="font-medium text-ivory">{jazzCash.accountNumberDisplay}</span>
            <button
              type="button"
              onClick={copyNumber}
              className="text-xs text-gold hover:text-gold-bright"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </dd>
        </div>
        {totalLabel ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted">Amount to send</dt>
            <dd className="font-medium text-gold-bright">{totalLabel}</dd>
          </div>
        ) : null}
      </dl>
      <ol className="mt-4 list-decimal space-y-1.5 pl-4 text-sm text-muted">
        <li>
          Open JazzCash and send {totalLabel || 'the order total'} to{' '}
          <span className="text-ivory">{jazzCash.accountNumberDisplay}</span> ({jazzCash.accountName}
          ).
        </li>
        <li>Take a screenshot of the successful payment.</li>
        <li>
          Send that screenshot on WhatsApp to{' '}
          <span className="text-ivory">{jazzCash.screenshotPhoneDisplay}</span>
          {orderNumber ? (
            <>
              {' '}
              with order <span className="text-ivory">{orderNumber}</span>
            </>
          ) : (
            ' with your order number'
          )}
          .
        </li>
      </ol>
      <a
        href={jazzCashWhatsAppHref(orderNumber, totalLabel)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center border border-gold bg-gold px-4 text-sm font-medium text-ink hover:bg-gold-bright"
      >
        Send screenshot on WhatsApp
      </a>
    </div>
  )
}
