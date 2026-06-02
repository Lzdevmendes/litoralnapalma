/**
 * Design tokens — fonte única de verdade para cores, espaçamentos e sombras.
 * Importar em vez de repetir valores inline nos componentes.
 */

export const C = {
  // Brand
  primary:   '#0077b6',
  primary80: 'rgba(0,119,182,0.8)',
  primary20: 'rgba(0,119,182,0.2)',
  primary12: 'rgba(0,119,182,0.12)',
  primary08: 'rgba(0,119,182,0.08)',

  // Background layers
  bg:        '#f0f6fc',  // tela de fundo
  surface:   '#ffffff',  // card
  surfaceAlt:'#f8fafc',  // card secundário

  // Text
  textPrimary:  '#1e293b',
  textSecondary:'#64748b',
  textMuted:    '#94a3b8',

  // Border
  border:    'rgba(0,0,0,0.07)',
  borderBlue:'rgba(0,119,182,0.12)',

  // Status
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  orange:    '#f97316',

  // Traffic
  livre:    '#22c55e',
  moderado: '#f59e0b',
  lento:    '#f97316',
  parado:   '#ef4444',

  // Beach
  vazia:    '#22c55e',
  moderada: '#f59e0b',
  lotada:   '#ef4444',
} as const;

export const S = {
  // Shadows
  card:  '0 2px 12px rgba(0,119,182,0.08)',
  cardMd:'0 4px 20px rgba(0,0,0,0.08)',
  cardLg:'0 8px 32px rgba(0,119,182,0.14)',
  float: '0 8px 28px rgba(0,119,182,0.28)',
} as const;

export const R = {
  // Border radius
  card:   20,
  cardLg: 24,
  button: 16,
  pill:   100,
  chip:   10,
  input:  14,
  icon:   12,
} as const;

export const CARD_BASE = {
  backgroundColor: C.surface,
  borderRadius: R.card,
  padding: 16,
  borderWidth: 1,
  borderColor: C.border,
  boxShadow: S.card,
  gap: 14,
} as const;

export const CARD_HEADER = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: 10,
};

export const ICON_BOX = (color: string) => ({
  width: 36,
  height: 36,
  borderRadius: R.icon,
  backgroundColor: `${color}14`,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});
