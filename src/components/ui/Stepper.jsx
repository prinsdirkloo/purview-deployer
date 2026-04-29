import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import s from './Stepper.module.css'

const STEPS = ['SITs', 'Policies', 'Configure', 'Review', 'Scripts']

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function Stepper() {
  const { currentStep, maxStep, goTo } = useApp()

  return (
    <div className={s.stepper}>
      {STEPS.map((label, i) => {
        const n = i + 1
        const isActive  = n === currentStep
        const isDone    = n < currentStep
        const isDisabled = n > maxStep
        return (
          <div
            key={n}
            className={[
              s.step,
              isActive   && s.active,
              isDone     && s.done,
              isDisabled && s.disabled,
            ].filter(Boolean).join(' ')}
            onClick={() => !isDisabled && goTo(n)}
          >
            <div className={s.num}>
              {isDone ? CHECK : n}
            </div>
            <div className={s.label}>{label}</div>
          </div>
        )
      })}
    </div>
  )
}
