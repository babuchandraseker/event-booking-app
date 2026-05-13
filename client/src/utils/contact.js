/** Digits only for tel:/wa.me links */
export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function whatsappHref(whatsapp) {
  let d = digitsOnly(whatsapp)
  if (!d) return 'https://wa.me/'

  if (d.length === 10) {
    d = `91${d}`
  }

  return `https://wa.me/${d}`
}

export function instagramHref(handle) {
  const cleanHandle = String(handle || '')
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '')

  return `https://www.instagram.com/${cleanHandle || 'awonderonesuprise'}`
}
