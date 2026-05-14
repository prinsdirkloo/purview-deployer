import React from 'react'
import StepNav from '../../ui/StepNav.jsx'
import LabelCard from './LabelCard.jsx'
import s from '../Steps.module.css'
import ls from './Labels.module.css'

export default function StepL1Taxonomy({ labels, setLabels, currentStep, goTo }) {
  const update = (id, updated) =>
    setLabels(prev => prev.map(l => l.id === id ? updated : l))

  const canNext = labels.every(l => l.displayName.trim() && l.tooltip.trim())

  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        totalSteps={3}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Sensitivity Labels</div>
        <h2>Configure your label taxonomy</h2>
        <p>
          The BUI standard is a 4-label flat taxonomy. Edit each label's display
          name, tooltip, colour, and content markings below. All labels are created
          with <code>ContentType "File, Email"</code> — they can be promoted to
          parent labels at any time by adding sub-labels in the Purview portal,
          no script changes required.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-m)', margin: '6px 0 0 0' }}>
          <strong style={{ color: 'var(--text-s)' }}>Note:</strong> Encryption is not included
          in this script — it is configured in Phase 06 of the Sensitivity Labelling maturity
          track, after mandatory labelling is stable.
        </p>
      </div>

      {labels.map(label => (
        <LabelCard
          key={label.id}
          label={label}
          onChange={updated => update(label.id, updated)}
        />
      ))}

      <StepNav
        position="bottom"
        currentStep={currentStep}
        totalSteps={3}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
        onNextLabel="Next: Deployment Settings →"
      />
    </div>
  )
}
