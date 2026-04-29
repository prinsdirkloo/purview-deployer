import React from 'react'
import { BtnPrimary, BtnSecondary, BtnSuccess } from './Buttons.jsx'
import s from '../steps/Steps.module.css'

/**
 * Renders prev/next navigation.
 * position: 'top' | 'bottom'
 * At top: compact, no labels — just arrows + step counter
 * At bottom: full labels
 */
export default function StepNav({
  position = 'bottom',
  currentStep,
  maxStep,
  totalSteps = 5,
  onBack,
  onNext,
  onNextLabel,
  nextDisabled,
  nextIsSuccess,
  extraLeft,
}) {
  const isFirst = currentStep === 1
  const isLast  = currentStep === totalSteps

  const nextBtn = nextIsSuccess
    ? <BtnSuccess onClick={onNext} disabled={nextDisabled}>{onNextLabel || 'Generate Scripts ✓'}</BtnSuccess>
    : <BtnPrimary onClick={onNext} disabled={nextDisabled}>
        {onNextLabel || (isLast ? 'Finish' : (position === 'top' ? '→' : `Next →`))}
      </BtnPrimary>

  if (position === 'top') {
    return (
      <div className={s.topNav}>
        <div className={s.topNavLeft}>
          {!isFirst && (
            <BtnSecondary onClick={onBack} style={{ padding:'7px 14px', fontSize:12 }}>
              ← Back
            </BtnSecondary>
          )}
          <span className={s.stepCounter}>Step {currentStep} of {totalSteps}</span>
          {extraLeft}
        </div>
        <BtnPrimary
          onClick={onNext}
          disabled={nextDisabled}
          style={{ padding:'7px 16px', fontSize:12 }}
        >
          {isLast ? 'Finish' : 'Next →'}
        </BtnPrimary>
      </div>
    )
  }

  return (
    <div className={s.nav}>
      <div className={s.navLeft}>
        {!isFirst && <BtnSecondary onClick={onBack}>← Back</BtnSecondary>}
        {extraLeft}
      </div>
      {nextBtn}
    </div>
  )
}
