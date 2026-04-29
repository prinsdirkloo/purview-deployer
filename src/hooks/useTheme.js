import { useState, useEffect } from 'react'

export function useTheme() {
  // Dark is the default (no class). Light mode adds html.light class.
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('bui_theme') !== 'light' } catch (_) { return true }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
    try { localStorage.setItem('bui_theme', isDark ? 'dark' : 'light') } catch (_) {}
  }, [isDark])

  return { isDark, toggleTheme: () => setIsDark(d => !d) }
}
