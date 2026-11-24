/**
 * Documentation-facing mirror of the tokens declared in src/index.css.
 * Keep both in sync when tokens change.
 */

export type Swatch = { step: string; hex: string }

export const brandColors = [
  { name: 'Primary Navy', token: 'navy-900', hex: '#0F294A', role: 'Dominant brand colour. Primary actions, navigation, headings on light.' },
  { name: 'Accessible Crimson', token: 'crimson-600', hex: '#C8102E', role: 'Key conversion actions, highlights, brand accents. Use sparingly.' },
  { name: 'Deep Red', token: 'crimson-700', hex: '#B81422', role: 'Crimson hover/pressed, error text, high-emphasis alerts.' },
  { name: 'Supporting Teal', token: 'teal-600', hex: '#297E85', role: 'Learning, progress, supportive and educational elements. Focus ring.' },
  { name: 'Background', token: 'canvas', hex: '#F8FAFC', role: 'App canvas behind cards and content.' },
  { name: 'Surface', token: 'surface', hex: '#FFFFFF', role: 'Cards, sheets, inputs, navigation bars.' },
] as const

export const colorScales: Array<{ name: string; token: string; anchor: string; swatches: Swatch[] }> = [
  {
    name: 'Navy',
    token: 'navy',
    anchor: '900',
    swatches: [
      { step: '50', hex: '#F2F5FA' },
      { step: '100', hex: '#E3EAF3' },
      { step: '200', hex: '#C6D3E6' },
      { step: '300', hex: '#9CB2D2' },
      { step: '400', hex: '#6A8BBA' },
      { step: '500', hex: '#466B9F' },
      { step: '600', hex: '#2F5285' },
      { step: '700', hex: '#22406B' },
      { step: '800', hex: '#183357' },
      { step: '900', hex: '#0F294A' },
      { step: '950', hex: '#0A1C33' },
    ],
  },
  {
    name: 'Crimson',
    token: 'crimson',
    anchor: '600',
    swatches: [
      { step: '50', hex: '#FDF2F4' },
      { step: '100', hex: '#FBE3E7' },
      { step: '200', hex: '#F6C4CD' },
      { step: '300', hex: '#EE96A5' },
      { step: '400', hex: '#E25A72' },
      { step: '500', hex: '#D6304C' },
      { step: '600', hex: '#C8102E' },
      { step: '700', hex: '#B81422' },
      { step: '800', hex: '#94101C' },
      { step: '900', hex: '#6E0C15' },
    ],
  },
  {
    name: 'Teal',
    token: 'teal',
    anchor: '600',
    swatches: [
      { step: '50', hex: '#EFF8F8' },
      { step: '100', hex: '#D7EEEF' },
      { step: '200', hex: '#B0DCDE' },
      { step: '300', hex: '#7DC2C6' },
      { step: '400', hex: '#4BA3A9' },
      { step: '500', hex: '#348D94' },
      { step: '600', hex: '#297E85' },
      { step: '700', hex: '#22666C' },
      { step: '800', hex: '#1D5357' },
      { step: '900', hex: '#173F42' },
    ],
  },
  {
    name: 'Slate (neutral)',
    token: 'slate',
    anchor: '900',
    swatches: [
      { step: '50', hex: '#F8FAFC' },
      { step: '100', hex: '#F1F5F9' },
      { step: '200', hex: '#E2E8F0' },
      { step: '300', hex: '#CBD5E1' },
      { step: '400', hex: '#94A3B8' },
      { step: '500', hex: '#64748B' },
      { step: '600', hex: '#475569' },
      { step: '700', hex: '#334155' },
      { step: '800', hex: '#1E293B' },
      { step: '900', hex: '#0F172A' },
    ],
  },
]

