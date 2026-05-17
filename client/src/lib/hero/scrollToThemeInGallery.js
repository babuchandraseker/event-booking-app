export function scrollToThemeInGallery(themeKey) {
  document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.setTimeout(() => {
    document.querySelector(`.theme-card[data-theme="${themeKey}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 420)
}
