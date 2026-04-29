import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import { POLICIES } from '../../data/policies.js'
import { MODES } from '../../data/sits.js'
import s from './Steps.module.css'

export default function Step4Review() {
  const {
    allSITs, selectedSITIds, selectedPolicyIds,
    getPolicyCfg, tenantId, adminUPN, saveTenantDetails,
    goTo, currentStep,
  } = useApp()

  const selectedSITs     = allSITs.filter(sit => selectedSITIds.has(sit.id))
  const selectedPolicies = POLICIES.filter(p => selectedPolicyIds.has(p.id))

  return (
    <div className={s.step}>
      {/* Top nav */}
      <StepNav
        position="top"
        currentStep={currentStep}
        onBack={() => goTo(3)}
        onNext={() => goTo(5)}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Review & Deployment Details</div>
        <h2>Confirm before generating</h2>
        <p>Enter your tenant details — written directly into the generated XML and scripts.</p>
      </div>

      {/* Tenant details */}
      <div className={[s.card, s.tenantCard].join(' ')}>
        <div className={s.tenantCardLabel}>Deployment Details</div>
        <div className={s.tenantGrid}>
          <div className={s.formSection} style={{ marginBottom: 0 }}>
            <label className={s.formLabel}>Azure AD Tenant ID</label>
            <input
              type="text"
              value={tenantId}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              onChange={e => saveTenantDetails(e.target.value, adminUPN)}
              style={{ fontFamily:'Consolas, Menlo, monospace', fontSize:13 }}
            />
            <div className={s.fieldHint}>
              Written into the XML <code>Publisher id</code>. Find yours at{' '}
              <a href="https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview"
                target="_blank" rel="noreferrer" style={{ color:'var(--orange)' }}>
                portal.azure.com
              </a>
            </div>
          </div>
          <div className={s.formSection} style={{ marginBottom: 0 }}>
            <label className={s.formLabel}>Admin Account UPN</label>
            <input
              type="text"
              value={adminUPN}
              placeholder="admin@yourtenant.onmicrosoft.com"
              onChange={e => saveTenantDetails(tenantId, e.target.value)}
            />
            <div className={s.fieldHint}>
              Written into <code>$AdminUPN</code> in both scripts. Needs
              Compliance Administrator + Security Administrator roles.
            </div>
          </div>
        </div>
      </div>

      {/* SITs summary */}
      <div className={s.card}>
        <div className={s.reviewSectionLabel}>Sensitive Information Types ({selectedSITs.length})</div>
        <div className={s.chipList}>
          {selectedSITs.map(sit => <span key={sit.id} className={s.chip}>{sit.name}</span>)}
        </div>
      </div>

      {/* Policy summaries */}
      {selectedPolicies.map(p => {
        const cfg = getPolicyCfg(p.id)
        if (!cfg) return null
        const modeLabel = MODES.find(m => m.value === cfg.mode)?.label || cfg.mode
        return (
          <div key={p.id} className={s.card}>
            <div className={s.reviewSectionLabel}>{cfg.name}</div>
            <div className={s.reviewRow}>
              <span className={s.reviewKey}>Mode</span>
              <span className={s.reviewVal}>{modeLabel}</span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewKey}>Locations</span>
              <span className={s.reviewVal}>
                {p.endpointOnly ? 'Endpoint (auto)' : (cfg.locs || p.locs).join(', ') || '(none)'}
              </span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewKey}>Low volume</span>
              <span className={s.reviewVal}>{cfg.lowMin}–{cfg.lowMax} instances → audit</span>
            </div>
            <div className={s.reviewRow}>
              <span className={s.reviewKey}>High volume</span>
              <span className={s.reviewVal}>{cfg.highMin}+ instances → alert + tip</span>
            </div>
            {!p.endpointOnly && (
              <div className={s.reviewRow}>
                <span className={s.reviewKey}>Policy tip</span>
                <span className={s.reviewValLight}>{cfg.tipText}</span>
              </div>
            )}
          </div>
        )
      })}

      {/* Bottom nav */}
      <StepNav
        position="bottom"
        currentStep={currentStep}
        onBack={() => goTo(3)}
        onNext={() => goTo(5)}
        nextIsSuccess
        onNextLabel="Generate Scripts ✓"
      />
    </div>
  )
}
