import React, { createContext, useContext, useState, useCallback } from 'react'
import { POLICIES } from '../data/policies.js'

const AppContext = createContext(null)

export function AppProvider({ allSITs, saveSITs, children }) {
  // Wizard navigation
  const [currentStep, setCurrentStep] = useState(1)
  const [maxStep, setMaxStep] = useState(1)

  // Selections
  const [selectedSITIds, setSelectedSITIds] = useState(new Set())
  const [selectedPolicyIds, setSelectedPolicyIds] = useState(new Set())

  // Per-policy configuration (name, mode, locs, thresholds, tip text)
  const [policyConfigs, setPolicyConfigs] = useState({})

  // Extra built-in SITs added via picker per policy { policyId: [sit, ...] }
  const [policyExtraSITs, setPolicyExtraSITs] = useState({})

  // Deployment details entered on the Review step
  const [tenantId, setTenantId] = useState(() => { try { return JSON.parse(localStorage.getItem('bui_tenant_details') || '{}').tenantId || '' } catch(_) { return '' } })
  const [adminUPN, setAdminUPN]  = useState(() => { try { return JSON.parse(localStorage.getItem('bui_tenant_details') || '{}').adminUPN  || '' } catch(_) { return '' } })

  // Modals
  const [configModalOpen, setConfigModalOpen] = useState(false)

  // Save tenant details to localStorage
  const saveTenantDetails = useCallback((tid, upn) => {
    setTenantId(tid); setAdminUPN(upn)
    try { localStorage.setItem('bui_tenant_details', JSON.stringify({ tenantId: tid, adminUPN: upn })) } catch(_) {}
  }, [])

  // Navigate to a step
  const goTo = useCallback((n) => {
    if (n < 1 || n > 5) return
    setCurrentStep(n)
    setMaxStep(prev => Math.max(prev, n))
  }, [])

  // SIT toggle
  const toggleSIT = useCallback((id) => {
    setSelectedSITIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const selectAllSITs = useCallback((on, allSITs) => {
    setSelectedSITIds(on ? new Set(allSITs.map(s => s.id)) : new Set())
  }, [])

  // Policy toggle
  const togglePolicy = useCallback((id) => {
    setSelectedPolicyIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // Get or initialise a policy config
  const getPolicyCfg = useCallback((pid) => {
    if (policyConfigs[pid]) return policyConfigs[pid]
    const p = POLICIES.find(x => x.id === pid)
    if (!p) return null
    return {
      name: p.name,
      mode: 'TestWithoutNotifications',
      locs: [...p.locs],
      lowMin: 1, lowMax: 9,
      highMin: 10,
      tipText: p.tipText,
    }
  }, [policyConfigs])

  const updatePolicyCfg = useCallback((pid, updates) => {
    setPolicyConfigs(prev => ({
      ...prev,
      [pid]: { ...(prev[pid] || getPolicyCfg(pid)), ...updates },
    }))
  }, [getPolicyCfg])

  // Ensure all selected policies have a config entry
  const ensureConfigs = useCallback(() => {
    setPolicyConfigs(prev => {
      const next = { ...prev }
      selectedPolicyIds.forEach(pid => {
        if (!next[pid]) next[pid] = getPolicyCfg(pid)
      })
      return next
    })
  }, [selectedPolicyIds, getPolicyCfg])

  // Extra SIT management for policies
  const addExtraSITToPolicy = useCallback((policyId, sit) => {
    setPolicyExtraSITs(prev => {
      const existing = prev[policyId] || []
      if (existing.find(s => s.guid === sit.guid)) return prev
      return { ...prev, [policyId]: [...existing, sit] }
    })
  }, [])

  const removeExtraSITFromPolicy = useCallback((policyId, sitId) => {
    setPolicyExtraSITs(prev => ({
      ...prev,
      [policyId]: (prev[policyId] || []).filter(s => s.id !== sitId),
    }))
  }, [])

  // Reset wizard
  const startOver = useCallback(() => {
    setSelectedSITIds(new Set())
    setSelectedPolicyIds(new Set())
    setPolicyConfigs({})
    setPolicyExtraSITs({})
    setCurrentStep(1)
    setMaxStep(1)
  }, [])

  return (
    <AppContext.Provider value={{
      // Navigation
      currentStep, maxStep, goTo, startOver,
      // SITs
      allSITs, saveSITs,
      selectedSITIds, toggleSIT, selectAllSITs,
      // Policies
      selectedPolicyIds, togglePolicy,
      policyConfigs, getPolicyCfg, updatePolicyCfg, ensureConfigs,
      // Extra SITs per policy
      policyExtraSITs, addExtraSITToPolicy, removeExtraSITFromPolicy,
      // Deployment details
      tenantId, adminUPN, saveTenantDetails,
      // Modals
      configModalOpen, setConfigModalOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
