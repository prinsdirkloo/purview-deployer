import React, { useState, useMemo } from 'react'
import StepNav from '../../ui/StepNav.jsx'
import { BtnSecondary, BtnDownload } from '../../ui/Buttons.jsx'
import { buildLabelScript, downloadText } from '../../../utils/labelScriptBuilder.js'
import s from '../Steps.module.css'
import ls from './Labels.module.css'

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

export default function StepL3Script({ labels, orgName, adminUPN, currentStep, goTo, startOver }) {
  const FILENAME = '03_Sensitivity_Labels_-_Deployment_Commands.ps1'

  const script = useMemo(
    () => buildLabelScript(labels, adminUPN, orgName),
    [labels, adminUPN, orgName]
  )

  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        totalSteps={3}
        onBack={() => goTo(2)}
        onNext={startOver}
        onNextLabel="Start Over"
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Label Deployment Script</div>
        <h2>Your generated script</h2>
        <p>
          This script creates {labels.length} sensitivity labels. It does <strong>not</strong> create
          a label policy — publish labels to users via the Purview portal once your
          pilot group is confirmed.
        </p>
      </div>

      <div className={s.alertWarn}>
        <span>ℹ</span>
        <span>
          <strong>Run Script 1 and Script 2 first</strong> to deploy SITs and DLP policies
          before running this script. All three can be run in the same session.
        </span>
      </div>

      <div className={s.dlBanner}>
        <span className={s.dlBannerLabel}>1 file — {FILENAME}</span>
        <BtnDownload
          onClick={() => downloadText(script, FILENAME)}
          style={{ fontWeight: 700 }}
        >
          ⬇ Download Script
        </BtnDownload>
      </div>

      <ScriptBlock
        title={FILENAME}
        content={script}
        onDownload={() => downloadText(script, FILENAME)}
      />

      {/* Next steps callout */}
      <div className={s.alertInfo} style={{ marginTop: '1.5rem', alignItems: 'flex-start', flexDirection: 'column', gap: 6 }}>
        <strong style={{ color: 'var(--orange-d)' }}>After running this script:</strong>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: 13, lineHeight: 1.7, color: 'var(--text-s)' }}>
          <li>Verify labels in Purview portal → Information Protection → Labels</li>
          <li>Confirm pilot group with the customer (a security group or specific users)</li>
          <li>Create and publish the label policy — use the Purview portal wizard,
              or un-comment and run the <code>New-LabelPolicy</code> block at the bottom of this script</li>
        </ol>
      </div>

      <div className={s.nav}>
        <div className={s.navLeft}>
          <BtnSecondary onClick={() => goTo(2)}>← Back</BtnSecondary>
        </div>
        <BtnSecondary onClick={startOver}>Start Over</BtnSecondary>
      </div>
    </div>
  )
}
