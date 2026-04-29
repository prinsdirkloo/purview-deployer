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

  const builtInBUI    = allSITs.filter(s => !s.builtIn && !s.isCustom)
  const builtInPurview = allSITs.filter(s => s.builtIn)
  const customSITs    = allSITs.filter(s => s.isCustom)

  const openAdd  = () => { setEditingSIT(null); setFormOpen(true) }
  const openEdit = (sit) => { setEditingSIT(sit); setFormOpen(true) }

  const deleteSIT = (id) => {
    if (!confirm('Remove this SIT from the library?')) return
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

  const renderRows = (group, label) => (
    <>
      <tr>
        <td colSpan={8} className={s.groupHeader}>{label}</td>
      </tr>
      {group.map(sit => {
        const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
        const tagClass = sit.tag === 'pii' ? s.tagPii : s.tagFin
        const typeLabel = sit.builtIn ? 'Purview Built-in' : sit.isCustom ? 'Custom' : 'BUI Custom'
        const regexPreview = sit.regex
          ? <code style={{ fontSize: 10, maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sit.regex}>{sit.regex}</code>
          : <span style={{ color: 'var(--text-m)', fontSize: 11, fontStyle: 'italic' }}>—</span>
        const kwPreview = (sit.keywords || []).length > 0
          ? sit.keywords.slice(0, 2).join(', ') + (sit.keywords.length > 2 ? ` +${sit.keywords.length - 2}` : '')
          : '—'
        return (
          <tr key={sit.id} className={sit.builtIn ? s.builtinRow : ''}>
            <td className={s.tdName}>{sit.name}</td>
            <td><span className={[s.tagBadge, tagClass].join(' ')}>{tagLabel}</span></td>
            <td className={s.tdMeta}>{sit.group}</td>
            <td><span className={[s.rowType, sit.isCustom && s.rowTypeCustom].filter(Boolean).join(' ')}>{typeLabel}</span></td>
            <td>{regexPreview}</td>
            <td className={s.tdMeta}>{kwPreview}</td>
            <td className={s.tdMeta}>{sit.proximity || 300}</td>
            <td style={{ whiteSpace: 'nowrap' }}>
              {sit.builtIn ? (
                <span className={s.managedLabel} title="Built-in Purview SITs cannot be modified">Managed by Purview</span>
              ) : (
                <>
                  <button className={`${s.iconBtn} ${s.iconBtnEdit}`} onClick={() => openEdit(sit)} title="Edit">✎</button>
                  {sit.isCustom && <button className={`${s.iconBtn} ${s.iconBtnDel}`} onClick={() => deleteSIT(sit.id)} title="Delete">✕</button>}
                </>
              )}
            </td>
          </tr>
        )
      })}
    </>
  )

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="SIT Library & Configuration"
        wide
        footer={<>
          <span style={{ fontSize: 12, color: 'var(--text-m)', marginRight: 'auto' }}>{statusMsg}</span>
          <button className={s.closeBtn} onClick={onClose}>Close</button>
        </>}
      >
        {/* Storage bar */}
        <div className={s.storageBar}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-m)', flexShrink: 0 }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span className={s.storageMsg}>{statusMsg}</span>
          <button className={s.exportBtn} onClick={exportConfig}>⬇ Export &amp; commit to repo</button>
          <label className={s.importLabel}>
            ⬆ Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          {importErr && <span style={{ color: 'var(--err)', fontSize: 12 }}>{importErr}</span>}
        </div>

        {/* Storage hint */}
        <div className={s.storageHint}>
          <strong>How changes are saved:</strong> Changes here are saved to <code>localStorage</code> immediately.
          To make them permanent across all browsers and devices, click <strong>Export &amp; commit to repo</strong>,
          move the downloaded <code>bui-purview-config.json</code> into your VS Code project folder, then commit and push.
        </div>

        {/* Toolbar */}
        <div className={s.configToolbar}>
          <button className={s.addBtn} onClick={openAdd}>+ Add Custom SIT</button>
          <span className={s.configCount}>
            {builtInBUI.length} BUI custom · {builtInPurview.length} Purview built-in · {customSITs.length} user-added
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
              {builtInBUI.length > 0    && renderRows(builtInBUI,    'BUI Custom SITs')}
              {builtInPurview.length > 0 && renderRows(builtInPurview, 'Built-in Purview SITs')}
              {customSITs.length > 0    && renderRows(customSITs,    'User-added Custom SITs')}
            </tbody>
          </table>
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
