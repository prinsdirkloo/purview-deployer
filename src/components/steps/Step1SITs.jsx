import React, { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import StepNav from '../ui/StepNav.jsx'
import Modal from '../ui/Modal.jsx'
import s from './Steps.module.css'
import m from '../modals/Modals.module.css'
import { BUILTIN_CATALOGUE } from '../../data/builtinCatalogue.js'
import { SILENT_PURVIEW_SITS } from '../../data/sits.js'

// ── CHECK icon ────────────────────────────────────────────────────────────────
const CHECK = (
  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── SITCard (main deployment grid) ───────────────────────────────────────────
function SITCard({ sit, selected, onToggle }) {
  const tagLabel = sit.tag === 'pii' ? 'PII' : 'Financial'
  const tagClass = sit.tag === 'pii' ? s.badgePii : s.badgeFin
  const typeLabel = sit.builtIn ? 'Built-in' : sit.isCustom ? 'Custom' : 'BUI Custom'
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
        <div className={s.cardDesc}>{sit.desc || sit.name}</div>
        <div className={s.badges}>
          <span className={[s.badge, tagClass].join(' ')}>{tagLabel}</span>
          <span className={[s.badge, s.badgeBuiltin].join(' ')}>{typeLabel}</span>
        </div>
      </div>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────
const TAG_BADGE = (tag) => ({
  fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
  textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
  background: tag === 'pii' ? 'rgba(99,102,241,0.15)' : 'rgba(217,134,28,0.15)',
  color:      tag === 'pii' ? '#818cf8' : 'var(--orange-d)',
})

const REGION_LABELS = {
  ZA:     'South Africa',
  Global: 'Global',
  EU:     'European Union',
  UK:     'United Kingdom',
  US:     'United States',
  APAC:   'Asia Pacific',
  LATAM:  'Latin America',
  MEA:    'Middle East & Africa',
  Cloud:  'Cloud / Credentials',
}
const REGION_ORDER = ['ZA','Global','EU','UK','US','APAC','LATAM','MEA','Cloud']

// Derive country/region label for custom SITs (no region field)
function deriveCountry(sit) {
  if (sit.country) return sit.country
  const n = (sit.name || '').toLowerCase()
  if (n.includes('south afr'))                          return 'South Africa'
  if (n.includes('niger'))                              return 'Nigeria'
  if (n.includes('ghana') || n.includes('ghanaian'))    return 'Ghana'
  if (n.includes('uae') || n.includes('united arab'))   return 'UAE'
  if (n.includes('maurit'))                             return 'Mauritius'
  if (n.includes('zambi'))                              return 'Zambia'
  if (n.includes('seychell'))                           return 'Seychelles'
  if (n.includes('kenya') || n.includes('kenyan'))      return 'Kenya'
  if (n.includes('namibia') || n.includes('namibian'))  return 'Namibia'
  if (n.includes('zimbabw'))                            return 'Zimbabwe'
  if (n.includes('botswana'))                           return 'Botswana'
  if (n.includes('u.k.') || n.includes('british'))      return 'United Kingdom'
  if (n.includes('u.s.') && !n.includes('u.s. / u.k.')) return 'United States'
  if (n.includes('australia'))                           return 'Australia'
  if (n.includes('canada'))                              return 'Canada'
  if (n.includes('indian') && !n.includes('indiana'))   return 'India'
  return 'Other'
}

// Group an array of SITs by the secondary key
function groupSITs(sits, groupBy, isBuiltin) {
  const map = {}
  sits.forEach(sit => {
    let key
    if (groupBy === 'tag') {
      key = sit.tag === 'pii' ? 'PII (Personal Data)' : 'Financial'
    } else {
      // region grouping
      if (isBuiltin) {
        key = REGION_LABELS[sit.region] || sit.region || 'Other'
      } else {
        key = deriveCountry(sit)
      }
    }
    if (!map[key]) map[key] = []
    map[key].push(sit)
  })

  const keys = Object.keys(map).sort((a, b) => {
    if (groupBy === 'region') {
      // For built-in: use REGION_ORDER; for custom: SA first then alpha
      const aIdx = isBuiltin
        ? REGION_ORDER.indexOf(Object.keys(REGION_LABELS).find(k => REGION_LABELS[k] === a) || a)
        : (a === 'South Africa' ? -1 : a === 'Other' ? 999 : 0)
      const bIdx = isBuiltin
        ? REGION_ORDER.indexOf(Object.keys(REGION_LABELS).find(k => REGION_LABELS[k] === b) || b)
        : (b === 'South Africa' ? -1 : b === 'Other' ? 999 : 0)
      if (aIdx !== bIdx && aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    }
    if (a === 'South Africa' || a === 'Global' || a === 'PII (Personal Data)') return -1
    if (b === 'South Africa' || b === 'Global' || b === 'PII (Personal Data)') return  1
    if (a === 'Other') return  1
    if (b === 'Other') return -1
    return a.localeCompare(b)
  })
  return { map, keys }
}

// ── Sub-group rows within a section ──────────────────────────────────────────
function SubGroup({ groupKey, sits, visibleIds, onAdd }) {
  const [open, setOpen] = useState(true)
  const available = sits.filter(s => !visibleIds.has(s.id || s.guid))
  const added     = sits.length - available.length
  if (sits.length === 0) return null
  return (
    <div>
      {/* Sub-group header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 14px', cursor: 'pointer',
          background: 'var(--bg-s)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 44, zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--orange-d)' }}>
            {groupKey}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-m)' }}>
            {available.length} available{added > 0 ? ` · ${added} added` : ''}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-m)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && available.map(sit => {
        const id = sit.id || sit.guid
        return (
          <div key={id} className={m.pickerItem}>
            <div className={m.pickerItemInfo}>
              <div className={m.pickerItemName} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>{sit.name}</span>
                <span style={TAG_BADGE(sit.tag)}>{sit.tag === 'pii' ? 'PII' : 'Financial'}</span>
                {sit.conf && (
                  <span style={{ fontSize: 9, color: 'var(--text-m)', fontWeight: 500 }}>
                    {sit.conf} confidence
                  </span>
                )}
              </div>
              <div className={m.pickerItemMeta}>
                {sit.desc || (sit.region ? `Built-in Purview SIT` : '—')}
              </div>
            </div>
            <button className={m.pickerAddBtn} onClick={() => onAdd(id, sit)}>+ Add</button>
          </div>
        )
      })}
    </div>
  )
}

// ── Primary section (OOTB or Custom) ─────────────────────────────────────────
function PrimarySection({ title, subtitle, accentColor, sits, groupBy, isBuiltin, visibleIds, onAdd, query }) {
  const [open, setOpen] = useState(true)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return q
      ? sits.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.desc || '').toLowerCase().includes(q) ||
          (s.region || '').toLowerCase().includes(q))
      : sits
  }, [sits, query])

  const totalAvailable = filtered.filter(s => !visibleIds.has(s.id || s.guid)).length
  const totalAdded     = sits.filter(s => visibleIds.has(s.id || s.guid)).length

  const { map, keys } = groupSITs(filtered, groupBy, isBuiltin)

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Primary section header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 16px', cursor: 'pointer',
          background: 'var(--bg-card)',
          border: `1px solid var(--border)`,
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: open ? 'var(--r-md) var(--r-md) 0 0' : 'var(--r-md)',
          borderBottom: open ? 'none' : `1px solid var(--border)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <span style={{ fontSize: 12, color: 'var(--text-m)' }}>{subtitle}</span>
          <span style={{
            fontSize: 11, padding: '2px 9px', borderRadius: 10, fontWeight: 600,
            background: `${accentColor}22`, color: accentColor,
          }}>
            {totalAvailable} available
          </span>
          {totalAdded > 0 && (
            <span style={{
              fontSize: 11, padding: '2px 9px', borderRadius: 10, fontWeight: 600,
              background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            }}>
              {totalAdded} added ✓
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-m)', fontWeight: 600 }}>
          {open ? '▲ Collapse' : '▼ Expand'}
        </span>
      </div>

      {open && (
        <div style={{
          border: '1px solid var(--border)', borderTop: 'none',
          borderRadius: '0 0 var(--r-md) var(--r-md)',
          overflow: 'hidden', maxHeight: 420, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center',
              color: 'var(--text-m)', fontStyle: 'italic', fontSize: 13 }}>
              No matching SITs.
            </div>
          ) : totalAvailable === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center',
              color: '#4ade80', fontSize: 13 }}>
              ✓ All {title.toLowerCase()} SITs have been added to your deployment.
            </div>
          ) : keys.map(gk => (
            <SubGroup
              key={gk}
              groupKey={gk}
              sits={map[gk]}
              visibleIds={visibleIds}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main picker modal ─────────────────────────────────────────────────────────
function LibraryPicker({ open, onClose, customSITs, visibleIds, onAdd }) {
  const [query,   setQuery]   = useState('')
  const [groupBy, setGroupBy] = useState('region')

  // Silent built-ins excluded from picker (auto-included in policies)
  const silentGuids = new Set(SILENT_PURVIEW_SITS.map(s => s.guid))
  const builtinSITs = BUILTIN_CATALOGUE.filter(s => !silentGuids.has(s.guid))

  const totalAdded = [...customSITs, ...builtinSITs]
    .filter(s => visibleIds.has(s.id || s.guid)).length

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add SITs to this deployment"
      wide
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: 12, color: 'var(--text-m)' }}>
            {totalAdded} SIT{totalAdded !== 1 ? 's' : ''} added to deployment
          </span>
          <button className={m.closeBtn} onClick={onClose}>Done</button>
        </div>
      }
    >
      {/* Search + secondary group toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          className={m.pickerSearch}
          placeholder="Search all SITs by name or description…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          style={{ flex: 1, marginBottom: 0 }}
        />
        {/* Secondary grouping toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0 }}>
          {[
            { value: 'region', label: '🌍 Region' },
            { value: 'tag',    label: '🏷 Tag'    },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setGroupBy(opt.value)}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: groupBy === opt.value ? 'var(--orange)' : 'var(--bg-s)',
                color:      groupBy === opt.value ? '#fff'           : 'var(--text-m)',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context note */}
      <div style={{
        fontSize: 12, color: 'var(--text-m)', marginBottom: 14, lineHeight: 1.6,
        padding: '8px 12px', background: 'var(--bg-s)',
        borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
      }}>
        <strong style={{ color: 'var(--text-s)' }}>Built-in Purview SITs</strong> — 327 SITs pre-loaded in every Purview tenant.
        No deployment required; referenced directly in DLP policy rules.&nbsp;&nbsp;
        <strong style={{ color: 'var(--text-s)' }}>Custom SITs</strong> — deployed via XML rule package (Script 1).
        Manage the custom library via <strong>⚙ Config</strong>.
      </div>

      {/* ── PRIMARY SECTION 1: Built-in Purview SITs ── */}
      <PrimarySection
        title="Built-in Purview SITs"
        subtitle={`${builtinSITs.length} SITs · No deployment required`}
        accentColor="var(--orange)"
        sits={builtinSITs}
        groupBy={groupBy}
        isBuiltin={true}
        visibleIds={visibleIds}
        onAdd={onAdd}
        query={query}
      />

      {/* ── PRIMARY SECTION 2: Custom SITs ── */}
      <PrimarySection
        title="Custom SITs"
        subtitle={`${customSITs.length} SITs · Deployed via XML rule package`}
        accentColor="#818cf8"
        sits={customSITs}
        groupBy={groupBy}
        isBuiltin={false}
        visibleIds={visibleIds}
        onAdd={onAdd}
        query={query}
      />
    </Modal>
  )
}

// ── Main Step1 component ──────────────────────────────────────────────────────
export default function Step1SITs() {
  const { allSITs, selectedSITIds, toggleSIT, selectAllSITs, goTo, currentStep } = useApp()
  const [pickerOpen,    setPickerOpen]    = useState(false)
  const [visibleIds,    setVisibleIds]    = useState(() => new Set())
  const [addedBuiltins, setAddedBuiltins] = useState([])

  const customVisible  = allSITs.filter(s => visibleIds.has(s.id))
  const builtinVisible = addedBuiltins.filter(s => visibleIds.has(s.guid))
  const allVisible     = [
    ...customVisible,
    ...builtinVisible.map(s => ({
      id:      s.guid,
      name:    s.name,
      desc:    `Built-in Purview SIT — ${s.conf || 'Medium'} confidence`,
      tag:     s.tag,
      builtIn: true,
    })),
  ]
  const canNext = selectedSITIds.size > 0

  const addToVisible = (id, sitObj) => {
    setVisibleIds(prev => new Set([...prev, id]))
    const isCustom = allSITs.some(s => s.id === id)
    if (!isCustom && sitObj) {
      setAddedBuiltins(prev =>
        prev.find(s => s.guid === id) ? prev : [...prev, sitObj]
      )
    }
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
          Use <strong>+ Add from library</strong> to choose SITs. Custom SITs are deployed
          via the XML rule package. Built-in Purview SITs already exist in every tenant —
          no deployment script needed for those.
        </p>
      </div>

      <div className={s.selectAllRow}>
        <button className={s.smallBtn} onClick={() => selectAllSITs(true,  allVisible)}>Select all</button>
        <button className={s.smallBtn} onClick={() => selectAllSITs(false, allVisible)}>Clear all</button>
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
        {allVisible.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-m)', fontSize: 14, lineHeight: 1.7,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <div style={{ fontWeight: 700, color: 'var(--text-s)', marginBottom: 6 }}>No SITs added yet</div>
            <div>Click <strong style={{ color: 'var(--orange-d)' }}>+ Add from library</strong> to select SITs for this deployment.</div>
          </div>
        ) : allVisible.map(sit => (
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
        customSITs={allSITs}
        visibleIds={visibleIds}
        onAdd={addToVisible}
      />
    </div>
  )
}
