import React, { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal.jsx'
import { generateGUID } from '../../utils/scriptBuilder.js'
import { BtnPrimary, BtnSecondary } from '../ui/Buttons.jsx'
import s from './Modals.module.css'

function getBuiltInSuggestion(name) {
  const n = name.toLowerCase()
  const library = [
    { match:['passport'],                    regex:'\\b[A-Z]{2}\\d{7}\\b',                                                           keywords:['passport','passport number','passport no','travel document'] },
    { match:['driver','licence','license'],  regex:'\\b\\d{13}\\b',                                                                  keywords:['drivers licence','drivers license','licence number','dl number'] },
    { match:['bank account','account number'],regex:'([0-9]{10}|[0-9]{11}|[0-9]{12})',                                               keywords:['account number','bank account','account holder','branch code','bank statement'] },
    { match:['tax','income tax'],            regex:'\\b\\d{10}\\b',                                                                  keywords:['tax number','tax reference','income tax','SARS','tax registration'] },
    { match:['phone','mobile','cell'],       regex:'(\\+\\d{1,3}|0)[\\s\\-]?\\d{2,3}[\\s\\-]?\\d{3,4}[\\s\\-]?\\d{4}',           keywords:['phone','mobile','cell number','telephone','contact number'] },
    { match:['email'],                       regex:'[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',                          keywords:['email','email address','e-mail','contact email'] },
    { match:['id number','identification'],  regex:'\\b\\d{13}\\b',                                                                  keywords:['ID number','identity number','identification number','national ID'] },
    { match:['vat'],                         regex:'\\b4\\d{9}\\b',                                                                  keywords:['VAT number','VAT registration','value added tax','VAT ref'] },
    { match:['credit card'],                 regex:'\\b(?:\\d{4}[\\s\\-]?){3}\\d{4}\\b',                                            keywords:['credit card','card number','card holder','expiry date','cvv'] },
  ]
  for (const entry of library) {
    if (entry.match.some(m => n.includes(m))) return { regex: entry.regex, keywords: entry.keywords }
  }
  return null
}

export default function SITFormModal({ open, onClose, onSave, editSIT }) {
  const [name, setName]     = useState('')
  const [tag, setTag]       = useState('pii')
  const [group, setGroup]   = useState('pii')
  const [regex, setRegex]   = useState('')
  const [prox, setProx]     = useState(300)
  const [guid, setGuid]     = useState('')
  const [keywords, setKeywords] = useState([])
  const [kwInput, setKwInput]   = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const kwInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (editSIT) {
      setName(editSIT.name || '')
      setTag(editSIT.tag || 'pii')
      setGroup(editSIT.group || 'pii')
      setRegex(editSIT.regex || '')
      setProx(editSIT.proximity || 300)
      setGuid(editSIT.guid || '')
      setKeywords(editSIT.keywords || [])
      setAiStatus('')
    } else {
      setName(''); setTag('pii'); setGroup('pii'); setRegex(''); setProx(300); setGuid(''); setKeywords([]); setAiStatus('')
    }
    setKwInput('')
  }, [open, editSIT])

  const removeKeyword = (i) => setKeywords(prev => prev.filter((_, idx) => idx !== i))

  const addKw = (val) => {
    const v = val.trim().replace(/,$/, '')
    if (v && !keywords.includes(v)) setKeywords(prev => [...prev, v])
    setKwInput('')
  }

  const handleKwKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKw(kwInput) }
    else if (e.key === 'Backspace' && kwInput === '' && keywords.length) {
      setKeywords(prev => prev.slice(0, -1))
    }
  }

  const handleKwChange = (e) => {
    if (e.target.value.endsWith(',')) { addKw(e.target.value); return }
    setKwInput(e.target.value)
  }

  const aiSuggest = async () => {
    if (!name.trim()) { setAiStatus('Enter a SIT name first.'); return }
    setAiLoading(true)
    setAiStatus('Asking AI…')

    const prompt = `You are a Microsoft Purview DLP expert. For a Sensitive Information Type (SIT) named "${name.trim()}", provide a regex pattern and proximity keywords.

Rules for the regex:
- Works inside document/email body (no ^ or $ anchors)
- Use \\b word boundaries
- Escape backslashes for JSON (\\\\b not \\b)

Respond ONLY with valid JSON, no markdown:
{"regex": "...", "keywords": ["kw1", "kw2", ...], "notes": "brief note"}`

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      const raw = (data.content || []).find(b => b.type === 'text')?.text || ''
      const clean = raw.replace(/```(?:json)?/gi, '').trim()
      let parsed
      try { parsed = JSON.parse(clean) }
      catch (_) { const m = clean.match(/\{[\s\S]*\}/); if (m) parsed = JSON.parse(m[0]); else throw new Error('Invalid JSON') }
      if (parsed.regex) setRegex(parsed.regex)
      if (parsed.keywords?.length) setKeywords(parsed.keywords)
      setAiStatus(`✓ ${parsed.notes || 'Suggestions generated'} — review before saving.`)
    } catch (err) {
      // Fallback to built-in library
      const builtin = getBuiltInSuggestion(name)
      if (builtin) {
        setRegex(builtin.regex)
        setKeywords(builtin.keywords)
        setAiStatus('AI unavailable — used built-in pattern library. Review before saving.')
      } else {
        setAiStatus(`AI unavailable (${err.message}). Enter regex manually.`)
      }
    }
    setAiLoading(false)
  }

  const handleSave = () => {
    if (!name.trim()) { alert('SIT name is required.'); return }
    const kwFinal = kwInput.trim() ? [...keywords, kwInput.trim()] : keywords
    const id = editSIT?.id || ('custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g,'_').substring(0,28) + '_' + Date.now().toString(36))
    const resolvedGuid = guid.trim() || (editSIT?.guid || generateGUID())
    const isBuiltInEdit = editSIT && !editSIT.isCustom
    onSave({
      id,
      name: name.trim(),
      desc: isBuiltInEdit ? (editSIT.desc || name.trim()) : `Custom SIT: ${name.trim()}`,
      tag, group,
      builtIn: isBuiltInEdit ? (editSIT.builtIn || false) : false,
      isCustom: isBuiltInEdit ? false : true,
      guid: resolvedGuid,
      conf: 'Medium',
      regex, keywords: kwFinal, proximity: prox,
    })
  }

  const title = editSIT ? `Edit SIT — ${editSIT.name}` : 'Add Custom SIT'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary onClick={handleSave}>Save SIT</BtnPrimary>
        </>
      }
    >
      {/* Name + AI Suggest */}
      <div className={s.formGroup}>
        <label className={s.label}>SIT Name *</label>
        <div className={s.aiRow}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. South African Passport Number" style={{ flex: 1 }} />
          <button className={[s.aiBtn, aiLoading && s.aiBtnLoading].filter(Boolean).join(' ')} onClick={aiSuggest} disabled={aiLoading}>
            {aiLoading ? <span className={s.spin} /> : '✦'} AI Suggest
          </button>
        </div>
        {aiStatus && <div className={[s.aiNote, aiStatus.startsWith('✓') && s.aiNoteOk, aiStatus.startsWith('AI unavail') && s.aiNoteWarn].filter(Boolean).join(' ')}>{aiStatus}</div>}
      </div>

      {/* Tag + Group */}
      <div className={s.formRow}>
        <div className={s.formGroup}>
          <label className={s.label}>Tag / Category</label>
          <select value={tag} onChange={e => setTag(e.target.value)}>
            <option value="pii">PII (Personal Data)</option>
            <option value="fin">Financial</option>
          </select>
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Policy Group</label>
          <select value={group} onChange={e => setGroup(e.target.value)}>
            <option value="pii">PII Policies</option>
            <option value="financial">Financial Policies</option>
          </select>
        </div>
      </div>

      {/* Regex */}
      <div className={s.formGroup}>
        <label className={s.label}>Regex Pattern *</label>
        <input type="text" value={regex} onChange={e => setRegex(e.target.value)} placeholder="e.g. \b[A-Z]{2}\d{7}\b" />
      </div>

      {/* Keywords */}
      <div className={s.formGroup}>
        <label className={s.label}>Keywords (Enter or comma to add)</label>
        <div className={s.kwList} onClick={() => kwInputRef.current?.focus()}>
          {keywords.map((kw, i) => (
            <span key={i} className={s.kwTag}>
              {kw}
              <button onClick={() => removeKeyword(i)}>×</button>
            </span>
          ))}
          <input
            ref={kwInputRef}
            className={s.kwInput}
            type="text"
            value={kwInput}
            onChange={handleKwChange}
            onKeyDown={handleKwKeydown}
            placeholder={keywords.length === 0 ? 'Type keyword, press Enter…' : ''}
          />
        </div>
      </div>

      {/* Proximity + GUID */}
      <div className={s.formRow}>
        <div className={s.formGroup}>
          <label className={s.label}>Proximity (chars)</label>
          <input type="number" value={prox} min={50} max={1000} step={50} onChange={e => setProx(+e.target.value)} />
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>GUID (auto if blank)</label>
          <input type="text" value={guid} onChange={e => setGuid(e.target.value)} placeholder="Leave blank to auto-generate" />
        </div>
      </div>
    </Modal>
  )
}
