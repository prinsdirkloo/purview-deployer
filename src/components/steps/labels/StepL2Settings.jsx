import React from 'react'
import StepNav from '../../ui/StepNav.jsx'
import s from '../Steps.module.css'
import ls from './Labels.module.css'

export default function StepL2Settings({ orgName, setOrgName, adminUPN, setAdminUPN, labels, currentStep, goTo }) {
  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        totalSteps={3}
        onBack={() => goTo(1)}
        onNext={() => goTo(3)}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Deployment Settings</div>
        <h2>Organisation and admin details</h2>
        <p>
          These values are written into the generated script comments and the
          reference label policy block. They do not affect the label creation itself.
        </p>
      </div>

      {/* ── Encryption note ── */}
      <div className={ls.policyNotice} style={{ borderLeftColor: '#535657', marginBottom: '1rem' }}>
        <div className={ls.policyNoticeTitle} style={{ color: '#535657' }}>
          🔒 Encryption is not configured by this tool
        </div>
        <div className={ls.policyNoticeBody}>
          Label encryption (Azure RMS / Microsoft Purview Information Protection) is intentionally
          excluded from this deployment script. Per the BUI Purview Maturity Framework, encryption
          is introduced in <strong>Phase 06 of the Sensitivity Labelling track</strong> — after
          mandatory labelling has stabilised and the customer has confirmed which labels require
          encryption. It will be configured manually during the relevant engagement phase and
          requires the <strong>Purview Suite add-on / M365 E5</strong>.
        </div>
      </div>

      {/* ── Policy not included notice ── */}
      <div className={ls.policyNotice}>
        <div className={ls.policyNoticeTitle}>
          ℹ Label policy not included in this script
        </div>
        <div className={ls.policyNoticeBody}>
          Publishing sensitivity labels to users requires a label policy. This script
          creates the labels only — not the policy. The reason: the pilot group
          (which users or groups receive the labels) is typically not confirmed until
          after the initial deployment session.<br /><br />
          Once the pilot group is confirmed, create the label policy in the Purview portal
          at <a href="https://purview.microsoft.com" target="_blank" rel="noreferrer">
            purview.microsoft.com
          </a> → Information Protection → Label policies → Create policy,
          or run the commented-out <code>New-LabelPolicy</code> block included at the
          bottom of the generated script.
        </div>
      </div>

      {/* ── Settings fields ── */}
      <div className={ls.settingsGrid}>
        <div className={ls.fieldGroup}>
          <label className={ls.fieldLabel}>Organisation / Customer name</label>
          <input
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="e.g. Contoso"
          />
          <span style={{ fontSize: 11, color: 'var(--text-m)' }}>
            Used in the policy reference block: <em>Contoso - Sensitivity Label Policy</em>
          </span>
        </div>
        <div className={ls.fieldGroup}>
          <label className={ls.fieldLabel}>Admin account UPN</label>
          <input
            type="text"
            value={adminUPN}
            onChange={e => setAdminUPN(e.target.value)}
            placeholder="admin@yourtenant.onmicrosoft.com"
          />
          <span style={{ fontSize: 11, color: 'var(--text-m)' }}>
            Written into <code>$AdminUPN</code> in the script. Requires Compliance Administrator role.
          </span>
        </div>
      </div>

      {/* ── Confirmation of label list ── */}
      <div className={s.card}>
        <div className={s.reviewSectionLabel}>Labels that will be created ({labels.length})</div>
        <table className={ls.reviewTable}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Footer</th>
              <th>Header</th>
              <th>Watermark</th>
              <th>Colour</th>
            </tr>
          </thead>
          <tbody>
            {labels.map(l => (
              <tr key={l.id}>
                <td>
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:12, height:12, borderRadius:3, background:l.color, display:'inline-block', flexShrink:0 }} />
                    <strong>{l.displayName}</strong>
                  </span>
                </td>
                <td>{l.footer.enabled  ? <span className={ls.tick}>✓ {l.footer.text}</span>     : <span className={ls.cross}>—</span>}</td>
                <td>{l.header.enabled  ? <span className={ls.tick}>✓ {l.header.text}</span>     : <span className={ls.cross}>—</span>}</td>
                <td>{l.watermark.enabled ? <span className={ls.tick}>✓ {l.watermark.text}</span> : <span className={ls.cross}>—</span>}</td>
                <td><code style={{ fontSize:11 }}>{l.color}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StepNav
        position="bottom"
        currentStep={currentStep}
        totalSteps={3}
        onBack={() => goTo(1)}
        onNext={() => goTo(3)}
        onNextLabel="Generate Script →"
        nextIsSuccess
      />
    </div>
  )
}
