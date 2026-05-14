import React, { useState, useCallback } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { useConfig } from './hooks/useConfig.js'
import { useTheme } from './hooks/useTheme.js'
import { DEFAULT_LABELS } from './data/labels.js'
import Header from './components/ui/Header.jsx'
import Stepper from './components/ui/Stepper.jsx'
import Step1SITs from './components/steps/Step1SITs.jsx'
import Step2Policies from './components/steps/Step2Policies.jsx'
import Step3Configure from './components/steps/Step3Configure.jsx'
import Step4Review from './components/steps/Step4Review.jsx'
import Step5Scripts from './components/steps/Step5Scripts.jsx'
import StepL1Taxonomy from './components/steps/labels/StepL1Taxonomy.jsx'
import StepL2Settings from './components/steps/labels/StepL2Settings.jsx'
import StepL3Script from './components/steps/labels/StepL3Script.jsx'
import ConfigModal from './components/modals/ConfigModal.jsx'
import ls from './components/steps/labels/Labels.module.css'

// ── DLP Track ────────────────────────────────────────────────────────────────
function DLPTrack() {
  const { currentStep } = useApp()
  return (
    <>
      <Stepper />
      {currentStep === 1 && <Step1SITs />}
      {currentStep === 2 && <Step2Policies />}
      {currentStep === 3 && <Step3Configure />}
      {currentStep === 4 && <Step4Review />}
      {currentStep === 5 && <Step5Scripts />}
    </>
  )
}

// ── Labels Track ─────────────────────────────────────────────────────────────
function LabelsTrack({ labels, setLabels, adminUPN }) {
  const [step, setStep]       = useState(1)
  const [orgName, setOrgName] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bui_tenant_details') || '{}').orgName || '' } catch(_) { return '' }
  })
  const [labelAdminUPN, setLabelAdminUPN] = useState(adminUPN || '')

  const goTo    = (n) => setStep(n)
  const startOver = () => { setLabels([...DEFAULT_LABELS]); setStep(1) }

  // Stepper for labels track
  const LABEL_STEPS = ['Taxonomy', 'Settings', 'Script']

  return (
    <div>
      {/* Mini stepper */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, padding: '12px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-s)',
      }}>
        {LABEL_STEPS.map((label, i) => {
          const n = i + 1
          const isActive = n === step
          const isDone   = n < step
          return (
            <React.Fragment key={n}>
              <div
                onClick={() => n <= step && setStep(n)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 16px', borderRadius: 20,
                  cursor: n <= step ? 'pointer' : 'default',
                  background: isActive ? 'var(--orange)' : isDone ? 'rgba(217,134,28,0.15)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: isActive ? '#fff' : isDone ? 'var(--orange)' : 'var(--border-m)',
                  color: isActive ? 'var(--orange)' : isDone ? '#fff' : 'var(--text-m)',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {isDone ? '✓' : n}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isActive ? '#fff' : isDone ? 'var(--orange-d)' : 'var(--text-m)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {label}
                </span>
              </div>
              {i < LABEL_STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step content */}
      {step === 1 && (
        <StepL1Taxonomy
          labels={labels}
          setLabels={setLabels}
          currentStep={1}
          goTo={goTo}
        />
      )}
      {step === 2 && (
        <StepL2Settings
          orgName={orgName}
          setOrgName={setOrgName}
          adminUPN={labelAdminUPN}
          setAdminUPN={setLabelAdminUPN}
          labels={labels}
          currentStep={2}
          goTo={goTo}
        />
      )}
      {step === 3 && (
        <StepL3Script
          labels={labels}
          orgName={orgName}
          adminUPN={labelAdminUPN}
          currentStep={3}
          goTo={goTo}
          startOver={startOver}
        />
      )}
    </div>
  )
}

// ── App inner — handles track switching ──────────────────────────────────────
function AppInner({ statusMsg, exportConfig, importConfig, ghSettings, updateGhSettings, ghStatus, ghMsg }) {
  const { configModalOpen, setConfigModalOpen, adminUPN } = useApp()
  const { isDark, toggleTheme } = useTheme()

  // Track switcher state — 'dlp' | 'labels'
  const [activeTrack, setActiveTrack] = useState('dlp')

  // Label state lives here so it persists across track switches
  const [labels, setLabels] = useState(() => {
    try {
      const saved = localStorage.getItem('bui_label_config')
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return [...DEFAULT_LABELS]
  })

  // Persist label config to localStorage on every change
  const updateLabels = useCallback((newLabels) => {
    setLabels(newLabels)
    try { localStorage.setItem('bui_label_config', JSON.stringify(newLabels)) } catch(_) {}
  }, [])

  return (
    <>
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        activeTrack={activeTrack}
        setActiveTrack={setActiveTrack}
      />

      {activeTrack === 'dlp'
        ? <DLPTrack />
        : <LabelsTrack labels={labels} setLabels={updateLabels} adminUPN={adminUPN} />
      }

      <ConfigModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        statusMsg={statusMsg}
        exportConfig={exportConfig}
        importConfig={importConfig}
        ghSettings={ghSettings}
        updateGhSettings={updateGhSettings}
        ghStatus={ghStatus}
        ghMsg={ghMsg}
      />
    </>
  )
}

export default function App() {
  const { allSITs, saveSITs, statusMsg, exportConfig, importConfig,
          ghSettings, updateGhSettings, ghStatus, ghMsg } = useConfig()
  return (
    <AppProvider allSITs={allSITs} saveSITs={saveSITs}>
      <AppInner
        statusMsg={statusMsg}
        exportConfig={exportConfig}
        importConfig={importConfig}
        ghSettings={ghSettings}
        updateGhSettings={updateGhSettings}
        ghStatus={ghStatus}
        ghMsg={ghMsg}
      />
    </AppProvider>
  )
}
