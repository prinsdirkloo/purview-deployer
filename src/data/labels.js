// ── Default BUI 4-label taxonomy ─────────────────────────────────────────────
// ContentType "File, Email" on all labels makes them compatible with future
// sub-label promotion — Purview automatically treats a label as a parent
// when a child is added beneath it, no PowerShell change required.

export const DEFAULT_LABELS = [
  {
    id: 'public',
    name: 'Public',
    displayName: 'Public',
    tooltip: 'Business data that is specifically prepared and approved for public consumption.',
    color: '#33cc66',
    footer: { enabled: true,  text: 'Public',              color: '#000000', size: 10, align: 'Center' },
    header: { enabled: false, text: '',                     color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 1,
  },
  {
    id: 'general',
    name: 'General',
    displayName: 'General',
    tooltip: 'Information that is intended for use only by employees when conducting business. Outside disclosure would be against the interest of the entity and impede the effective operation of the entity. All information becomes Internal if not explicitly specified otherwise.',
    color: '#0078d4',
    footer: { enabled: true,  text: 'General',             color: '#000000', size: 10, align: 'Center' },
    header: { enabled: false, text: '',                     color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 2,
  },
  {
    id: 'confidential',
    name: 'Confidential',
    displayName: 'Confidential',
    tooltip: 'Sensitive business data that could cause damage to the business if shared with unauthorized people. Examples include contracts, security reports, forecast summaries, and sales account data.',
    color: '#ffb900',
    footer: { enabled: true,  text: 'Confidential',        color: '#000000', size: 10, align: 'Center' },
    header: { enabled: true,  text: 'Confidential',        color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 3,
  },
  {
    id: 'highly_restricted',
    name: 'Highly Restricted',
    displayName: 'Highly Restricted',
    tooltip: 'Very sensitive business data that would cause damage to the business if it was shared with unauthorized people. Examples include employee and customer information, passwords, source code, and pre-announced financial reports.',
    color: '#d13438',
    footer: { enabled: true,  text: 'Highly Restricted',   color: '#000000', size: 10, align: 'Center' },
    header: { enabled: true,  text: 'Highly Restricted',   color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: true, text: 'Highly Restricted', layout: 'Diagonal', size: 36 },
    order: 4,
  },
]

export const ALIGN_OPTIONS  = ['Left', 'Center', 'Right']
export const LAYOUT_OPTIONS = ['Horizontal', 'Diagonal']
