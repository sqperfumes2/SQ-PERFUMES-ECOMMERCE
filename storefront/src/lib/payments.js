export const jazzCash = {
  accountName: 'MUHAMMAD ARSHAD',
  accountNumber: '03002676326',
  accountNumberDisplay: '0300 2676326',
  screenshotPhone: '03032070201',
  screenshotPhoneDisplay: '0303 2070201',
  screenshotWhatsApp: 'https://wa.me/923032070201',
}

export function jazzCashWhatsAppHref(orderNumber, totalLabel) {
  const parts = [
    'Assalamualaikum, I have paid via JazzCash for my SQ Perfumes order.',
    orderNumber ? `Order: ${orderNumber}` : null,
    totalLabel ? `Amount: ${totalLabel}` : null,
    `Sent to ${jazzCash.accountName} (${jazzCash.accountNumberDisplay}). Screenshot attached.`,
  ].filter(Boolean)
  return `${jazzCash.screenshotWhatsApp}?text=${encodeURIComponent(parts.join(' '))}`
}
