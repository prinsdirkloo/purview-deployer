import React, { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import SITFormModal from './SITFormModal.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { ghTestConnection } from '../../hooks/useConfig.js'
import s from './Modals.module.css'

// ── GitHub Settings Panel ─────────────────────────────────────────────────────
function GitHubSyncPanel({ ghSettings, updateGhSettings, ghStatus, ghMsg, statusMsg }) {
  const [expanded,    setExpanded]    = useState(false)
  const [draft,       setDraft]       = useState(ghSettings)
  const [testResult,  setTestResult]  = useState(null)
  const [testing,     setTesting]     = useState(false)

  // Keep draft in sync if settings change externally
  React.useEffect(() => { setDraft(ghSettings) }, [ghSettings])

  const isConfigured = !!(ghSettings.repo?.trim() && ghSettings.token?.trim())

  const handleTest = async () => {
    setTesting(true); setTestResult(null)
    const result = await ghTestConnection(draft)
    setTestResult(result)
    setTesting(false)
  }

  const handleSave = () => {
    updateGhSettings(draft)
    setTestResult(null)
    setExpanded(false)
  }

  const statusColor = {
    ok:      'var(--ok-t)',
    error:   'var(--err)',
    syncing: 'var(--orange-d)',
    idle:    'var(--text-m)',
  }[ghStatus] || 'var(--text-m)'

  const statusIcon = {
    ok:      '✓',
    error:   '⚠',
    syncing: '↑',
    idle:    '○',
  }[ghStatus] || '○'

  return (
    <div className={s.ghPanel}>
      {/* Header row */}
      <div className={s.ghPanelHeader}>
        <div className={s.ghPanelLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
            style={{ color: 'var(--text-m)', flexShrink: 0 }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className={s.ghPanelTitle}>GitHub Auto-Sync</span>
          <span
            className={s.ghBadge}
            style={{ background: isConfigured ? 'var(--ok-l)' : 'var(--grey-l)',
                     color: isConfigured ? 'var(--ok-t)' : 'var(--text-m)',
                     border: isConfigured ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)' }}
          >
            {isConfigured ? '● Connected' : '○ Not configured'}
          </span>
        </div>
        <button
          className={s.ghSettingsToggle}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? '▲ Hide' : '⚙ Settings'}
        </button>
      </div>

      {/* Status line */}
      <div className={s.ghStatusLine} style={{ color: statusColor }}>
        <span className={s.ghStatusIcon}>{ghStatus === 'syncing'
          ? <span className={s.ghSpinner} />
          : statusIcon}
        </span>
        <span>{statusMsg}</span>
      </div>

      {/* Expandable settings form */}
      {expanded && (
        <div className={s.ghSettingsForm}>
          <div className={s.ghSettingsDesc}>
            Changes you make to the SIT library are automatically committed to your GitHub repo.
            Azure SWA redeploys automatically — no manual steps needed.
            Your PAT is stored only in <code>localStorage</code> on this device.
          </div>

          <div className={s.ghFormGrid}>
            <div>
              <label className={s.ghLabel}>Repository <span style={{ opacity:.6 }}>(owner/repo)</span></label>
              <input
                type="text"
                value={draft.repo}
                onChange={e => setDraft(d => ({ ...d, repo: e.target.value }))}
                placeholder="e.g. dirk-bui/purview-deployer"
              />
            </div>
            <div>
              <label className={s.ghLabel}>Branch</label>
              <input
                type="text"
                value={draft.branch}
                onChange={e => setDraft(d => ({ ...d, branch: e.target.value }))}
                placeholder="main"
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className={s.ghLabel}>Config file path in repo</label>
            <input
              type="text"
              value={draft.path}
              onChange={e => setDraft(d => ({ ...d, path: e.target.value }))}
              placeholder="public/bui-purview-config.json"
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className={s.ghLabel}>
              Personal Access Token
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0,
                fontSize: 11, color: 'var(--text-m)', marginLeft: 6 }}>
                (stored in localStorage only — never sent anywhere except GitHub API)
              </span>
            </label>
            <input
              type="password"
              value={draft.token}
              onChange={e => setDraft(d => ({ ...d, token: e.target.value }))}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <div className={s.ghTokenHint}>
              Create at{' '}
              <a href="https://github.com/settings/tokens/new?scopes=repo&description=BUI+Purview+Deployer"
                target="_blank" rel="noreferrer" style={{ color: 'var(--orange)' }}>
                github.com/settings/tokens
              </a>
              {' '}— tick <strong>repo</strong> scope (or fine-grained <strong>contents: write</strong>)
            </div>
          </div>

          {testResult && (
            <div className={s.ghTestResult}
              style={{ color: testResult.ok ? 'var(--ok-t)' : 'var(--err)' }}>
              {testResult.ok ? '✓' : '✗'} {testResult.message}
            </div>
          )}

          <div className={s.ghFormActions}>
            <button
              className={s.ghTestBtn}
              onClick={handleTest}
              disabled={testing || !draft.repo?.trim() || !draft.token?.trim()}
            >
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button className={s.ghSaveBtn} onClick={handleSave}>
              Save settings
            </button>
            <button className={s.ghCancelBtn} onClick={() => { setExpanded(false); setDraft(ghSettings) }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ConfigModal ──────────────────────────────────────────────────────────

export default function ConfigModal({
  open, onClose, statusMsg, exportConfig, importConfig,
  ghSettings, updateGhSettings, ghStatus, ghMsg,
}) {
  const { allSITs, saveSITs } = useApp()
  const [editingSIT, setEditingSIT] = useState(null)
  const [formOpen,   setFormOpen]   = useState(false)
  const [importErr,  setImportErr]  = useState('')

  const buiCustom  = allSITs.filter(s => !s.builtIn && !s.isCustom)
  const userCustom = allSITs.filter(s => s.isCustom)

  const openAdd  = () => { setEditingSIT(null); setFormOpen(true) }
  const openEdit = (sit) => { setEditingSIT(sit); setFormOpen(true) }

  const deleteSIT = (id) => {
    if (!confirm('Remove this custom SIT from the library?')) return
    saveSITs(allSITs.filter(s => s.id !== id))
  }

  const handleFormSave = (sit) => {
    const idx  = allSITs.findIndex(s => s.id === sit.id)
    const next = idx > -1
      ? allSITs.map(s => s.id === sit.id ? sit : s)
      : [...allSITs, sit]
    saveSITs(next)
    setFormOpen(false)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]; if (!file) return
    setImportErr('')
    importConfig(file)
      .then(count => alert(`Config imported — ${count} SITs loaded.`))
      .catch(err => setImportErr('Import failed: ' + err.message))
    e.target.value = ''
  }

  const renderRows = (group, canDelete) => group.map(sit => {
    const tagClass = sit.tag === 'pii' ? s.tagPii : s.tagFin
    const regexPreview = sit.regex
      ? <code style={{ fontSize: 10, maxWidth: 130, display: 'block', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sit.regex}>{sit.regex}</code>
      : <span style={{ color: 'var(--text-m)', fontSize: 11, fontStyle: 'italic' }}>—</span>
    const kwPreview = (sit.keywords || []).length > 0
      ? sit.keywords.slice(0, 2).join(', ') + (sit.keywords.length > 2 ? ` +${sit.keywords.length - 2}` : '')
      : '—'
    return (
      <tr key={sit.id}>
        <td className={s.tdName}>{sit.name}</td>
        <td><span className={[s.tagBadge, tagClass].join(' ')}>{sit.tag === 'pii' ? 'PII' : 'Fin'}</span></td>
        <td className={s.tdMeta}>{sit.group}</td>
        <td><span className={[s.rowType, sit.isCustom ? s.rowTypeCustom : ''].filter(Boolean).join(' ')}>
          {sit.isCustom ? 'Custom' : 'BUI'}
        </span></td>
        <td>{regexPreview}</td>
        <td className={s.tdMeta} style={{ maxWidth: 140 }}>{kwPreview}</td>
        <td className={s.tdMeta}>{sit.proximity || 50}</td>
        <td style={{ whiteSpace: 'nowrap' }}>
          <button className={`${s.iconBtn} ${s.iconBtnEdit}`} onClick={() => openEdit(sit)} title="Edit">✎</button>
          {canDelete && (
            <button className={`${s.iconBtn} ${s.iconBtnDel}`} onClick={() => deleteSIT(sit.id)} title="Delete">✕</button>
          )}
        </td>
      </tr>
    )
  })

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Custom SIT Library"
        wide
        footer={
          <>
            <span style={{ fontSize: 12, color: 'var(--text-m)', marginRight: 'auto' }}>{statusMsg}</span>
            <label className={s.importLabel} title="Import a previously exported config JSON">
              ⬆ Import JSON
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </label>
            {!ghSettings?.repo?.trim() && (
              <button className={s.exportBtn} onClick={exportConfig} title="Download config JSON to commit manually">
                ⬇ Export JSON
              </button>
            )}
            <button className={s.closeBtn} onClick={onClose}>Close</button>
            {importErr && <span style={{ color: 'var(--err)', fontSize: 12 }}>{importErr}</span>}
          </>
        }
      >
        {/* GitHub Auto-Sync Panel */}
        <GitHubSyncPanel
          ghSettings={ghSettings}
          updateGhSettings={updateGhSettings}
          ghStatus={ghStatus}
          ghMsg={ghMsg}
          statusMsg={statusMsg}
        />

        {/* Toolbar */}
        <div className={s.configToolbar}>
          <button className={s.addBtn} onClick={openAdd}>+ Add Custom SIT</button>
          <span className={s.configCount}>
            {buiCustom.length} BUI built-in &nbsp;·&nbsp; {userCustom.length} user-added custom
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className={s.configTable}>
            <thead>
              <tr>
                <th>Name</th><th>Tag</th><th>Group</th><th>Type</th>
                <th>Regex</th><th>Keywords</th><th>Prox.</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buiCustom.length > 0 && <>
                <tr><td colSpan={8} className={s.groupHeader}>BUI Custom SITs (South African)</td></tr>
                {renderRows(buiCustom, false)}
              </>}
              {userCustom.length > 0 && <>
                <tr><td colSpan={8} className={s.groupHeader}>User-added Custom SITs</td></tr>
                {renderRows(userCustom, true)}
              </>}
              {buiCustom.length === 0 && userCustom.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center',
                    color: 'var(--text-m)', fontStyle: 'italic' }}>
                    No SITs in library yet. Click + Add Custom SIT to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Note about silent built-in SITs */}
        <div style={{ marginTop: '1rem', padding: '10px 14px', borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-m)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-s)' }}>Note:</strong> Credit Card Number, South Africa
          Identification Number, and South Africa Physical Addresses are automatically included in
          applicable DLP policy rules and do not appear here — they already exist in every Purview tenant.
        </div>
      </Modal>

      <SITFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSave}
        editSIT={editingSIT}
      />
    </>
  )
}
