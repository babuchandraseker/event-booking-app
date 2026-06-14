import { useContext } from 'react'
import { HeroContentContext } from '../context/HeroContentContextValue.js'

export function useHeroContent() {
  const ctx = useContext(HeroContentContext)
  if (!ctx) throw new Error('useHeroContent must be used within HeroContentProvider')
  return ctx
}
