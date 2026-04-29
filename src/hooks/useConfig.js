import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SITS } from '../data/sits.js'

const LS_KEY = 'bui_purview_config_v2'

function mergeConfigSITs(sits) {
  const merged = DEFAULT_SITS.map(def => {
    const override = sits.find(s => s.id === def.id)
    return override ? { ...def, ...override } : def
  })
  const customOnly = sits.filter(s => !DEFAULT_SITS.find(d => d.id === s.id))
  return [...merged, ...customOnly]
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.sits && Array.isArray(parsed.sits)) return mergeConfigSITs(parsed.sits)
    }
  } catch (e) { console.warn('localStorage config load failed:', e) }
  return [...DEFAULT_SITS]
}

export function useConfig() {
  const [allSITs, setAllSITs] = useState(() => loadFromLocalStorage())
  const [configSource, setConfigSource] = useState('localStorage')
  const [statusMsg, setStatusMsg] = useState('Loading config…')

  // On mount: try to fetch bui-purview-config.json from the same origin
  useEffect(() => {
    async function init() {
      try {
        const r = await fetch('./bui-purview-config.json', { cache: 'no-cache' })
        if (r.ok) {
          const parsed = await r.json()
          if (parsed.sits && Array.isArray(parsed.sits)) {
            const merged = mergeConfigSITs(parsed.sits)
            setAllSITs(merged)
            setConfigSource('file')
            const customCount = merged.filter(s => s.isCustom).length
            setStatusMsg(`✓ Loaded from bui-purview-config.json (${customCount} custom SITs)`)
            // Also update localStorage
            try { localStorage.setItem(LS_KEY, JSON.stringify({ version: 2, savedAt: new Date().toISOString(), sits: merged })) } catch (_) {}
            return
          }
        }
      } catch (_) {
        // file:// protocol or config not found — use localStorage
      }
      const customCount = allSITs.filter(s => s.isCustom).length
      setStatusMsg(customCount > 0
        ? 'Loaded from localStorage — export & commit config.json to make permanent'
        : 'Using built-in defaults — export config.json and commit to repo to persist custom SITs')
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSITs = useCallback((newSITs) => {
    setAllSITs(newSITs)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ version: 2, savedAt: new Date().toISOString(), sits: newSITs }))
      setStatusMsg('Saved to localStorage — export config.json and commit to make permanent')
    } catch (e) { console.warn('localStorage save failed:', e) }
  }, [])

  const exportConfig = useCallback(() => {
    const cfg = {
      version: 2,
      savedAt: new Date().toISOString(),
      description: 'BUI Purview Deployment Script Generator — SIT Library Config. Commit as bui-purview-config.json in your repo root.',
      sits: allSITs,
    }
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bui-purview-config.json'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatusMsg('✓ Exported — commit bui-purview-config.json to your repo root')
  }, [allSITs])

  const importConfig = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result)
          if (!parsed.sits || !Array.isArray(parsed.sits)) throw new Error('Invalid config — missing sits array')
          const merged = mergeConfigSITs(parsed.sits)
          saveSITs(merged)
          resolve(merged.length)
        } catch (err) { reject(err) }
      }
      reader.readAsText(file)
    })
  }, [saveSITs])

  return { allSITs, saveSITs, configSource, statusMsg, exportConfig, importConfig }
}
