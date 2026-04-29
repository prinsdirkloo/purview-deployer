import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import BuiltInPickerModal from '../modals/BuiltInPickerModal.jsx'
import { POLICIES } from '../../data/policies.js'
import { MODES } from '../../data/sits.js'
import { getEffectiveSITsForPolicy } from '../../utils/scriptBuilder.js'
import s from './Steps.module.css'

const ALL_LOCS = ['Exchange','SharePoint','OneDrive','Teams']

function PolicyConfig({ policy }) {
  const {
    getPolicyCfg, updatePolicyCfg,
    policyExtraSITs, removeExtraSITFromPolicy,
    allSITs, selectedSITIds,
  } = useApp()
  const [pickerOpen, setPickerOpen] = useState(false)
  const cfg = getPolicyCfg(policy.id)
  const includedSITs = getEffectiveSITsForPolicy(policy, allSITs, selectedSITIds, policyExtraSITs)

  const update = (field, value) => updatePolicyCfg(policy.id, { [field]: value })
  const toggleLoc = (loc) => {
    const locs = cfg.locs || policy.locs
    const next = locs.includes(loc) ? locs.filter(l => l !== loc) : [...locs, loc]
    update('locs', next)
  }

  if (!cfg) return null

  return (
    <div className={s.card}>
      {/* Policy name */}
      <div className={s.formSection}>
        <label className={s.formLabel}>Policy name</label>
        <input type="text" value={cfg.name} onChange={e => update('name', e.target.value)} />
      </div>

      {/* Mode */}
      <div className={s.formSection}>
        <label className={s.formLabel}>Deployment mode</label>
        <div className={s.modeGrid}>
          {MODES.map(m => (
            <div
              key={m.value}
              className={[s.modeOpt, cfg.mode === m.value && s.modeSelected].filter(Boolean).join(' ')}
              onClick={() => update('mode', m.value)}
            >
              <div className={s.modeTitle}>{m.label}</div>
              <div className={s.modeDesc}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      {!policy.endpointOnly ? (
        <div className={s.formSection}>
          <label className={s.formLabel}>Workload locations</label>
          <div className={s.locToggles}>
            {ALL_LOCS.map(loc => (
              <div
                key={loc}
                className={[s.locToggle, (cfg.locs || policy.locs).includes(loc) && s.locOn]
                  .filter(Boolean).join(' ')}
                onClick={() => toggleLoc(loc)}
              >
                <div className={s.locDot} />
                {loc}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={s.formSection}>
          <div className={s.alertInfo}>
            <span>ℹ</span>
            <span>Endpoint DLP location set automatically. Requires E5 or Purview Suite — script skips gracefully if unavailable.</span>
          </div>
        </div>
      )}

      {/* Thresholds */}
      <div className={s.formSection}>
        <label className={s.formLabel}>Detection thresholds</label>
        <div className={s.thresholdGrid}>
          <div className={s.thresholdCard}>
            <div className={s.thresholdLabel}>Low volume (audit only)</div>
            <div className={s.miniRow}>
              <label>Min</label>
              <input type="number" min="1" value={cfg.lowMin}
                onChange={e => update('lowMin', +e.target.value)} />
            </div>
            <div className={s.miniRow}>
              <label>Max</label>
              <input type="number" min="1" value={cfg.lowMax}
                onChange={e => update('lowMax', +e.target.value)} />
            </div>
          </div>
          <div className={s.thresholdCard}>
            <div className={s.thresholdLabel}>High volume (alert + tip)</div>
            <div className={s.miniRow}>
              <label>Min</label>
              <input type="number" min="1" value={cfg.highMin}
                onChange={e => update('highMin', +e.target.value)} />
            </div>
            <div className={s.miniRow}>
              <label>Max</label>
              <span className={s.unlimitedLabel}>Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy tip */}
      {!policy.endpointOnly && (
        <div className={s.formSection}>
          <label className={s.formLabel}>Policy tip message (high volume rule)</label>
          <textarea rows={2} value={cfg.tipText}
            onChange={e => update('tipText', e.target.value)} />
        </div>
      )}

      {/* SIT panel */}
      <div className={s.sitPanel}>
        <div className={s.sitPanelHeader}>
          <span className={s.sitPanelTitle}>
            SITs included in rules ({includedSITs.length})
            <span className={s.sitPanelLegend}> ◆ BUI custom &nbsp; ⬡ Purview built-in &nbsp; ★ User custom</span>
          </span>
          <button className={s.addSITBtn} onClick={() => setPickerOpen(true)}>+ Add built-in SIT</button>
        </div>
        <div className={s.sitPills}>
          {includedSITs.length === 0 && (
            <span className={s.noPills}>No SITs from your Step 1 selection match this policy group.</span>
          )}
          {includedSITs.map(sit => {
            const cls = sit.builtIn ? s.pillPurview : sit.isCustom ? s.pillCustom : s.pillBUI
            const icon = sit.builtIn ? '⬡' : sit.isCustom ? '★' : '◆'
            return (
              <span key={sit.id} className={[s.sitPill, cls].join(' ')} title={sit.guid}>
                {icon} {sit.name.replace(/^South African? /, 'SA ')}
                {sit.isExtraPurview && (
                  <button className={s.pillRemove}
                    onClick={() => removeExtraSITFromPolicy(policy.id, sit.id)}>×</button>
                )}
              </span>
            )
          })}
        </div>
      </div>

      <BuiltInPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        policyId={policy.id}
        includedGuids={new Set(includedSITs.map(s => s.guid))}
      />
    </div>
  )
}

export default function Step3Configure() {
  const { selectedPolicyIds, ensureConfigs, goTo, currentStep } = useApp()
  const [activeTab, setActiveTab] = useState(null)
  const selectedPolicies = POLICIES.filter(p => selectedPolicyIds.has(p.id))

  useEffect(() => {
    ensureConfigs()
    if (selectedPolicies.length > 0 && !activeTab) setActiveTab(selectedPolicies[0].id)
  }, []) // eslint-disable-line

  function shortName(name) {
    const m = name.match(/\(([^)]+)\)/)
    if (m) return (name.includes('Financial') ? 'Financial' : 'PII') + ' (' + m[1] + ')'
    return name.replace(/^SA /, '').trim().substring(0, 24)
  }

  return (
    <div className={s.step}>
      {/* Top nav */}
      <StepNav
        position="top"
        currentStep={currentStep}
        onBack={() => goTo(2)}
        onNext={() => goTo(4)}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Deployment Configuration</div>
        <h2>Configure each policy</h2>
        <p>Customise each policy's name, mode, and thresholds. Default: Low = 1–9 instances, High = 10+ instances.</p>
      </div>

      {selectedPolicies.length > 1 && (
        <div className={s.tabs}>
          {selectedPolicies.map(p => (
            <button
              key={p.id}
              className={[s.tab, activeTab === p.id && s.tabActive].filter(Boolean).join(' ')}
              onClick={() => setActiveTab(p.id)}
            >
              {shortName(p.name)}
            </button>
          ))}
        </div>
      )}

      {selectedPolicies.map(p => (
        <div key={p.id}
          style={{ display: activeTab === p.id || selectedPolicies.length === 1 ? 'block' : 'none' }}>
          <PolicyConfig policy={p} />
        </div>
      ))}

      {/* Bottom nav */}
      <StepNav
        position="bottom"
        currentStep={currentStep}
        onBack={() => goTo(2)}
        onNext={() => goTo(4)}
        onNextLabel="Review & Generate →"
      />
    </div>
  )
}
