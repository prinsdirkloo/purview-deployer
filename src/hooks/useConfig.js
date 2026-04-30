import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_SITS } from '../data/sits.js'

const LS_KEY = 'bui_purview_config_v2'

// IDs of the 3 built-in Purview SITs — these are always available in the
// DLP policy rules but are NOT shown in the SIT selection grid or Config.
export const BUILTIN_PURVIEW_IDS = new Set(['credit_card', 'sa_id', 'sa_addresses'])

// The 9 BUI custom SITs (non-built-in, part of the library)
export const BUI_CUSTOM_IDS = new Set([
  'sa_company_reg','sa_mobile','sa_bank','sa_company_tax',
  'sa_dob','sa_paye','sa_personal_tax','sa_uif','sa_vat',
])

// ── Helpers ──────────────────────────────────────────────────────────────────

function mergeConfigSITs(sits) {
  // Start with all DEFAULT_SITS as the base
  const merged = DEFAULT_SITS.map(def => {
    const override = sits.find(s => s.id === def.id)
    return override ? { ...def, ...override } : def
  })
  // Append any user-added custom SITs not in DEFAULT_SITS
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

function persistToLocalStorage(sits) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      version: 2,
      savedAt: new Date().toISOString(),
      sits,
    }))
  } catch (e) { console.warn('localStorage save failed:', e) }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useConfig() {
  const [allSITs, setAllSITs] = useState(() => loadFromLocalStorage())
  const [statusMsg, setStatusMsg] = useState('Loading config…')
  // Track whether we loaded from the committed JSON (vs only localStorage)
  const loadedFromFile = useRef(false)

  // On mount: try to load the committed bui-purview-config.json
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const r = await fetch('./bui-purview-config.json', { cache: 'no-cache' })
        if (!r.ok) throw new Error('not found')
        const parsed = await r.json()
        if (!parsed.sits || !Array.isArray(parsed.sits)) throw new Error('invalid format')
        if (cancelled) return
        const merged = mergeConfigSITs(parsed.sits)
        setAllSITs(merged)
        persistToLocalStorage(merged)
        loadedFromFile.current = true
        const customCount = merged.filter(s => s.isCustom).length
        setStatusMsg(`✓ Config loaded from bui-purview-config.json (${customCount} custom SITs)`)
      } catch (_) {
        if (cancelled) return
        // Fall back to whatever was loaded from localStorage
        const current = loadFromLocalStorage()
        const customCount = current.filter(s => s.isCustom).length
        if (customCount > 0) {
          setStatusMsg('Loaded from localStorage — export & commit config.json to persist')
        } else {
          setStatusMsg('Using built-in library — add custom SITs via Config, then export & commit')
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  /**
   * Save an updated SITs array.
   * Always persists to localStorage immediately.
   * The committed config.json is updated by the user exporting and committing.
   */
  const saveSITs = useCallback((newSITs) => {
    setAllSITs(newSITs)
    persistToLocalStorage(newSITs)
    setStatusMsg('Saved to localStorage — click "Export & commit" to make permanent across all devices')
  }, [])

  /**
   * Download bui-purview-config.json — user commits this to the repo
   * so the hosted app loads it on next visit.
   */
  const exportConfig = useCallback(() => {
    // Only export the library SITs (not the 3 built-in Purview SITs which are hardcoded)
    const cfg = {
      version: 2,
      savedAt: new Date().toISOString(),
      description: 'BUI Purview Deployment Script Generator — Custom SIT Library. Commit this file as public/bui-purview-config.json in your repo.',
      sits: allSITs,
    }
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bui-purview-config.json'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatusMsg('✓ Exported — replace public/bui-purview-config.json in your repo and push to deploy')
  }, [allSITs])

  /**
   * Import a bui-purview-config.json file chosen by the user.
   */
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

  return { allSITs, saveSITs, statusMsg, exportConfig, importConfig }
}
