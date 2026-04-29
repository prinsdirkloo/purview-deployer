import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import { getEffectiveSitIds } from '../../utils/scriptBuilder.js'
import { POLICIES } from '../../data/policies.js'
import s from './Steps.module.css'

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function PolicyCard({ policy, selected, available, allSITs, selectedSITIds, onToggle }) {
  const effIds = getEffectiveSitIds(policy, allSITs)
  const matchingSITs = allSITs.filter(s => effIds.includes(s.id))
  return (
    <div
      className={[s.toggleCard, s.policyCard, selected && s.selected, !available && s.unavailable]
        .filter(Boolean).join(' ')}
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
          {policy.endpointOnly && (
            <span className={[s.locChip, s.locChipNote].join(' ')}>E5 required</span>
          )}
        </div>
        <div className={s.sitMappingLabel}>SITs used in this policy:</div>
        <div className={s.sitChips}>
          {matchingSITs.map(sit => (
            <span
              key={sit.id}
              className={[s.sitChip, selectedSITIds.has(sit.id) && s.sitChipMatch]
                .filter(Boolean).join(' ')}
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
  const { allSITs, selectedSITIds, selectedPolicyIds, togglePolicy, goTo, currentStep } = useApp()
  const canNext = selectedPolicyIds.size > 0

  return (
    <div className={s.step}>
      {/* Top nav */}
      <StepNav
        position="top"
        currentStep={currentStep}
        onBack={() => goTo(1)}
        onNext={() => goTo(3)}
        nextDisabled={!canNext}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>DLP Policies</div>
        <h2>Select policies to deploy</h2>
        <p>
          <strong className={s.orange}>Highlighted chips</strong> are SITs you've
          selected. Grey chips are not yet selected. All policies default to Simulation mode.
        </p>
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

      {/* Bottom nav */}
      <StepNav
        position="bottom"
        currentStep={currentStep}
        onBack={() => goTo(1)}
        onNext={() => goTo(3)}
        nextDisabled={!canNext}
        onNextLabel="Next: Configure →"
        extraLeft={selectedPolicyIds.size > 0 &&
          <span className={s.countLabel}>{selectedPolicyIds.size} selected</span>}
      />
    </div>
  )
}
