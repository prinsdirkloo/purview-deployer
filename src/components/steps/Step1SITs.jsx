import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { BtnPrimary } from '../ui/Buttons.jsx'
import s from './Steps.module.css'

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function SITCard({ sit, selected, onToggle }) {
  const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
  const tagClass = sit.tag === 'pii' ? s.badgePii : s.badgeFin
  const typeLabel = sit.builtIn ? 'Built-in' : sit.isCustom ? 'Custom' : 'BUI Custom'
  return (
    <div className={[s.toggleCard, selected && s.selected].filter(Boolean).join(' ')} onClick={onToggle}>
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

export default function Step1SITs() {
  const { allSITs, selectedSITIds, toggleSIT, selectAllSITs, goTo } = useApp()

  return (
    <div className={s.step}>
      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Step 1 of 5</div>
        <h2>Sensitive Information Types</h2>
        <p>Select which SITs to include in this deployment. BUI Custom SITs require the XML rule package (generated from your selection). Built-in SITs are already in Purview.</p>
      </div>

      <div className={s.selectAllRow}>
        <button className={s.smallBtn} onClick={() => selectAllSITs(true, allSITs)}>Select all</button>
        <button className={s.smallBtn} onClick={() => selectAllSITs(false, allSITs)}>Clear all</button>
        <span className={s.countLabel}>{selectedSITIds.size} selected</span>
      </div>

      <div className={s.gridTwo}>
        {allSITs.map(sit => (
          <SITCard
            key={sit.id}
            sit={sit}
            selected={selectedSITIds.has(sit.id)}
            onToggle={() => toggleSIT(sit.id)}
          />
        ))}
      </div>

      <div className={s.nav}>
        <div />
        <BtnPrimary onClick={() => goTo(2)} disabled={selectedSITIds.size === 0}>
          Next: DLP Policies →
        </BtnPrimary>
      </div>
    </div>
  )
}
