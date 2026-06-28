import { API_BASE_URL } from '../config/api.js'
export { API_BASE_URL }

export const DEFAULT_BUSINESS_SETTINGS = {
  profileName: 'Admin',
  profileEmail: 'admin@velvetnights.in',
  businessName: 'A WonderOne Suprise',
  tagline: 'Private Event Studio',
  description: "Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.",
  city: 'Chennai',
  address: 'No.3 ,Railway Colony , 1st Street ,Aminjikarai , Nelson Manickam Road ,Chennai, India, 600029',
  openingHours: '9 AM - 11 PM',
  phone: '+91 99999 99999',
  whatsapp: '+91 99999 99999',
  email: 'hello@velvetnights.in',
  instagram: '@velvetnights',
  eventsHosted: '1200',
  fiveStarReviews: '98',
  addonOptions: '50',
  yearsOfExcellence: '4',
}

export function normalizeBusinessSettings(settings = {}) {
  return {
    ...DEFAULT_BUSINESS_SETTINGS,
    ...settings,
  }
}

export async function fetchBusinessSettings({ admin = false } = {}) {
  const token = localStorage.getItem('adminToken')
  const response = await fetch(`${API_BASE_URL}/${admin ? 'admin/' : ''}settings`, {
    headers: admin && token ? { Authorization: `Bearer ${token}` } : {},
  })
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not load settings.')
  }

  return normalizeBusinessSettings(result.data)
}

export async function saveBusinessSettings(settings) {
  const token = localStorage.getItem('adminToken')
  const url = `${API_BASE_URL}/admin/settings`
  console.log('[Settings Submit]', settings)
  console.log('[Settings API URL]', url)

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  })
  const result = await response.json()
  console.log('[Settings Response]', response.status, result)

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not save settings.')
  }

  return normalizeBusinessSettings(result.data)
}

export async function saveAdminPassword(payload) {
  const token = localStorage.getItem('adminToken')
  const response = await fetch(`${API_BASE_URL}/admin/settings/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Could not update password.')
  }

  return result
}