export const semanticTokens: Array<{ group: string; items: Array<{ token: string; hex: string; usage: string }> }> = [
  {
    group: 'Text',
    items: [
      { token: 'ink', hex: '#0F172A', usage: 'Primary text, headings, numbers' },
      { token: 'ink-secondary', hex: '#475569', usage: 'Body copy, descriptions' },
      { token: 'ink-muted', hex: '#64748B', usage: 'Captions, meta, placeholders' },
      { token: 'ink-disabled', hex: '#94A3B8', usage: 'Disabled labels only' },
    ],
  },
  {
    group: 'Surface & border',
    items: [
      { token: 'canvas', hex: '#F8FAFC', usage: 'Page background' },
      { token: 'surface', hex: '#FFFFFF', usage: 'Cards, inputs, bars' },
      { token: 'sunken', hex: '#F1F5F9', usage: 'Wells, tracks, disabled fills' },
      { token: 'line', hex: '#E2E8F0', usage: 'Card borders, dividers' },
      { token: 'line-strong', hex: '#CBD5E1', usage: 'Input borders, emphasis rules' },
    ],
  },
  {
    group: 'Interactive',
    items: [
      { token: 'action-primary', hex: '#0F294A', usage: 'navy-900 · hover navy-800 · pressed navy-950' },
      { token: 'action-accent', hex: '#C8102E', usage: 'crimson-600 · hover/pressed crimson-700/800' },
      { token: 'action-support', hex: '#297E85', usage: 'teal-600 · hover teal-700 · pressed teal-800' },
      { token: 'selected-bg', hex: '#F2F5FA', usage: 'navy-50 · selected rows, active nav' },
      { token: 'focus-ring', hex: '#297E85', usage: '2px outline, 2px offset (teal-300 on navy)' },
    ],
  },
]

