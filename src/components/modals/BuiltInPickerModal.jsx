import React, { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { BUILTIN_CATALOGUE, REGION_LABELS, REGION_ORDER } from '../../data/builtinCatalogue.js'
import s from './Modals.module.css'

export default function BuiltInPickerModal({ open, onClose, policyId, includedGuids }) {
  const { addExtraSITToPolicy } = useApp()
  const [query, setQuery] = useState('')

  const filtered = BUILTIN_CATALOGUE.filter(sit =>
    !query || sit.name.toLowerCase().includes(query.toLowerCase()) || sit.region.toLowerCase().includes(query.toLowerCase())
  )

  const regions = REGION_ORDER.filter(r => filtered.some(s => s.region === r))

  const addSIT = (catalogueSIT) => {
    addExtraSITToPolicy(policyId, {
      id: 'purview_' + catalogueSIT.guid.replace(/-/g, ''),
      name: catalogueSIT.name,
      desc: `Built-in Purview SIT (${catalogueSIT.region})`,
      tag: catalogueSIT.tag,
      group: catalogueSIT.group,
      builtIn: true,
      isExtraPurview: true,
      guid: catalogueSIT.guid,
      conf: catalogueSIT.conf,
      regex: '', keywords: [], proximity: 300,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Built-in Purview SIT"
      footer={<button className={s.closeBtn} onClick={onClose}>Done</button>}
    >
      <p className={s.pickerDesc}>Select any built-in Purview SIT to add to this policy. Only the name, GUID, and confidence level are needed — matching logic is compiled into Purview.</p>
      <input
        type="text"
        className={s.pickerSearch}
        placeholder="Search SITs… e.g. passport, bank, social security"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />
      <div className={s.pickerList}>
        {filtered.length === 0 && <div className={s.pickerEmpty}>No matching SITs found</div>}
        {regions.map(region => (
          <div key={region}>
            <div className={s.pickerGroupHeader}>{REGION_LABELS[region] || region}</div>
            {filtered.filter(sit => sit.region === region).map(sit => {
              const isAdded = includedGuids.has(sit.guid)
              const confLabel = { High: '85%', Medium: '75%', Low: '65%' }[sit.conf] || sit.conf
              return (
                <div key={sit.guid} className={[s.pickerItem, isAdded && s.pickerItemAdded].filter(Boolean).join(' ')}>
                  <div className={s.pickerItemInfo}>
                    <div className={s.pickerItemName}>{sit.name}</div>
                    <div className={s.pickerItemMeta}>GUID: {sit.guid} · Confidence: {confLabel} · {sit.group}</div>
                  </div>
                  <button
                    className={s.pickerAddBtn}
                    onClick={() => !isAdded && addSIT(sit)}
                    disabled={isAdded}
                  >
                    {isAdded ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Modal>
  )
}
