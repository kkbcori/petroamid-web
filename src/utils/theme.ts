export const Colors = {
  navy:        '#FFF8F0',
  navyMid:     '#FFFFFF',
  navyLight:   '#FFF0E6',
  teal:        '#FF6B6B',
  tealDark:    '#E85555',
  tealGlow:    'rgba(255,107,107,0.15)',
  gold:        '#FFB347',
  goldLight:   'rgba(255,179,71,0.18)',
  cream:       '#2D1B00',
  creammid:    '#8B6F5E',
  creamDim:    'rgba(45,27,0,0.35)',
  green:       '#22C55E',
  greenBg:     'rgba(34,197,94,0.12)',
  yellow:      '#EAB308',
  yellowBg:    'rgba(234,179,8,0.12)',
  orange:      '#F97316',
  orangeBg:    'rgba(249,115,22,0.12)',
  red:         '#EF4444',
  redBg:       'rgba(239,68,68,0.12)',
  blue:        '#3B82F6',
  blueBg:      'rgba(59,130,246,0.12)',
  categoryColors: {
    document: '#3B82F6', vaccination: '#22C55E', health: '#F97316',
    booking: '#A855F7', microchip: '#FF6B6B', form: '#FFB347',
  },
  border:      'rgba(45,27,0,0.10)',
  borderLight: 'rgba(45,27,0,0.06)',
  shadow:      'rgba(255,107,107,0.15)',
  overlay:     'rgba(255,248,240,0.95)',
} as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const Radius  = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    background: ${Colors.navy};
    color: ${Colors.cream};
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input, select, textarea { font-family: inherit; outline: none; }
  a { color: inherit; text-decoration: none; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(45,27,0,0.15); border-radius: 3px; }
`;