export const feedbackTokens = [
  { name: 'Success', fg: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', usage: 'Completed lessons, saved, positive change' },
  { name: 'Warning', fg: '#B45309', bg: '#FFFBEB', border: '#FDE68A', usage: 'Protection gaps, expiring points' },
  { name: 'Error', fg: '#B81422', bg: '#FEF2F2', border: '#FECACA', usage: 'Validation, failed actions' },
  { name: 'Info', fg: '#2F5285', bg: '#F2F5FA', border: '#C6D3E6', usage: 'Tips, neutral system notes' },
] as const

export const contrastPairs = [
  { fg: '#0F172A', bg: '#FFFFFF', label: 'Ink on surface' },
  { fg: '#475569', bg: '#FFFFFF', label: 'Secondary on surface' },
  { fg: '#64748B', bg: '#F8FAFC', label: 'Muted on canvas' },
  { fg: '#FFFFFF', bg: '#0F294A', label: 'White on navy' },
  { fg: '#FFFFFF', bg: '#C8102E', label: 'White on crimson' },
  { fg: '#FFFFFF', bg: '#297E85', label: 'White on teal' },
  { fg: '#0F294A', bg: '#F2F5FA', label: 'Navy on navy-50' },
  { fg: '#22666C', bg: '#EFF8F8', label: 'Teal-700 on teal-50' },
  { fg: '#B81422', bg: '#FDF2F4', label: 'Deep red on crimson-50' },
  { fg: '#7DC2C6', bg: '#0F294A', label: 'Teal-300 on navy' },
] as const

export const typeScale = [
  { token: 'display-xl', cls: 'text-display-xl', size: 48, line: 56, weight: 700, tracking: '-3%', use: 'Marketing hero, desktop only', sample: 'Protect your tomorrow' },
  { token: 'display', cls: 'text-display', size: 36, line: 44, weight: 700, tracking: '-2.5%', use: 'Hero on mobile, dashboard greeting', sample: 'Protect your tomorrow' },
  { token: 'title', cls: 'text-title', size: 28, line: 36, weight: 700, tracking: '-2%', use: 'Page titles', sample: 'Your protection overview' },
  { token: 'heading', cls: 'text-heading', size: 22, line: 30, weight: 600, tracking: '-1.5%', use: 'Section headings', sample: 'Continue learning' },
  { token: 'subheading', cls: 'text-subheading', size: 18, line: 26, weight: 600, tracking: '-1%', use: 'Card titles', sample: 'What is an emergency fund?' },
  { token: 'body-lg', cls: 'text-body-lg', size: 18, line: 28, weight: 400, tracking: '0', use: 'Lead paragraphs, article intros', sample: 'Small habits today build real security later.' },
  { token: 'body', cls: 'text-body', size: 16, line: 24, weight: 400, tracking: '0', use: 'Default body text', sample: 'Medical cards help cover hospital bills when you need care.' },
  { token: 'body-sm', cls: 'text-body-sm', size: 14, line: 20, weight: 400, tracking: '0', use: 'Supporting text, descriptions', sample: 'Based on the details you shared in your check-in.' },
  { token: 'label', cls: 'text-label', size: 15, line: 20, weight: 600, tracking: '0', use: 'Buttons, form labels, nav', sample: 'Start lesson' },
  { token: 'caption', cls: 'text-caption', size: 12, line: 16, weight: 500, tracking: '0', use: 'Meta, timestamps, chart axes', sample: 'Updated 2 hours ago · 5 min read' },
  { token: 'overline', cls: 'text-overline uppercase', size: 11, line: 16, weight: 600, tracking: '+8%', use: 'Eyebrows, category labels', sample: 'Protection education' },
  { token: 'numeric-xl', cls: 'text-numeric-xl tabular-nums', size: 40, line: 48, weight: 700, tracking: '-2.5%', use: 'Hero figures, scores', sample: 'RM 12,480' },
  { token: 'numeric', cls: 'text-numeric tabular-nums', size: 24, line: 32, weight: 600, tracking: '-1.5%', use: 'Card figures, stats', sample: '2,450 pts' },
] as const

export const spacingScale = [
  { token: '1', px: 4, use: 'Icon-to-label gap (tight)' },
  { token: '2', px: 8, use: 'Inline gaps, chip padding' },
  { token: '3', px: 12, use: 'Stacked label + input' },
  { token: '4', px: 16, use: 'Card padding (mobile), mobile margin' },
  { token: '5', px: 20, use: 'Card padding (default)' },
  { token: '6', px: 24, use: 'Card padding (desktop), grid gutter' },
  { token: '8', px: 32, use: 'Between related sections' },
  { token: '10', px: 40, use: 'Section spacing (mobile)' },
  { token: '12', px: 48, use: 'Touch target, large gaps' },
  { token: '16', px: 64, use: 'Section spacing (desktop)' },
] as const

export const radii = [
  { token: 'rounded-md', px: 6, use: 'Badges, small tags' },
  { token: 'rounded-xl', px: 12, use: 'Buttons, inputs, nav items' },
  { token: 'rounded-2xl', px: 16, use: 'Cards' },
  { token: 'rounded-3xl', px: 24, use: 'Feature cards, sheets, hero' },
  { token: 'rounded-full', px: 999, use: 'Chips, avatars, pills, toggles' },
] as const

export const elevations = [
  { token: 'shadow-none', use: 'Default cards — border only' },
  { token: 'shadow-e1', use: 'Resting raised elements, selected segments' },
  { token: 'shadow-e2', use: 'Hover on interactive cards, dropdowns' },
  { token: 'shadow-e3', use: 'Modals, bottom sheets, toasts' },
] as const

export const breakpoints = [
  { name: 'Mobile', range: '0 – 767', cols: 4, margin: 16, gutter: 16, nav: 'Bottom bar (5 tabs) + top app bar' },
  { name: 'Tablet', range: '768 – 1023', cols: 8, margin: 24, gutter: 24, nav: 'Collapsed icon rail (80px) + top bar' },
  { name: 'Desktop', range: '1024 +', cols: 12, margin: 32, gutter: 24, nav: 'Sidebar (264px) + top bar, content max 1200px' },
] as const
