import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import Modal from '../ui/Modal.jsx'
import { BtnPrimary, BtnSecondary } from '../ui/Buttons.jsx'
import s from './Steps.module.css'
import m from '../modals/Modals.module.css'

const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function SITCard({ sit, selected, onToggle }) {
  const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
  const tagClass = sit.tag === 'pii' ? s.badgePii : s.badgeFin
  const typeLabel = sit.isCustom ? 'Custom' : 'BUI Custom'
  return (
    <div
      className={[s.toggleCard, selected && s.selected].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      <div className={[s.checkbox, selected && s.checked].filter(Boolean).join(' ')}>
        {selected && CHECK}
      </div>
      <div className={s.cardInfo}>
        <div className={s.cardName}>{sit.name}</div>
        <div className={s.cardDesc}>{sit.desc}</div>
        <div className={s.badges}>
          <span className={[s.badge, tagClass].join(' ')}>{tagLabel}</span>
          <span className={[s.badge, s.badgeBuiltin].join(' ')}>{typeLabel}</span>
        </div>
      </div>
    </div>
  )
}

// Library picker — shows all custom SITs not yet added to the main grid
// ── Country derivation (mirrors ConfigModal logic) ────────────────────────────
function deriveCountry(sit) {
  if (sit.country) return sit.country
  const n = (sit.name || '').toLowerCase()
  if (n.includes('south afr'))  return 'South Africa'
  if (n.includes('niger'))      return 'Nigeria'
  if (n.includes('ghana') || n.includes('ghanaian')) return 'Ghana'
  if (n.includes('uae') || n.includes('united arab')) return 'UAE'
  if (n.includes('maurit'))     return 'Mauritius'
  if (n.includes('zambi'))      return 'Zambia'
  if (n.includes('seychell'))   return 'Seychelles'
  if (n.includes('kenya') || n.includes('kenyan'))   return 'Kenya'
  if (n.includes('uganda') || n.includes('ugandan')) return 'Uganda'
  if (n.includes('tanzani'))    return 'Tanzania'
  if (n.includes('namibia') || n.includes('namibian')) return 'Namibia'
  if (n.includes('zimbabw'))    return 'Zimbabwe'
  if (n.includes('botswana'))   return 'Botswana'
  if (n.includes('uk') || n.includes('united kingdom') || n.includes('british')) return 'United Kingdom'
  if (n.includes('australian')) return 'Australia'
  if (n.includes('canadian'))   return 'Canada'
  if (n.includes('indian') && !n.includes('indiana')) return 'India'
  return 'Other'
}

// ── Library picker ────────────────────────────────────────────────────────────
function LibraryPicker({ open, onClose, allLibrarySITs, visibleIds, onAdd }) {
  const [query,   setQuery]   = useState('')
  const [groupBy, setGroupBy] = useState('country') // 'country' | 'tag'

  const available = allLibrarySITs.filter(s =>
    !visibleIds.has(s.id) &&
    (!query || s.name.toLowerCase().includes(query.toLowerCase()) ||
               (s.desc || '').toLowerCase().includes(query.toLowerCase()))
  )

  function buildGroups(sits) {
    const map = {}
    sits.forEach(sit => {
      const key = groupBy === 'country'
        ? deriveCountry(sit)
        : (sit.tag === 'pii' ? 'PII (Personal Data)' : 'Financial')
      if (!map[key]) map[key] = []
      map[key].push(sit)
    })
    const keys = Object.keys(map).sort((a, b) => {
      if (groupBy === 'country') {
        if (a === 'South Africa') return -1
        if (b === 'South Africa') return  1
        if (a === 'Other')        return  1
        if (b === 'Other')        return -1
        return a.localeCompare(b)
      }
      if (a === 'PII (Personal Data)') return -1
      if (b === 'PII (Personal Data)') return  1
      return a.localeCompare(b)
    })
    return { map, keys }
  }

  const { map: groups, keys: groupKeys } = buildGroups(available)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add SITs from library"
      footer={<button className={m.closeBtn} onClick={onClose}>Done</button>}
    >
      <p className={m.pickerDesc}>
        Select custom SITs to include in this deployment.
        Manage the library via <strong>⚙ Config</strong>.
      </p>

      {/* Search + group-by toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          className={m.pickerSearch}
          placeholder="Search library…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          style={{ flex: 1, marginBottom: 0 }}
        />
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0 }}>
          {['country', 'tag'].map(opt => (
            <button
              key={opt}
              onClick={() => setGroupBy(opt)}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: groupBy === opt ? 'var(--orange)' : 'var(--bg-s)',
                color: groupBy === opt ? '#fff' : 'var(--text-m)',
                transition: 'all 0.15s',
              }}
            >
              {opt === 'country' ? '\u{1F30D} Country' : '\u{1F3F7} Tag'}
            </button>
          ))}
        </div>
      </div>

      <div className={m.pickerList}>
        {available.length === 0 && (
          <div className={m.pickerEmpty}>
            {allLibrarySITs.length === visibleIds.size
              ? 'All library SITs are already on the selection screen.'
              : 'No matching SITs found.'}
          </div>
        )}

        {groupKeys.map(groupKey => (
          <div key={groupKey}>
            <div style={{
              padding: '7px 12px 5px',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--orange-d)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-s)',
              position: 'sticky', top: 0,
            }}>
              {groupKey}
              <span style={{ fontWeight: 400, color: 'var(--text-m)', marginLeft: 6,
                textTransform: 'none', letterSpacing: 0 }}>
                ({groups[groupKey].length})
              </span>
            </div>

            {groups[groupKey].map(sit => {
              const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
              const tagBg    = sit.tag === 'pii' ? 'rgba(99,102,241,0.15)' : 'rgba(217,134,28,0.15)'
              const tagColor = sit.tag === 'pii' ? '#818cf8' : 'var(--orange-d)'
              return (
                <div key={sit.id} className={m.pickerItem}>
                  <div className={m.pickerItemInfo}>
                    <div className={m.pickerItemName} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{sit.name}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 7px',
                        borderRadius: 10, background: tagBg, color: tagColor,
                        textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                      }}>
                        {tagLabel}
                      </span>
                    </div>
                    <div className={m.pickerItemMeta}>{sit.desc || '—'}</div>
                  </div>
                  <button className={m.pickerAddBtn} onClick={() => onAdd(sit.id)}>
                    + Add
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function Step1SITs() {
  const { allSITs, selectedSITIds, toggleSIT, selectAllSITs, goTo, currentStep } = useApp()
  const [pickerOpen, setPickerOpen] = useState(false)
  // Starts empty — user explicitly adds SITs from the library picker
  const [visibleIds, setVisibleIds] = useState(() => new Set())

  // Sync visibleIds if allSITs changes (e.g. after config edit)
  const visibleSITs = allSITs.filter(s => visibleIds.has(s.id))
  const canNext = selectedSITIds.size > 0

  const addToVisible = (id) => {
    setVisibleIds(prev => new Set([...prev, id]))
    // Also auto-select it
    if (!selectedSITIds.has(id)) toggleSIT(id)
  }

  return (
    <div className={s.step}>
      <StepNav
        position="top"
        currentStep={currentStep}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
      />

      <div className={s.sectionHead}>
        <div className={s.eyebrow}>Sensitive Information Types</div>
        <h2>Select SITs to deploy</h2>
        <p>
          Select which custom SITs to include in this deployment. Each selected SIT
          will be included in the XML rule package and wired into the relevant DLP
          policy rules. Built-in Purview SITs (Credit Card, SA ID, SA Physical
          Addresses) are automatically included in applicable policies.
        </p>
      </div>

      <div className={s.selectAllRow}>
        <button className={s.smallBtn} onClick={() => selectAllSITs(true, visibleSITs)}>Select all</button>
        <button className={s.smallBtn} onClick={() => selectAllSITs(false, visibleSITs)}>Clear all</button>
        <span className={s.countLabel}>{selectedSITIds.size} selected</span>
        <button
          className={s.addFromLibraryBtn}
          onClick={() => setPickerOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
          + Add from library
        </button>
      </div>

      <div className={s.gridTwo}>
        {visibleSITs.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-m)', fontSize: 14, lineHeight: 1.7,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <div style={{ fontWeight: 700, color: 'var(--text-s)', marginBottom: 6 }}>
              No SITs added yet
            </div>
            <div>Click <strong style={{ color: 'var(--orange-d)' }}>+ Add from library</strong> above to select the SITs to include in this deployment.</div>
          </div>
        ) : visibleSITs.map(sit => (
          <SITCard
            key={sit.id}
            sit={sit}
            selected={selectedSITIds.has(sit.id)}
            onToggle={() => toggleSIT(sit.id)}
          />
        ))}
      </div>

      <StepNav
        position="bottom"
        currentStep={currentStep}
        onNext={() => goTo(2)}
        nextDisabled={!canNext}
        onNextLabel="Next: DLP Policies →"
      />

      <LibraryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allLibrarySITs={allSITs}
        visibleIds={visibleIds}
        onAdd={addToVisible}
      />
    </div>
  )
}
