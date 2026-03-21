// src/utils/constants.ts

export const STORAGE_KEY = 'registroMusical2026';
export const DARK_MODE_KEY = 'rmDark';
export const NAV_KEYS_KEY = 'navKeys2026';

export const DRIVE_CLIENT_ID = '350319287742-0j0tl5b32addfg0spa7ag5ik28c38u1t.apps.googleusercontent.com';
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
export const DRIVE_FILE_NAME = 'registro_musical_2026.json';

export const DIM_CONFIG = {
  ser:   { label: 'SER',   max: 10, acts: 3, color: '#6a9fd8', bg: '#1a2a45' },
  saber: { label: 'SABER', max: 45, acts: 8, color: '#9a7fd8', bg: '#2a1a4a' },
  hacer: { label: 'HACER', max: 40, acts: 8, color: '#6abf7e', bg: '#1a3322' },
  auto:  { label: 'AUTO',  max: 5,  acts: 1, color: '#d89a4a', bg: '#3a2a10' },
} as const;

export const TRIM_LABELS: Record<number, string> = { 1: '1er', 2: '2do', 3: '3er' };

export const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

export const DEFAULT_POS_TEXTS = [
  'Gran participacion','Completo todo el trabajo','Gran trabajo en grupo',
  'Excelente actitud','Domina el instrumento','Excelente lectura musical',
  'Mejoro su nota','Participa activamente','Muy responsable','Creatividad destacada'
];

export const DEFAULT_NEG_TEXTS = [
  'Dormitar en clase','No completo la tarea','Interrumpir la clase',
  'Sin materiales','Falta de respeto','Hablar en clase',
  'Bajo rendimiento','Falta de atencion','Actitud negativa','No trajo instrumento'
];

export const CALENDAR_TYPE_CONFIG = {
  examen:    { color: '#e05c5c', bg: '#3a1515', icon: '📝', label: 'Examen' },
  actividad: { color: '#6a9fd8', bg: '#1a2a45', icon: '⚡', label: 'Actividad' },
  feriado:   { color: '#6abf7e', bg: '#1a3322', icon: '🎉', label: 'Feriado' },
  reunion:   { color: '#d89a4a', bg: '#3a2a10', icon: '👥', label: 'Reunion' },
  otro:      { color: '#9a8a6a', bg: '#2a2418', icon: '📌', label: 'Otro' },
} as const;

export const VGB_LEVELS = [
  { min: 0,    max: 0.36, bg: '#3a1515', text: '#e05c5c', border: '#8b3a3a', label: '<36%' },
  { min: 0.36, max: 0.51, bg: '#3a2505', text: '#f0a030', border: '#b87333', label: '36-51%' },
  { min: 0.51, max: 0.65, bg: '#3a2a05', text: '#f0c030', border: '#b8860b', label: '51-65%' },
  { min: 0.65, max: 0.75, bg: '#1a3322', text: '#6abf7e', border: '#4a7c59', label: '65-75%' },
  { min: 0.75, max: 0.88, bg: '#0f2518', text: '#86efac', border: '#4a7c59', label: '75-88%' },
  { min: 0.88, max: 1.01, bg: '#052e16', text: '#4ade80', border: '#16a34a', label: '>88% ★' },
] as const;

export const EXCEL_COL_MAP = {
  ser:   { cols: [3, 4, 5],                          promCol: 6  },
  saber: { cols: [7, 8, 9, 10, 11, 12, 13, 14],     promCol: 15 },
  hacer: { cols: [16, 17, 18, 19, 20, 21, 22, 23],  promCol: 24 },
  auto:  { cols: [25],                               promCol: 26 },
} as const;

export const GRADE_ROWS_START = 8;