import type { ThemeMode } from 'pane-registry'

const THEME_STORAGE_KEY = 'mashlib-theme'

const applyTheme = (theme: ThemeMode) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }

  window.dispatchEvent(new CustomEvent('mashlib:themechange', {
    detail: { theme }
  }))
}

const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  const prefersDark = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
  const theme = (
    savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : prefersDark
        ? 'dark'
        : 'light'
  ) as ThemeMode

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
