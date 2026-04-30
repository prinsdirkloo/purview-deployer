import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import Modal from '../ui/Modal.jsx'
import { BtnPrimary, BtnSecondary } from '../ui/Buttons.jsx'
import s from './Steps.module.css'
import m from '../modals/Modals.module.css'

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function SITCard({ sit, selected, onToggle }) {
  const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
  const tagClass = sit.tag === 'pii' ? s.badgePii : s.badgeFin
  const typeLabel = sit.isCustom ? 'Custom' : 'BUI Custom'
  return (
    <div
      className={[s.toggleCard, selected && s.selected].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      <div className={[s.checkbox, selected && s.checked].filter(Boolean).join(' ')}>
        {selected && CHECK}
      </div>
      <div className={s.cardInfo}>
        <div className={s.cardName}>{sit.name}</div>
        <div className={s.cardDesc}>{sit.desc}</div>
        <div className={s.badges}>
          <span className={[s.badge, tagClass].join(' ')}>{tagLabel}</span>
          <span className={[s.badge, s.badgeBuiltin].join(' ')}>{typeLabel}</span>
        </div>
      </div>
    </div>
  )
}

// Library picker — shows all custom SITs not yet added to the main grid
function LibraryPicker({ open, onClose, allLibrarySITs, visibleIds, onAdd }) {
  const [query, setQuery] = useState('')
  const available = allLibrarySITs.filter(s =>
    !visibleIds.has(s.id) &&
    (!query || s.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add SITs from library"
      footer={<button className={m.closeBtn} onClick={onClose}>Done</button>}
    >
      <p className={m.pickerDesc}>
        Select additional custom SITs from your library to include on the selection screen.
        Manage the library contents via <strong>⚙ Config</strong>.
      </p>
      <input
        type="text"
        className={m.pickerSearch}
        placeholder="Search library…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />
      <div className={m.pickerList}>
        {available.length === 0 && (
          <div className={m.pickerEmpty}>
            {allLibrarySITs.length === visibleIds.size
              ? 'All library SITs are already on the selection screen.'
              : 'No matching SITs found.'}
          </div>
        )}
        {available.map(sit => (
          <div key={sit.id} className={m.pickerItem}>
            <div className={m.pickerItemInfo}>
              <div className={m.pickerItemName}>{sit.name}</div>
              <div className={m.pickerItemMeta}>{sit.desc}</div>
            </div>
            <button className={m.pickerAddBtn} onClick={() => onAdd(sit.id)}>
              + Add
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function Step1SITs() {
  const { allSITs, selectedSITIds, toggleSIT, selectAllSITs, goTo, currentStep } = useApp()
  const [pickerOpen, setPickerOpen] = useState(false)
  // IDs shown on the grid — starts with all library SITs, user can add more from the library
  const [visibleIds, setVisibleIds] = useState(() => new Set(allSITs.map(s => s.id)))

  // Sync visibleIds if allSITs changes (e.g. after config edit)
  const visibleSITs = allSITs.filter(s => visibleIds.has(s.id))
  const canNext = selectedSITIds.size > 0

  const addToVisible = (id) => {
    setVisibleIds(prev => new Set([...prev, id]))
    // Also auto-select it
    if (!selectedSITIds.has(id)) toggleSIT(id)
  }

  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Sensitive Information Types</div>
        <h2>Select SITs to deploy</h2>
        <p>
          Select which custom SITs to include in this deployment. Each selected SIT
          will be included in the XML rule package and wired into the relevant DLP
          policy rules. Built-in Purview SITs (Credit Card, SA ID, SA Physical
          Addresses) are automatically included in applicable policies.
        </p>
      </div>

      <div className={s.selectAllRow}>
        <button className={s.smallBtn} onClick={() => selectAllSITs(true, visibleSITs)}>Select all</button>
        <button className={s.smallBtn} onClick={() => selectAllSITs(false, visibleSITs)}>Clear all</button>
        <span className={s.countLabel}>{selectedSITIds.size} selected</span>
        <button
          className={s.addFromLibraryBtn}
          onClick={() => setPickerOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
          + Add from library
        </button>
      </div>

      <div className={s.gridTwo}>
        {visibleSITs.map(sit => (
          <SITCard
            key={sit.id}
            sit={sit}
            selected={selectedSITIds.has(sit.id)}
            onToggle={() => toggleSIT(sit.id)}
          />
        ))}
      </div>

      <StepNav
        position="bottom"
        currentStep={currentStep}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
        onNextLabel="Next: DLP Policies →"
      />

      <LibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allLibrarySITs={allSITs}
        visibleIds={visibleIds}
        onAdd={addToVisible}
      />
    </div>
  )
}
