// ── Default BUI 4-label taxonomy ─────────────────────────────────────────────
// ContentType "File, Email" on all labels makes them compatible with future
// sub-label promotion — Purview automatically treats a label as a parent
// when a child is added beneath it, no PowerShell change required.

export const DEFAULT_LABELS = [
  {
    id: 'public',
    name: 'Public',
    displayName: 'Public',
    tooltip: 'Business data specifically prepared and approved for public consumption.',
    color: '#33cc66',
    footer: { enabled: true,  text: 'Public',           color: '#000000', size: 10, align: 'Center' },
    header: { enabled: false, text: '',                  color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 1,
  },
  {
    id: 'general',
    name: 'General',
    displayName: 'General',
    tooltip: 'Business data that is not intended for public consumption but can be shared with internal and trusted external parties.',
    color: '#0078d4',
    footer: { enabled: true,  text: 'General',          color: '#000000', size: 10, align: 'Center' },
    header: { enabled: false, text: '',                  color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 2,
  },
  {
    id: 'confidential',
    name: 'Confidential',
    displayName: 'Confidential',
    tooltip: 'Sensitive business data that could cause damage to the business if shared with unauthorised people.',
    color: '#ffb900',
    footer: { enabled: true,  text: 'Confidential',     color: '#000000', size: 10, align: 'Center' },
    header: { enabled: true,  text: 'Confidential',     color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: false, text: '', layout: 'Horizontal', size: 36 },
    order: 3,
  },
  {
    id: 'highly_confidential',
    name: 'Highly Confidential',
    displayName: 'Highly Confidential',
    tooltip: 'The most sensitive business data. Unauthorised sharing could cause serious or irreparable damage to the organisation.',
    color: '#d13438',
    footer: { enabled: true,  text: 'Highly Confidential', color: '#000000', size: 10, align: 'Center' },
    header: { enabled: true,  text: 'Highly Confidential', color: '#000000', size: 10, align: 'Center' },
    watermark: { enabled: true, text: 'Highly Confidential', layout: 'Diagonal', size: 36 },
    order: 4,
  },
]

export const ALIGN_OPTIONS  = ['Left', 'Center', 'Right']
export const LAYOUT_OPTIONS = ['Horizontal', 'Diagonal']
