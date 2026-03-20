export const Colors = {
  // Forest Green Palette
  primary: '#1A4731',
  primaryMid: '#2D6A4F',
  primaryLight: '#40916C',
  primarySoft: '#74C69D',
  primaryPale: '#D8F3DC',
  primaryXPale: '#F0FAF3',

  // Surfaces
  background: '#F5F7F5',
  surface: '#FFFFFF',
  surfaceGreen: '#F0FAF3',

  // Text
  textPrimary: '#0D1B12',
  textSecondary: '#4A5C52',
  textMuted: '#8FA898',
  textOnGreen: '#FFFFFF',
  textOnGreenSoft: 'rgba(255,255,255,0.72)',

  // Borders
  border: '#E2EAE4',
  borderLight: '#EFF4F0',
  borderMedium: '#B7D5BC',

  // Semantic
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#2D6A4F',
  successLight: '#D8F3DC',
  warning: '#7D5A1E',
  warningLight: '#FEF9EC',

  // Navigation
  navBg: '#FFFFFF',
  navActive: '#1A4731',
  navInactive: '#94A3A0',
  navActiveBg: '#2D6A4F',

  // Finance categories
  catFood: '#8B4513',
  catTransport: '#1B4D6B',
  catShopping: '#6B2D8B',
  catBills: '#1A4731',
  catEntertain: '#4A1942',
  catEducation: '#2D6A4F',
  catHealth: '#40916C',
  catOther: '#5C6B61',

  // Priority
  priorityHigh: '#C1121F',
  priorityMedium: '#40916C',
  priorityLow: '#74C69D',

  // Mood
  moodGreat: '#1A4731',
  moodGood: '#2D6A4F',
  moodOkay: '#74C69D',
  moodSad: '#8FA898',
  moodStressed: '#C1121F',
} as const

export const Gradients = {
  headerRadial: [
    '#0A1A0F',
    '#1A4731',
    '#2D6A4F',
  ] as const,
  glowColor: 'rgba(52, 168, 83, 0.55)',
  buttonPrimary: ['#40916C', '#2D6A4F', '#1A4731'] as const,
  cardGreen: ['#2D6A4F', '#1A4731'] as const,
  fab: ['#52B788', '#2D6A4F'] as const,
} as const
