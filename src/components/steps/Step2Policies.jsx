import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { BtnPrimary, BtnSecondary } from '../ui/Buttons.jsx'
import { getEffectiveSitIds } from '../../utils/scriptBuilder.js'
import s from './Steps.module.css'

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

import { POLICIES } from '../../data/policies.js'

function PolicyCard({ policy, selected, available, allSITs, selectedSITIds, onToggle }) {
  const effIds = getEffectiveSitIds(policy, allSITs)
  const matchingSITs = allSITs.filter(s => effIds.includes(s.id))

  return (
    <div
      className={[s.toggleCard, s.policyCard, selected && s.selected, !available && s.unavailable].filter(Boolean).join(' ')}
      onClick={() => available && onToggle()}
    >
      <div className={[s.checkbox, selected && s.checked].filter(Boolean).join(' ')}>
        {selected && CHECK}
      </div>
      <div className={s.cardInfo}>
        <div className={s.cardName}>{policy.name}</div>
        <div className={s.cardDesc}>{policy.desc}</div>
        <div className={s.locChips}>
          {policy.locs.map(l => <span key={l} className={s.locChip}>{l}</span>)}
          {policy.endpointOnly && <span className={[s.locChip, s.locChipNote].join(' ')}>E5 required</span>}
        </div>
        <div className={s.sitMappingLabel}>SITs used in this policy:</div>
        <div className={s.sitChips}>
          {matchingSITs.map(sit => (
            <span
              key={sit.id}
              className={[s.sitChip, selectedSITIds.has(sit.id) && s.sitChipMatch].filter(Boolean).join(' ')}
            >
              {sit.name.replace(/^South African? /, 'SA ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Step2Policies() {
  const { allSITs, selectedSITIds, selectedPolicyIds, togglePolicy, goTo } = useApp()

  return (
    <div className={s.step}>
      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Step 2 of 5</div>
        <h2>DLP Policies</h2>
        <p>Select which of the 8 policies to deploy. <strong className={s.orange}>Highlighted chips</strong> are SITs you've selected — grey chips are not yet selected. All policies default to Simulation mode.</p>
      </div>

      <div className={s.gridOne}>
        {POLICIES.map(policy => {
          const effIds = getEffectiveSitIds(policy, allSITs)
          const available = effIds.some(id => selectedSITIds.has(id))
          return (
            <PolicyCard
              key={policy.id}
              policy={policy}
              selected={selectedPolicyIds.has(policy.id)}
              available={available}
              allSITs={allSITs}
              selectedSITIds={selectedSITIds}
              onToggle={() => togglePolicy(policy.id)}
            />
          )
        })}
      </div>

      <div className={s.nav}>
        <div className={s.navLeft}>
          <BtnSecondary onClick={() => goTo(1)}>← Back</BtnSecondary>
          {selectedPolicyIds.size > 0 && <span className={s.countLabel}>{selectedPolicyIds.size} selected</span>}
        </div>
        <BtnPrimary onClick={() => goTo(3)} disabled={selectedPolicyIds.size === 0}>
          Next: Configure →
        </BtnPrimary>
      </div>
    </div>
  )
}
