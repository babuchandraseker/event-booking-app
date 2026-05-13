export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const DEFAULT_BUSINESS_SETTINGS = {
  profileName: 'Admin',
  profileEmail: 'admin@velvetnights.in',
  businessName: 'Velvet Nights',
  tagline: 'Private Event Studio',
  description: "Chennai's premier indoor private event studio, crafting unforgettable moments for every occasion. Premium, intimate, and entirely yours.",
  city: 'Chennai',
  address: 'T. Nagar, Chennai - 600017',
  openingHours: '9 AM - 11 PM',
  phone: '+91 99999 99999',
  whatsapp: '+91 99999 99999',
  email: 'hello@velvetnights.in',
  instagram: '@velvetnights',
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
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  })
  const result = await response.json()

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
