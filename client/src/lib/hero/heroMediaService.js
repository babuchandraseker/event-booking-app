import { HERO_IDB_PREFIX } from './constants.js'
import { heroIdbDelete, heroIdbPut } from './heroMediaIdb.js'
import { validateHeroImage, validateHeroVideo } from './validateHeroMedia.js'

/**
 * Upload pipeline — today: IndexedDB + `idb:` ref (local mock).
 * Replace `uploadHeroBinary` body with Firebase `uploadBytesResumable` when wired.
 */
export async function uploadHeroBinary(file, kind, { onProgress } = {}) {
  const v = kind === 'video' ? validateHeroVideo(file) : validateHeroImage(file)
  if (!v.ok) throw new Error(v.message)

  onProgress?.(4)
  const id = crypto.randomUUID()
  let acc = 4
  const tick = window.setInterval(() => {
    acc = Math.min(92, acc + 9)
    onProgress?.(acc)
  }, 70)
  try {
    await heroIdbPut(id, file, file.type)
  } finally {
    window.clearInterval(tick)
  }
  onProgress?.(100)
  return { ref: `${HERO_IDB_PREFIX}${id}`, mimeType: file.type }
}

export async function deleteHeroBinaryIfStored(url) {
  if (!url || !String(url).startsWith(HERO_IDB_PREFIX)) return
  const id = String(url).slice(HERO_IDB_PREFIX.length)
  await heroIdbDelete(id)
}
