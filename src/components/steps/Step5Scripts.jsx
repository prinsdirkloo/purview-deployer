import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import { BtnSecondary, BtnDownload } from '../ui/Buttons.jsx'
import { buildXML, buildScript1, buildScript2, downloadText } from '../../utils/scriptBuilder.js'
import { buildLabelScript, downloadText as dlText } from '../../utils/labelScriptBuilder.js'
import { DEFAULT_LABELS } from '../../data/labels.js'
import s from './Steps.module.css'

function ScriptBlock({ title, content, onDownload }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }
  return (
    <div className={s.scriptBlock}>
      <div className={s.scriptBlockHeader}>
        <span className={s.scriptBlockTitle}>{title}</span>
        <div className={s.scriptActions}>
          <button
            className={[s.copyBtn, copied && s.copyBtnCopied].filter(Boolean).join(' ')}
            onClick={copy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <BtnDownload onClick={onDownload}>⬇ Download</BtnDownload>
        </div>
      </div>
      <pre className={s.scriptPre}>{content}</pre>
    </div>
  )
}

export default function Step5Scripts() {
  const {
    allSITs, selectedSITIds, selectedPolicyIds,
    getPolicyCfg, policyExtraSITs,
    tenantId, adminUPN,
    goTo, startOver, currentStep,
  } = useApp()

  const policyConfigsMap = useMemo(() => {
    const map = {}
    selectedPolicyIds.forEach(pid => { map[pid] = getPolicyCfg(pid) })
    return map
  }, [selectedPolicyIds, getPolicyCfg])

  const xml     = useMemo(() => buildXML(allSITs, selectedSITIds, tenantId), [allSITs, selectedSITIds, tenantId])
  const script1 = useMemo(() => buildScript1(allSITs, selectedSITIds, adminUPN), [allSITs, selectedSITIds, adminUPN])
  const script2 = useMemo(() => buildScript2(allSITs, selectedSITIds, selectedPolicyIds, policyConfigsMap, policyExtraSITs, adminUPN),
    [allSITs, selectedSITIds, selectedPolicyIds, policyConfigsMap, policyExtraSITs, adminUPN])

  // Load saved label config from localStorage (set by the Labels track)
  const script3 = useMemo(() => {
    try {
      const saved = localStorage.getItem('bui_label_config')
      const labels = saved ? JSON.parse(saved) : DEFAULT_LABELS
      return buildLabelScript(labels, adminUPN, '')
    } catch (_) {
      return buildLabelScript(DEFAULT_LABELS, adminUPN, '')
    }
  }, [adminUPN])

  const LABEL_FILENAME = '03_Sensitivity_Labels_-_Deployment_Commands.ps1'

  const dlpFileCount = (xml ? 1 : 0) + (script1 ? 1 : 0) + 1
  const totalFileCount = dlpFileCount + 1  // +1 for script3

  const dlAll = () => {
    if (xml)     setTimeout(() => downloadText(xml,     '01_SA_Custom_SITs_-_Rule_Package.xml', 'application/xml'), 0)
    if (script1) setTimeout(() => downloadText(script1, '01_SA_Custom_SITs_-_Deployment_Commands.ps1', 'text/plain'), 350)
                 setTimeout(() => downloadText(script2, '02_SA_Custom_DLP_Policies_-_Deployment_Commands.ps1', 'text/plain'), 700)
                 setTimeout(() => dlText(script3,        LABEL_FILENAME), 1050)
  }

  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        onBack={() => goTo(4)}
        onNext={startOver}
        onNextLabel="Start Over"
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Deployment Package</div>
        <h2>Your generated scripts</h2>
        <p>
          Download all files{tenantId || adminUPN ? ' — your tenant details are pre-filled' : ''}.
          Confirm the <code>Publisher id</code> in the XML and <code>$AdminUPN</code> in the scripts.
        </p>
      </div>

      <div className={s.alertWarn}>
        <span>⚠</span>
        <span>
          Run in order: <strong>Script 1</strong> first, verify SITs, then <strong>Script 2</strong> (DLP policies),
          then <strong>Script 3</strong> (Sensitivity Labels). All can run in the same PowerShell session.
        </span>
      </div>

      {/* Download all banner */}
      <div className={s.dlBanner}>
        <span className={s.dlBannerLabel}>Download all {totalFileCount} files</span>
        {xml     && <BtnDownload onClick={() => downloadText(xml,     '01_SA_Custom_SITs_-_Rule_Package.xml', 'application/xml')}>⬇ XML</BtnDownload>}
        {script1 && <BtnDownload onClick={() => downloadText(script1, '01_SA_Custom_SITs_-_Deployment_Commands.ps1',             'text/plain')}>⬇ Script 1</BtnDownload>}
        <BtnDownload onClick={() =>            downloadText(script2, '02_SA_Custom_DLP_Policies_-_Deployment_Commands.ps1',    'text/plain')}>⬇ Script 2</BtnDownload>
        <BtnDownload onClick={() =>            dlText(script3,        LABEL_FILENAME)}>⬇ Script 3</BtnDownload>
        <BtnDownload onClick={dlAll} style={{ fontWeight: 700 }}>⬇ All files</BtnDownload>
      </div>

      {/* DLP files */}
      {xml ? (
        <ScriptBlock
          title="XML — Custom SIT Rule Package"
          content={xml}
          onDownload={() => downloadText(xml, '01_SA_Custom_SITs_-_Rule_Package.xml', 'application/xml')}
        />
      ) : (
        <div className={s.alertInfo}>
          <span>ℹ</span>
          <span>Only built-in SITs selected — no XML rule package required.</span>
        </div>
      )}

      {script1 && (
        <ScriptBlock
          title="Script 1 — Deploy Custom SIT Rule Package"
          content={script1}
          onDownload={() => downloadText(script1, '01_SA_Custom_SITs_-_Deployment_Commands.ps1', 'text/plain')}
        />
      )}

      <ScriptBlock
        title="Script 2 — Deploy DLP Policies"
        content={script2}
        onDownload={() => downloadText(script2, '02_SA_Custom_DLP_Policies_-_Deployment_Commands.ps1', 'text/plain')}
      />

      <ScriptBlock
        title="Script 3 — Deploy Sensitivity Labels"
        content={script3}
        onDownload={() => dlText(script3, LABEL_FILENAME)}
      />

      {/* Callout: script 3 uses label config from Labels track */}
      <div className={s.alertInfo} style={{ marginTop: 0 }}>
        <span>ℹ</span>
        <span>
          Script 3 uses the label configuration from the <strong>Sensitivity Labels</strong> track.
          Switch to that track to customise label names, markings, and colours before downloading.
        </span>
      </div>

      <div className={s.nav}>
        <div className={s.navLeft}>
          <BtnSecondary onClick={() => goTo(4)}>← Back</BtnSecondary>
        </div>
        <BtnSecondary onClick={startOver}>Start Over</BtnSecondary>
      </div>
    </div>
  )
}
