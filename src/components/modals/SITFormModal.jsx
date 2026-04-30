import React, { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal.jsx'
import { generateGUID } from '../../utils/scriptBuilder.js'
import { BtnPrimary, BtnSecondary } from '../ui/Buttons.jsx'
import s from './Modals.module.css'

const LS_APIKEY = 'bui_anthropic_api_key'

// ── Country-aware fallback — used ONLY when API is unavailable ───────────────
// Keywords are always generic — no country authority names hardcoded.
const GENERIC_FALLBACKS = [
  { match:['passport'],
    regex:'\\b[A-Z]{1,2}\\d{6,9}\\b',
    keywords:['passport','passport number','passport no','travel document number','travel document','document number','international travel','passport holder','passport details','issued by','date of issue','date of expiry'],
    notes:'Generic passport pattern. Verify digit/letter count for the specific country.' },
  { match:['driver','licence','license','driving'],
    regex:'\\b[A-Z0-9]{6,15}\\b',
    keywords:["driver's licence","driver's license",'driving licence','driving license','licence number','license number','motor vehicle licence','vehicle licence','transport licence','licence holder','issued licence','dl number'],
    notes:'Generic driving licence pattern. Verify format for the specific country.' },
  { match:['bank account','account number'],
    regex:'([0-9]{8,16})',
    keywords:['account number','bank account number','account holder','branch code','bank statement','bank account details','account type','current account','savings account','banking details','financial account','account reference'],
    notes:'Generic bank account pattern. Add the country\'s specific bank names as keywords.' },
  { match:['tax','income tax','taxpayer'],
    regex:'\\b[A-Z0-9]{8,12}\\b',
    keywords:['tax number','tax identification','taxpayer number','tax reference','income tax number','tax registration number','tax identification number','TIN','revenue authority','tax account','tax obligation','tax compliance'],
    notes:'Generic tax number pattern. Replace with the specific country revenue authority name.' },
  { match:['national id','id number','identification','identity card','national card','id card'],
    regex:'\\b[A-Z0-9]{8,16}\\b',
    keywords:['national ID','identity number','ID number','national identification number','identity card','national identity','identification document','ID card number','citizen ID','resident ID','ID document','personal identification'],
    notes:'Generic national ID pattern. Verify format for the specific country.' },
  { match:['phone','mobile','cell','telephone'],
    regex:'(\\+\\d{1,3}[\\s\\-]?)?\\d{2,4}[\\s\\-]?\\d{3,4}[\\s\\-]?\\d{3,4}',
    keywords:['phone number','mobile number','cell number','telephone number','contact number','phone no','mobile no','phone details','cellular number','contact details','phone contact','phone line'],
    notes:'Generic phone pattern. Add the country dialling code as a keyword if needed.' },
  { match:['vat','value added tax'],
    regex:'\\b[A-Z]{0,3}\\d{8,12}\\b',
    keywords:['VAT number','VAT registration number','value added tax number','VAT ref','VAT details','tax invoice','VAT invoice','VAT registration','output VAT','input VAT','VAT account','registered for VAT'],
    notes:'Generic VAT pattern. Verify prefix and digit count for the specific country.' },
  { match:['social security','social insurance','national insurance'],
    regex:'\\b[A-Z0-9]{2,3}[\\s\\-]?\\d{2,6}[\\s\\-]?\\d{2,6}[\\s\\-]?[A-Z0-9]{0,2}\\b',
    keywords:['social security number','social insurance number','national insurance number','social security','insurance number','benefits number','social contribution','pension number','social registration','welfare number','security reference','insurance reference'],
    notes:'Generic social security pattern. Verify format for the specific country.' },
  { match:['credit card','debit card','payment card'],
    regex:'\\b(?:\\d{4}[\\s\\-]?){3}\\d{4}\\b',
    keywords:['credit card number','card number','payment card','debit card','card holder','card details','expiry date','card expiry','CVV','cardholder name','card issuer','card account'],
    notes:'Generic payment card pattern. Consider using the built-in Purview Credit Card SIT instead.' },
  { match:['postal code','zip code','postcode'],
    regex:'\\b[A-Z0-9]{3,8}([ \\-][A-Z0-9]{3,4})?\\b',
    keywords:['postal code','postcode','zip code','post code','area code','postal address','mailing code','delivery code','postal district','address code','location code','post box'],
    notes:'Generic postal code pattern. Verify format for the specific country.' },
]

function getGenericFallback(name) {
  const n = name.toLowerCase()
  for (const entry of GENERIC_FALLBACKS) {
    if (entry.match.some(m => n.includes(m))) return entry
  }
  return null
}

// ── API key management ────────────────────────────────────────────────────────

function loadApiKey() {
  try { return localStorage.getItem(LS_APIKEY) || '' } catch(_) { return '' }
}
function saveApiKey(key) {
  try { localStorage.setItem(LS_APIKEY, key.trim()) } catch(_) {}
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SITFormModal({ open, onClose, onSave, editSIT }) {
  const [name,     setName]     = useState('')
  const [desc,     setDesc]     = useState('')
  const [tag,      setTag]      = useState('pii')
  const [group,    setGroup]    = useState('pii')
  const [regex,    setRegex]    = useState('')
  const [prox,     setProx]     = useState(50)
  const [guid,     setGuid]     = useState('')
  const [keywords, setKeywords] = useState([])
  const [kwInput,  setKwInput]  = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // API key UI state
  const [apiKey,       setApiKey]       = useState(() => loadApiKey())
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyDraft,     setKeyDraft]     = useState('')

  const kwInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    if (editSIT) {
      setName(editSIT.name || '')
      setDesc(editSIT.desc || '')
      setTag(editSIT.tag || 'pii')
      setGroup(editSIT.group || 'pii')
      setRegex(editSIT.regex || '')
      setProx(editSIT.proximity || 50)
      setGuid(editSIT.guid || '')
      setKeywords(editSIT.keywords || [])
      setAiStatus('')
    } else {
      setName(''); setDesc(''); setTag('pii'); setGroup('pii')
      setRegex(''); setProx(300); setGuid('')
      setKeywords([]); setAiStatus('')
    }
    setKwInput('')
    setShowKeyInput(false)
    // Reload key in case it was saved in a previous session
    setApiKey(loadApiKey())
  }, [open, editSIT])

  // ── Keyword helpers ─────────────────────────────────────────────────────────
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

  // ── Save API key ────────────────────────────────────────────────────────────
  const handleSaveKey = () => {
    const trimmed = keyDraft.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setAiStatus('⚠ That does not look like a valid Anthropic API key (should start with sk-ant-)')
      return
    }
    saveApiKey(trimmed)
    setApiKey(trimmed)
    setShowKeyInput(false)
    setKeyDraft('')
    setAiStatus('✓ API key saved — click AI Suggest to generate patterns.')
  }

  // ── AI Suggest ──────────────────────────────────────────────────────────────
  const aiSuggest = async () => {
    const sitName = name.trim()
    if (!sitName) { setAiStatus('Enter a SIT name first.'); return }

    // Check for API key first
    const key = apiKey || loadApiKey()
    if (!key) {
      setShowKeyInput(true)
      setKeyDraft('')
      setAiStatus('')
      return
    }

    setAiLoading(true)
    setAiStatus('Researching document format and generating patterns…')

    // Build prompt using concatenation to avoid any template literal parsing issues
    const systemPrompt = 'You are a Microsoft Purview DLP expert specialising in document format research. '
      + 'You respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON object. '
      + 'Your response must be parseable by JSON.parse() with no pre-processing.'

    const userPrompt = 'Create a Microsoft Purview Sensitive Information Type (SIT) for: ' + sitName + '\n\n'
      + 'Steps:\n'
      + '1. Identify the country from the name (Kenyan=Kenya, Nigerian=Nigeria, UAE=United Arab Emirates, South African=South Africa, etc)\n'
      + '2. Identify the issuing authority in that country (KRA=Kenya, FIRS=Nigeria, SARS=South Africa, HMRC=UK, IRS=USA, etc)\n'
      + '3. Research the exact official format: digit count, character types, prefixes, separators\n'
      + '4. Write a precise regex matching the official format\n'
      + '5. Write exactly 12+ keywords ONLY for this specific country and document type\n\n'
      + 'KEYWORD RULES — CRITICAL:\n'
      + '- Use the issuing authority full name AND abbreviation as keywords\n'
      + '- Use the document official local name\n'
      + '- Use label text found near this number in real documents\n'
      + '- NEVER use authority names from other countries\n'
      + '  (no SARS for non-South-African, no HMRC for non-UK, no IRS for non-US, no KRA for non-Kenyan)\n\n'
      + 'REGEX RULES:\n'
      + '- No ^ or $ anchors (must match inside document body)\n'
      + '- Use \\\\b word boundaries\n'
      + '- Double ALL backslashes in the JSON string value\n\n'
      + 'Respond with ONLY this JSON (no markdown, no text outside the braces):\n'
      + '{"regex":"...","keywords":["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10","kw11","kw12"],'
      + '"country":"...","authority":"...","abbreviation":"...","format_description":"...","confidence":"high","notes":"..."}'

    try {
      const requestBody = {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(requestBody),
      })

      // Always read the response body to surface the real error message
      const responseBody = await resp.json().catch(() => ({ error: { message: 'Could not read response' } }))

      if (!resp.ok) {
        const errDetail = responseBody?.error?.message || 'HTTP ' + resp.status
        if (resp.status === 401) {
          saveApiKey(''); setApiKey(''); setShowKeyInput(true); setKeyDraft('')
          setAiStatus('⚠ API key rejected — please re-enter your key.')
          setAiLoading(false); return
        }
        if (resp.status === 429) {
          setAiStatus('⚠ Rate limited — wait 30 seconds and try again.')
          setAiLoading(false); return
        }
        throw new Error(errDetail)
      }

      const data = responseBody
      const raw = (data.content || []).find(b => b.type === 'text')?.text || ''
      const clean = raw.replace(/```(?:json)?/gi, '').trim()

      let parsed
      try {
        parsed = JSON.parse(clean)
      } catch (_) {
        const m = clean.match(/\{[\s\S]*\}/)
        if (m) parsed = JSON.parse(m[0])
        else throw new Error('Could not parse AI response')
      }

      if (!parsed.regex) throw new Error('Response missing regex field')

      setRegex(parsed.regex)
      if (parsed.keywords?.length) setKeywords(parsed.keywords)

      // Build a concise description for the SIT desc field
      const descParts = [
        parsed.format_description,
        parsed.authority && `Issued by ${parsed.authority}${parsed.abbreviation ? ' (' + parsed.abbreviation + ')' : ''}`,
        parsed.notes,
      ].filter(Boolean)
      if (descParts.length > 0) setDesc(descParts.join('. ').replace(/\.\./g, '.'))

      const confEmoji = { high: '✓', medium: '~', low: '⚠' }[parsed.confidence] || '✓'
      const parts = [
        `${confEmoji} ${parsed.confidence === 'high' ? 'High confidence' : parsed.confidence === 'medium' ? 'Medium confidence — verify' : 'Low confidence — manual review needed'}`,
        parsed.country && `Country: ${parsed.country}`,
        parsed.authority && `Authority: ${parsed.authority}${parsed.abbreviation ? ' (' + parsed.abbreviation + ')' : ''}`,
        parsed.format_description,
        parsed.notes,
      ].filter(Boolean)

      setAiStatus(parts.join(' · ') + '. Always test against real examples before deploying.')

    } catch (err) {
      // Fallback to generic pattern library
      const fallback = getGenericFallback(sitName)
      if (fallback) {
        setRegex(fallback.regex)
        setKeywords(fallback.keywords)
        setAiStatus(
          `⚠ API error (${err.message}) — generic pattern used. ${fallback.notes} ` +
          `Replace generic keywords with country-specific authority names before saving.`
        )
      } else {
        setAiStatus(
          `⚠ API error (${err.message}). Enter regex manually. ` +
          `Research the official format at the issuing authority's website.`
        )
      }
    }

    setAiLoading(false)
  }

  // ── Save SIT ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim())  { alert('SIT name is required.'); return }
    if (!regex.trim()) { alert('Regex pattern is required.'); return }
    const kwFinal = kwInput.trim() ? [...keywords, kwInput.trim()] : keywords
    const id = editSIT?.id || (
      'custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 28)
      + '_' + Date.now().toString(36)
    )
    const resolvedGuid = guid.trim() || editSIT?.guid || generateGUID()
    const isBuiltInEdit = editSIT && !editSIT.isCustom
    const resolvedDesc = desc.trim() || (isBuiltInEdit ? (editSIT.desc || name.trim()) : `Custom SIT: ${name.trim()}`)
    onSave({
      id,
      name:    name.trim(),
      desc:    resolvedDesc,
      tag, group,
      builtIn: isBuiltInEdit ? (editSIT.builtIn || false) : false,
      isCustom: isBuiltInEdit ? false : true,
      guid:    resolvedGuid,
      conf:    'Medium',
      regex,
      keywords: kwFinal,
      proximity: prox,
    })
  }

  const hasKey = !!apiKey
  const title  = editSIT ? `Edit SIT — ${editSIT.name}` : 'Add Custom SIT'

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
      {/* ── API Key panel (shown when key missing or user clicks Configure) ── */}
      {showKeyInput && (
        <div className={s.apiKeyPanel}>
          <div className={s.apiKeyPanelTitle}>Anthropic API Key required for AI Suggest</div>
          <p className={s.apiKeyPanelDesc}>
            AI Suggest calls the Claude API directly from your browser. Your key is stored
            only in <code>localStorage</code> on this device and is never sent anywhere
            except Anthropic's API. Get a key at{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"
              style={{ color: 'var(--orange)' }}>
              console.anthropic.com
            </a>.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              type="password"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
              placeholder="sk-ant-api03-..."
              autoFocus
              style={{ flex: 1, fontFamily: 'Consolas, Menlo, monospace', fontSize: 13 }}
            />
            <BtnPrimary onClick={handleSaveKey} style={{ padding: '8px 16px', fontSize: 12 }}>
              Save Key
            </BtnPrimary>
            <BtnSecondary onClick={() => { setShowKeyInput(false); setKeyDraft('') }}
              style={{ padding: '8px 14px', fontSize: 12 }}>
              Cancel
            </BtnSecondary>
          </div>
        </div>
      )}

      {/* ── SIT Name + AI Suggest ── */}
      <div className={s.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <label className={s.label} style={{ marginBottom: 0 }}>SIT Name *</label>
          {hasKey && !showKeyInput && (
            <button
              style={{ fontSize: 11, color: 'var(--text-m)', background: 'none', border: 'none',
                cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              onClick={() => { setShowKeyInput(true); setKeyDraft('') }}
            >
              Change API key
            </button>
          )}
        </div>
        <div className={s.aiRow}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !aiLoading && aiSuggest()}
            placeholder="e.g. Kenyan Tax PIN, Nigerian BVN, UAE Emirates ID Number"
            style={{ flex: 1 }}
          />
          <button
            className={[s.aiBtn, aiLoading && s.aiBtnLoading].filter(Boolean).join(' ')}
            onClick={aiSuggest}
            disabled={aiLoading}
            title={hasKey
              ? 'Researches the official format and generates country-specific regex + keywords'
              : 'Requires an Anthropic API key — click to set one up'}
          >
            {aiLoading
              ? <><span className={s.spin} /> Researching…</>
              : <>{hasKey ? '✦' : '🔑'} AI Suggest</>
            }
          </button>
        </div>
        {aiStatus && (
          <div className={[
            s.aiNote,
            (aiStatus.startsWith('✓') || aiStatus.startsWith('~ Medium')) && s.aiNoteOk,
            (aiStatus.startsWith('⚠') || aiStatus.startsWith('~ Low'))    && s.aiNoteWarn,
          ].filter(Boolean).join(' ')}>
            {aiStatus}
          </div>
        )}
        {!hasKey && !showKeyInput && !aiStatus && (
          <div className={s.aiNote} style={{ color: 'var(--text-m)' }}>
            AI Suggest needs an Anthropic API key.{' '}
            <button style={{ color: 'var(--orange)', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
              onClick={() => setShowKeyInput(true)}>
              Set up key
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className={s.formGroup}>
        <label className={s.label}>
          Description
          <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0,
            fontSize:11, color:'var(--text-m)', marginLeft:6 }}>
            (shown in Step 1 SIT cards and Config table)
          </span>
        </label>
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="e.g. 11-digit KRA PIN issued by Kenya Revenue Authority"
        />
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
        <input
          type="text"
          value={regex}
          onChange={e => setRegex(e.target.value)}
          placeholder="e.g. \b[A-Z]{2}\d{7}\b"
          style={{ fontFamily: 'Consolas, Menlo, monospace', fontSize: 13 }}
        />
      </div>

      {/* Keywords */}
      <div className={s.formGroup}>
        <label className={s.label}>
          Proximity Keywords
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0,
            fontSize: 11, color: 'var(--text-m)', marginLeft: 6 }}>
            (Enter or comma to add — minimum 10 recommended)
          </span>
        </label>
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
            placeholder={keywords.length === 0 ? 'Type keyword, press Enter or comma…' : ''}
          />
        </div>
        {keywords.length > 0 && keywords.length < 10 && (
          <div style={{ fontSize: 11, color: 'var(--orange-d)', marginTop: 4 }}>
            {10 - keywords.length} more keyword{10 - keywords.length > 1 ? 's' : ''} recommended
          </div>
        )}
      </div>

      {/* Proximity + GUID */}
      <div className={s.formRow}>
        <div className={s.formGroup}>
          <label className={s.label}>Proximity (chars)</label>
          <input type="number" value={prox} min={50} max={1000} step={50}
            onChange={e => setProx(+e.target.value)} />
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>GUID (auto if blank)</label>
          <input type="text" value={guid} onChange={e => setGuid(e.target.value)}
            placeholder="Leave blank to auto-generate" />
        </div>
      </div>
    </Modal>
  )
}
