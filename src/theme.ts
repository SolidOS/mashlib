import type { ThemeMode } from 'pane-registry'

const THEME_STORAGE_KEY = 'mashlib-theme'

const applyTheme = (theme: ThemeMode) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = (savedTheme || (prefersDark ? 'dark' : 'light')) as ThemeMode

  applyTheme(theme)
}

const setTheme = (theme: ThemeMode) => {
  applyTheme(theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

const getTheme = (): ThemeMode => {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export const theme = {
  get: getTheme,
  init: initializeTheme,
  set: setTheme
}
