/** Digits only for tel:/wa.me links */
export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function whatsappHref(whatsapp) {
  const d = digitsOnly(whatsapp)
  if (!d) return 'https://wa.me/'
  return `https://wa.me/${d}`
}
