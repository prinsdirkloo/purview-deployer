import React from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { useConfig } from './hooks/useConfig.js'
import { useTheme } from './hooks/useTheme.js'
import Header from './components/ui/Header.jsx'
import Stepper from './components/ui/Stepper.jsx'
import Step1SITs from './components/steps/Step1SITs.jsx'
import Step2Policies from './components/steps/Step2Policies.jsx'
import Step3Configure from './components/steps/Step3Configure.jsx'
import Step4Review from './components/steps/Step4Review.jsx'
import Step5Scripts from './components/steps/Step5Scripts.jsx'
import ConfigModal from './components/modals/ConfigModal.jsx'

function AppInner({ statusMsg, exportConfig, importConfig }) {
  const { currentStep, configModalOpen, setConfigModalOpen } = useApp()
  const { isDark, toggleTheme } = useTheme()

  return (
    <>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <Stepper />

      {currentStep === 1 && <Step1SITs />}
      {currentStep === 2 && <Step2Policies />}
      {currentStep === 3 && <Step3Configure />}
      {currentStep === 4 && <Step4Review />}
      {currentStep === 5 && <Step5Scripts />}

      <ConfigModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        statusMsg={statusMsg}
        exportConfig={exportConfig}
        importConfig={importConfig}
      />
    </>
  )
}

export default function App() {
  const { allSITs, saveSITs, statusMsg, exportConfig, importConfig } = useConfig()

  return (
    <AppProvider allSITs={allSITs} saveSITs={saveSITs}>
      <AppInner statusMsg={statusMsg} exportConfig={exportConfig} importConfig={importConfig} />
    </AppProvider>
  )
}
