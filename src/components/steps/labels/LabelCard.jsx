import React, { useState } from 'react'
import { ALIGN_OPTIONS, LAYOUT_OPTIONS } from '../../../data/labels.js'
import s from '../Steps.module.css'
import ls from './Labels.module.css'

function Toggle({ on, onChange, label }) {
  return (
    <label className={ls.toggle}>
      <input type="checkbox" checked={on} onChange={e => onChange(e.target.checked)} />
      <span className={ls.toggleTrack}>
        <span className={ls.toggleThumb} />
      </span>
      {label && <span className={ls.toggleLabel}>{label}</span>}
    </label>
  )
}

function MarkingSection({ title, marking, onChange, showLayout = false }) {
  return (
    <div className={ls.markingSection}>
      <div className={ls.markingHeader}>
        <span className={ls.markingTitle}>{title}</span>
        <Toggle on={marking.enabled} onChange={v => onChange({ enabled: v })} />
      </div>
      {marking.enabled && (
        <div className={ls.markingFields}>
          <div className={ls.fieldGroup}>
            <label className={ls.fieldLabel}>Text</label>
            <input
              type="text"
              value={marking.text}
              onChange={e => onChange({ text: e.target.value })}
              placeholder={`e.g. ${title} — Contoso`}
            />
          </div>
          <div className={ls.fieldRow}>
            <div className={ls.fieldGroup}>
              <label className={ls.fieldLabel}>Font colour</label>
              <div className={ls.colorRow}>
                <input
                  type="color"
                  value={marking.color}
                  onChange={e => onChange({ color: e.target.value })}
                  className={ls.colorPicker}
                />
                <input
                  type="text"
                  value={marking.color}
                  onChange={e => onChange({ color: e.target.value })}
                  className={ls.colorHex}
                  maxLength={7}
                />
              </div>
            </div>
            <div className={ls.fieldGroup}>
              <label className={ls.fieldLabel}>Font size (pt)</label>
              <input
                type="number"
                value={marking.size}
                min={8} max={32} step={1}
                onChange={e => onChange({ size: +e.target.value })}
              />
            </div>
            {!showLayout && (
              <div className={ls.fieldGroup}>
                <label className={ls.fieldLabel}>Alignment</label>
                <select value={marking.align} onChange={e => onChange({ align: e.target.value })}>
                  {ALIGN_OPTIONS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            )}
            {showLayout && (
              <div className={ls.fieldGroup}>
                <label className={ls.fieldLabel}>Layout</label>
                <select value={marking.layout} onChange={e => onChange({ layout: e.target.value })}>
                  {LAYOUT_OPTIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LabelCard({ label, onChange }) {
  const [expanded, setExpanded] = useState(true)

  const up = (field, value) => onChange({ ...label, [field]: value })
  const upMarking = (field, partial) => onChange({ ...label, [field]: { ...label[field], ...partial } })

  return (
    <div className={ls.labelCard}>
      {/* Card header — colour swatch + name + expand toggle */}
      <div className={ls.labelCardHeader} onClick={() => setExpanded(e => !e)}>
        <div className={ls.labelSwatch} style={{ background: label.color }} />
        <span className={ls.labelCardName}>{label.displayName || label.name}</span>
        <span className={ls.expandIcon}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className={ls.labelCardBody}>
          {/* Display name */}
          <div className={ls.fieldRow}>
            <div className={ls.fieldGroup} style={{ flex: 2 }}>
              <label className={ls.fieldLabel}>Display name *</label>
              <input
                type="text"
                value={label.displayName}
                onChange={e => up('displayName', e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className={ls.fieldGroup}>
              <label className={ls.fieldLabel}>Label colour</label>
              <div className={ls.colorRow}>
                <input
                  type="color"
                  value={label.color}
                  onChange={e => up('color', e.target.value)}
                  className={ls.colorPicker}
                />
                <input
                  type="text"
                  value={label.color}
                  onChange={e => up('color', e.target.value)}
                  className={ls.colorHex}
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Tooltip */}
          <div className={ls.fieldGroup}>
            <label className={ls.fieldLabel}>Tooltip (shown to users)</label>
            <textarea
              rows={2}
              value={label.tooltip}
              onChange={e => up('tooltip', e.target.value)}
            />
          </div>

          {/* Markings */}
          <div className={ls.markingsGrid}>
            <MarkingSection
              title="Footer"
              marking={label.footer}
              onChange={p => upMarking('footer', p)}
            />
            <MarkingSection
              title="Header"
              marking={label.header}
              onChange={p => upMarking('header', p)}
            />
            <MarkingSection
              title="Watermark"
              marking={label.watermark}
              onChange={p => upMarking('watermark', p)}
              showLayout
            />
          </div>
        </div>
      )}
    </div>
  )
}
