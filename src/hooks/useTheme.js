import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('bui_theme') === 'dark' } catch (_) { return false }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { localStorage.setItem('bui_theme', isDark ? 'dark' : 'light') } catch (_) {}
  }, [isDark])

  return { isDark, toggleTheme: () => setIsDark(d => !d) }
}
