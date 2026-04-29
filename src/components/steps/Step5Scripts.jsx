import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import { BtnSecondary, BtnDownload } from '../ui/Buttons.jsx'
import { buildXML, buildScript1, buildScript2, downloadText } from '../../utils/scriptBuilder.js'
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

  const fileCount = (xml ? 1 : 0) + (script1 ? 1 : 0) + 1

  const dlAll = () => {
    if (xml)     setTimeout(() => downloadText(xml,     '01_SA_Custom_SITs_-_Rule_Package.xml', 'application/xml'), 0)
    if (script1) setTimeout(() => downloadText(script1, '01_SA_Custom_SITs_-_Deployment_Commands.ps1', 'text/plain'), 350)
                 setTimeout(() => downloadText(script2, '02_SA_Custom_DLP_Policies_-_Deployment_Commands.ps1', 'text/plain'), 700)
  }

  return (
    <div className={s.step}>
      {/* Top nav */}
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
        <span>Run <strong>Script 1</strong> first and wait for SIT verification before running <strong>Script 2</strong>.</span>
      </div>

      {/* Download all banner */}
      <div className={s.dlBanner}>
        <span className={s.dlBannerLabel}>Download all {fileCount} file{fileCount > 1 ? 's' : ''}</span>
        {xml     && <BtnDownload onClick={() => downloadText(xml, '01_SA_Custom_SITs_-_Rule_Package.xml', 'application/xml')}>⬇ XML</BtnDownload>}
        {script1 && <BtnDownload onClick={() => downloadText(script1, '01_SA_Custom_SITs_-_Deployment_Commands.ps1', 'text/plain')}>⬇ Script 1</BtnDownload>}
        <BtnDownload onClick={() => downloadText(script2, '02_SA_Custom_DLP_Policies_-_Deployment_Commands.ps1', 'text/plain')}>⬇ Script 2</BtnDownload>
        <BtnDownload onClick={dlAll} style={{ fontWeight:700 }}>⬇ All files</BtnDownload>
      </div>

      {/* XML */}
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

      {/* Bottom nav */}
      <div className={s.nav}>
        <div className={s.navLeft}>
          <BtnSecondary onClick={() => goTo(4)}>← Back</BtnSecondary>
        </div>
        <BtnSecondary onClick={startOver}>Start Over</BtnSecondary>
      </div>
    </div>
  )
}
