import React, { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import SITFormModal from './SITFormModal.jsx'
import { useApp } from '../../context/AppContext.jsx'
import s from './Modals.module.css'

export default function ConfigModal({ open, onClose, statusMsg, exportConfig, importConfig }) {
  const { allSITs, saveSITs } = useApp()
  const [editingSIT, setEditingSIT] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [importErr, setImportErr] = useState('')

  // Config only manages library SITs — NOT the 3 silent built-in Purview SITs
  const buiCustom   = allSITs.filter(s => !s.builtIn && !s.isCustom)   // 9 BUI defaults
  const userCustom  = allSITs.filter(s => s.isCustom)                   // user-added

  const openAdd  = () => { setEditingSIT(null); setFormOpen(true) }
  const openEdit = (sit) => { setEditingSIT(sit); setFormOpen(true) }

  const deleteSIT = (id) => {
    if (!confirm('Remove this custom SIT from the library?')) return
    saveSITs(allSITs.filter(s => s.id !== id))
  }

  const handleFormSave = (sit) => {
    const idx = allSITs.findIndex(s => s.id === sit.id)
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
    const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
    const tagClass = sit.tag === 'pii' ? s.tagPii : s.tagFin
    const typeLabel = sit.isCustom ? 'Custom' : 'BUI Custom'
    const typeClass = sit.isCustom ? s.rowTypeCustom : ''
    const regexPreview = sit.regex
      ? <code style={{ fontSize:10, maxWidth:130, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={sit.regex}>{sit.regex}</code>
      : <span style={{ color:'var(--text-m)', fontSize:11, fontStyle:'italic' }}>—</span>
    const kwPreview = (sit.keywords || []).length > 0
      ? sit.keywords.slice(0,2).join(', ') + (sit.keywords.length > 2 ? ` +${sit.keywords.length-2}` : '')
      : '—'
    return (
      <tr key={sit.id}>
        <td className={s.tdName}>{sit.name}</td>
        <td><span className={[s.tagBadge, tagClass].join(' ')}>{tagLabel}</span></td>
        <td className={s.tdMeta}>{sit.group}</td>
        <td><span className={[s.rowType, typeClass].filter(Boolean).join(' ')}>{typeLabel}</span></td>
        <td>{regexPreview}</td>
        <td className={s.tdMeta} style={{ maxWidth:140 }}>{kwPreview}</td>
        <td className={s.tdMeta}>{sit.proximity || 50}</td>
        <td style={{ whiteSpace:'nowrap' }}>
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
            <span style={{ fontSize:12, color:'var(--text-m)', marginRight:'auto' }}>{statusMsg}</span>
            <button className={s.closeBtn} onClick={onClose}>Close</button>
          </>
        }
      >
        {/* Storage bar */}
        <div className={s.storageBar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
            style={{ color:'var(--text-m)', flexShrink:0 }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className={s.storageMsg}>{statusMsg}</span>
          <button className={s.exportBtn} onClick={exportConfig}>⬇ Export &amp; commit to repo</button>
          <label className={s.importLabel}>
            ⬆ Import JSON
            <input type="file" accept=".json" style={{ display:'none' }} onChange={handleImport} />
          </label>
          {importErr && <span style={{ color:'var(--err)', fontSize:12 }}>{importErr}</span>}
        </div>

        {/* Hint */}
        <div className={s.storageHint}>
          <strong>Persistence:</strong> Changes save to <code>localStorage</code> immediately (works this session and after refresh on the same browser).
          To make them permanent across all devices and browsers, click <strong>Export &amp; commit to repo</strong> — replace{' '}
          <code>public/bui-purview-config.json</code> in your VS Code project and push. The app loads this file on every page open.
        </div>

        {/* Toolbar */}
        <div className={s.configToolbar}>
          <button className={s.addBtn} onClick={openAdd}>+ Add Custom SIT</button>
          <span className={s.configCount}>
            {buiCustom.length} BUI built-in &nbsp;·&nbsp; {userCustom.length} user-added custom
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX:'auto' }}>
          <table className={s.configTable}>
            <thead>
              <tr>
                <th>Name</th><th>Tag</th><th>Group</th><th>Type</th>
                <th>Regex</th><th>Keywords</th><th>Prox.</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buiCustom.length > 0 && (
                <>
                  <tr><td colSpan={8} className={s.groupHeader}>BUI Custom SITs (South African)</td></tr>
                  {renderRows(buiCustom, false)}
                </>
              )}
              {userCustom.length > 0 && (
                <>
                  <tr><td colSpan={8} className={s.groupHeader}>User-added Custom SITs</td></tr>
                  {renderRows(userCustom, true)}
                </>
              )}
              {buiCustom.length === 0 && userCustom.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-m)', fontStyle:'italic' }}>
                    No SITs in library yet. Click + Add Custom SIT to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note about silent built-in SITs */}
        <div style={{
          marginTop: '1rem', padding:'10px 14px', borderRadius:'var(--r-md)',
          background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)',
          fontSize:12, color:'var(--text-m)', lineHeight:1.6,
        }}>
          <strong style={{ color:'var(--text-s)' }}>Note:</strong> Three built-in Purview SITs — Credit Card Number,
          South Africa Identification Number, and South Africa Physical Addresses — are automatically included
          in applicable DLP policy rules and do not appear here. They already exist in every Purview tenant
          and require no deployment.
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
