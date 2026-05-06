import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_SITS } from '../data/sits.js'

const LS_KEY    = 'bui_purview_config_v2'
const LS_GH_KEY = 'bui_gh_settings'
const LS_GH_SHA = 'bui_gh_sha'

// ── Exported constants ────────────────────────────────────────────────────────
export const BUILTIN_PURVIEW_IDS = new Set(['credit_card', 'sa_id', 'sa_addresses'])
export const BUI_CUSTOM_IDS = new Set([
  'sa_company_reg','sa_mobile','sa_bank','sa_company_tax',
  'sa_dob','sa_paye','sa_personal_tax','sa_uif','sa_vat',
])

// ── Local helpers ─────────────────────────────────────────────────────────────

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

function persistToLocalStorage(sits) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ version: 2, savedAt: new Date().toISOString(), sits }))
  } catch (e) { console.warn('localStorage save failed:', e) }
}

function buildCfgPayload(sits) {
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    description: 'BUI Purview Deployment Script Generator — Custom SIT Library.',
    sits,
  }
}

// ── GitHub settings helpers ───────────────────────────────────────────────────

export function loadGhSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_GH_KEY) || '{}')
    return {
      repo:   s.repo   || '',
      branch: s.branch || 'main',
      path:   s.path   || 'public/bui-purview-config.json',
      token:  s.token  || '',
    }
  } catch (_) {
    return { repo: '', branch: 'main', path: 'public/bui-purview-config.json', token: '' }
  }
}

export function saveGhSettings(settings) {
  try { localStorage.setItem(LS_GH_KEY, JSON.stringify(settings)) } catch (_) {}
}

export function ghIsConfigured(settings) {
  return !!(settings?.repo?.trim() && settings?.token?.trim())
}

// ── GitHub API ────────────────────────────────────────────────────────────────

async function ghGetFileSha(settings) {
  // Returns { sha, exists } — sha is null if file doesn't exist yet
  try {
    const r = await fetch(
      `https://api.github.com/repos/${settings.repo}/contents/${settings.path}?ref=${settings.branch}`,
      { headers: { Authorization: `token ${settings.token}`, Accept: 'application/vnd.github+json' } }
    )
    if (r.status === 404) return { sha: null, exists: false }
    if (!r.ok) throw new Error(`GitHub ${r.status}`)
    const data = await r.json()
    try { localStorage.setItem(LS_GH_SHA, data.sha) } catch (_) {}
    return { sha: data.sha, exists: true }
  } catch (e) {
    // Fallback to cached SHA
    const cached = localStorage.getItem(LS_GH_SHA)
    return { sha: cached || null, exists: !!cached }
  }
}

export async function ghPushConfig(sits, settings) {
  // Returns { ok, message, sha }
  if (!ghIsConfigured(settings)) return { ok: false, message: 'GitHub not configured' }

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(buildCfgPayload(sits), null, 2))))

  // Get current SHA (required for updates, omitted for creates)
  const { sha } = await ghGetFileSha(settings)

  const body = {
    message: `Update SIT library — ${new Date().toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}`,
    content,
    branch: settings.branch,
  }
  if (sha) body.sha = sha

  const r = await fetch(
    `https://api.github.com/repos/${settings.repo}/contents/${settings.path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${settings.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    return { ok: false, message: err.message || `GitHub ${r.status}` }
  }

  const data = await r.json()
  try { localStorage.setItem(LS_GH_SHA, data.content.sha) } catch (_) {}
  return { ok: true, message: 'Committed to GitHub', sha: data.content.sha }
}

export async function ghTestConnection(settings) {
  // Returns { ok, message }
  try {
    const r = await fetch(`https://api.github.com/repos/${settings.repo}`, {
      headers: { Authorization: `token ${settings.token}`, Accept: 'application/vnd.github+json' }
    })
    if (r.ok) {
      const data = await r.json()
      return { ok: true, message: `Connected — ${data.full_name} (${data.private ? 'private' : 'public'})` }
    }
    if (r.status === 401) return { ok: false, message: 'Invalid token — check your PAT' }
    if (r.status === 404) return { ok: false, message: 'Repo not found — check owner/repo name' }
    return { ok: false, message: `GitHub ${r.status}` }
  } catch (e) {
    return { ok: false, message: `Network error: ${e.message}` }
  }
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useConfig() {
  const [allSITs,    setAllSITs]    = useState(() => loadFromLocalStorage())
  const [statusMsg,  setStatusMsg]  = useState('Loading config…')
  const [ghStatus,   setGhStatus]   = useState('idle')  // 'idle'|'syncing'|'ok'|'error'
  const [ghMsg,      setGhMsg]      = useState('')
  const [ghSettings, setGhSettingsState] = useState(() => loadGhSettings())

  const loadedFromFile = useRef(false)

  // On mount: load from the hosted JSON first, fall back to localStorage
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
        setStatusMsg(`✓ Loaded from repo (${customCount} custom SIT${customCount !== 1 ? 's' : ''})`)
      } catch (_) {
        if (cancelled) return
        const current = loadFromLocalStorage()
        const customCount = current.filter(s => s.isCustom).length
        setStatusMsg(customCount > 0
          ? `Loaded from localStorage (${customCount} custom SIT${customCount !== 1 ? 's' : ''})`
          : 'Using built-in library — add custom SITs via ⚙ Config')
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // Update GitHub settings and persist
  const updateGhSettings = useCallback((newSettings) => {
    saveGhSettings(newSettings)
    setGhSettingsState(newSettings)
  }, [])

  // Save SITs — localStorage immediately, then auto-push to GitHub if configured
  const saveSITs = useCallback(async (newSITs) => {
    setAllSITs(newSITs)
    persistToLocalStorage(newSITs)

    const settings = loadGhSettings() // always read fresh
    if (ghIsConfigured(settings)) {
      setGhStatus('syncing')
      setGhMsg('Committing to GitHub…')
      setStatusMsg('Committing to GitHub…')
      try {
        const result = await ghPushConfig(newSITs, settings)
        if (result.ok) {
          const customCount = newSITs.filter(s => s.isCustom).length
          const msg = `✓ Committed to GitHub — ${new Date().toLocaleTimeString()} (${customCount} custom SIT${customCount !== 1 ? 's' : ''})`
          setGhStatus('ok')
          setGhMsg(msg)
          setStatusMsg(msg)
        } else {
          const msg = `⚠ GitHub commit failed: ${result.message}`
          setGhStatus('error')
          setGhMsg(msg)
          setStatusMsg(msg + ' — changes saved locally')
        }
      } catch (e) {
        const msg = `⚠ GitHub error: ${e.message}`
        setGhStatus('error')
        setGhMsg(msg)
        setStatusMsg(msg + ' — changes saved locally')
      }
    } else {
      setStatusMsg('Saved locally — configure GitHub sync in ⚙ Config to auto-commit')
    }
  }, [])

  // Manual export (fallback if GitHub sync isn't configured)
  const exportConfig = useCallback(() => {
    const cfg = buildCfgPayload(allSITs)
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bui-purview-config.json'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatusMsg('Exported — place file in public/ folder and commit to repo')
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

  return {
    allSITs, saveSITs, statusMsg,
    exportConfig, importConfig,
    ghSettings, updateGhSettings, ghStatus, ghMsg,
  }
}
