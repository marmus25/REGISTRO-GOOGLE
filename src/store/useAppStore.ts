// src/store/useAppStore.ts
import { create } from 'zustand';
import type {
  AppData, CourseData, NavigationSection, SaveStatus,
  TrimesterNumber, GradeDimension, AttendanceStatus,
  TrackingEntry, CalendarEvent, QuickTexts, NavKeys, GradeEntry
} from '../types/index';
import { parseXLSXFile, mergeCourseData } from '../utils/xlsxParser';
import { exportToXLSX } from '../utils/xlsxExporter';
import { calcProm, calcTotal } from '../utils/calculations';
import {
  STORAGE_KEY, DARK_MODE_KEY, NAV_KEYS_KEY,
  DEFAULT_POS_TEXTS, DEFAULT_NEG_TEXTS
} from '../utils/constants';

interface ExportGrade extends GradeEntry {
  prom_ser?: number | null;
  prom_saber?: number | null;
  prom_hacer?: number | null;
  total?: number | null;
}

interface AppStore {
  appData: AppData;
  currentSection: NavigationSection;
  saveStatus: SaveStatus;
  hasChanges: boolean;
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  driveToken: string | null;
  driveFileId: string | null;
  lastSyncTime: string | null;
  toast: { msg: string; type: 'ok' | 'err' | 'info' } | null;
  modalContent: React.ReactNode | null;
  navKeys: NavKeys;

  loadCourses: (files: File[]) => Promise<void>;
  addCourses: (files: File[]) => Promise<void>;
  setCurrentCourse: (courseId: string) => void;
  addManualStudent: (courseId: string, nro: number, nombre: string, sexo: string) => void;
  hideStudent: (courseId: string, idx: number) => void;
  restoreStudent: (courseId: string, idx: number) => void;

  setGrade: (courseId: string, trim: TrimesterNumber, studentIdx: number, dim: GradeDimension, actIdx: number, value: number | null) => void;
  setAuto: (courseId: string, trim: TrimesterNumber, studentIdx: number, value: number | null) => void;
  setActivityName: (courseId: string, trim: TrimesterNumber, dim: GradeDimension, actIdx: number, name: string) => void;
  autofillDim: (courseId: string, trim: TrimesterNumber, dim: GradeDimension, actIdx: number, value: number) => void;

  setAttendance: (courseId: string, trim: TrimesterNumber, date: string, studentIdx: number, status: AttendanceStatus | null) => void;
  markAllAttendance: (courseId: string, trim: TrimesterNumber, date: string, status: AttendanceStatus) => void;
  clearAttendanceDate: (courseId: string, trim: TrimesterNumber, date: string) => void;
  deleteAttendanceDate: (courseId: string, trim: TrimesterNumber, date: string) => void;

  setObservation: (courseId: string, trim: TrimesterNumber, studentIdx: number, text: string) => void;
  addTracking: (courseId: string, entry: TrackingEntry) => void;
  deleteTracking: (courseId: string, ts: number) => void;
  setQuickTexts: (texts: QuickTexts) => void;

  addCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (idx: number) => void;

  setSection: (section: NavigationSection) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  showToast: (msg: string, type?: 'ok' | 'err' | 'info') => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  setNavKeys: (keys: NavKeys) => void;

  markChanged: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportJSON: () => Promise<void>;
  importJSON: (file: File) => Promise<void>;
  resetApp: () => void;
  exportXLSX: (courseId: string, trim: TrimesterNumber | 'todos') => void;

  setDriveToken: (token: string | null) => void;
  setDriveFileId: (id: string | null) => void;
  setLastSyncTime: (time: string | null) => void;
}

let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const emptyAppData = (): AppData => ({
  courses: {},
  currentCourse: null,
  textosRapidos: { pos: [...DEFAULT_POS_TEXTS], neg: [...DEFAULT_NEG_TEXTS] },
  calendario: [],
});

const emptyGrade = (): GradeEntry => ({ ser: [], saber: [], hacer: [], auto: null });

export const useAppStore = create<AppStore>((set, get) => ({
  appData: emptyAppData(),
  currentSection: 'resumen',
  saveStatus: 'idle',
  hasChanges: false,
  sidebarCollapsed: false,
  isDarkMode: localStorage.getItem(DARK_MODE_KEY) === '1',
  driveToken: null,
  driveFileId: null,
  lastSyncTime: null,
  toast: null,
  modalContent: null,
  navKeys: (() => {
    try {
      const s = localStorage.getItem(NAV_KEYS_KEY);
      return s ? JSON.parse(s) : { prev: 'PageUp', next: 'PageDown' };
    } catch { return { prev: 'PageUp', next: 'PageDown' }; }
  })(),

  loadCourses: async (files) => {
    for (const file of files) {
      try {
        const { courseId, data } = await parseXLSXFile(file);
        set(state => {
          const courses = { ...state.appData.courses };
          courses[courseId] = courses[courseId]
            ? mergeCourseData(courses[courseId], data)
            : data;
          return {
            appData: {
              ...state.appData,
              courses,
              currentCourse: state.appData.currentCourse ?? courseId,
            }
          };
        });
        get().showToast(`Curso cargado: ${data.meta.curso}`, 'ok');
      } catch {
        get().showToast(`Error cargando ${file.name}`, 'err');
      }
    }
    get().markChanged();
  },

  addCourses: async (files) => { await get().loadCourses(files); },

  setCurrentCourse: (courseId) => {
    set(state => ({ appData: { ...state.appData, currentCourse: courseId } }));
  },

  addManualStudent: (courseId, nro, nombre, sexo) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const ni = course.students.length;
      const newStudents = [...course.students, { nro, nombre, sexo, manual: true }];
      const newGrades = { ...course.grades };
      ([1, 2, 3] as TrimesterNumber[]).forEach(t => {
        newGrades[t] = { ...newGrades[t], [ni]: emptyGrade() };
      });
      return {
        appData: {
          ...state.appData,
          courses: { ...state.appData.courses, [courseId]: { ...course, students: newStudents, grades: newGrades } }
        }
      };
    });
    get().markChanged();
  },

  hideStudent: (courseId, idx) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const newStudents = course.students.map((s, i) => i === idx ? { ...s, oculto: true } : s);
      return {
        appData: {
          ...state.appData,
          courses: { ...state.appData.courses, [courseId]: { ...course, students: newStudents } }
        }
      };
    });
    get().markChanged();
  },

  restoreStudent: (courseId, idx) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const newStudents = course.students.map((s, i) => i === idx ? { ...s, oculto: false } : s);
      return {
        appData: {
          ...state.appData,
          courses: { ...state.appData.courses, [courseId]: { ...course, students: newStudents } }
        }
      };
    });
    get().markChanged();
  },

  setGrade: (courseId, trim, studentIdx, dim, actIdx, value) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const g: GradeEntry = { ...(course.grades[trim][studentIdx] ?? emptyGrade()) };
      const arr = [...(g[dim] as (number | null)[])];
      arr[actIdx] = value;
      g[dim] = arr as (number | null)[];
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              grades: { ...course.grades, [trim]: { ...course.grades[trim], [studentIdx]: g } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  setAuto: (courseId, trim, studentIdx, value) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const g: GradeEntry = { ...(course.grades[trim][studentIdx] ?? emptyGrade()), auto: value };
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              grades: { ...course.grades, [trim]: { ...course.grades[trim], [studentIdx]: g } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  setActivityName: (courseId, trim, dim, actIdx, name) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const acts = [...course.activities[trim][dim]];
      acts[actIdx] = name;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              activities: { ...course.activities, [trim]: { ...course.activities[trim], [dim]: acts } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  autofillDim: (courseId, trim, dim, actIdx, value) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const newGrades = { ...course.grades[trim] };
      course.students.forEach((_, i) => {
        const g: GradeEntry = { ...(newGrades[i] ?? emptyGrade()) };
        const arr = [...(g[dim] as (number | null)[])];
        if (arr[actIdx] === null || arr[actIdx] === undefined) {
          arr[actIdx] = value;
          g[dim] = arr as (number | null)[];
        }
        newGrades[i] = g;
      });
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: { ...course, grades: { ...course.grades, [trim]: newGrades } }
          }
        }
      };
    });
    get().markChanged();
  },

  setAttendance: (courseId, trim, date, studentIdx, status) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const dayData = { ...(course.attendance[trim][date] ?? {}) };
      if (status === null) delete dayData[studentIdx];
      else dayData[studentIdx] = status;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              attendance: { ...course.attendance, [trim]: { ...course.attendance[trim], [date]: dayData } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  markAllAttendance: (courseId, trim, date, status) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const dayData: Record<number, AttendanceStatus> = {};
      course.students.forEach((_, i) => { dayData[i] = status; });
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              attendance: { ...course.attendance, [trim]: { ...course.attendance[trim], [date]: dayData } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  clearAttendanceDate: (courseId, trim, date) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              attendance: { ...course.attendance, [trim]: { ...course.attendance[trim], [date]: {} } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  deleteAttendanceDate: (courseId, trim, date) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      const newAtt = { ...course.attendance[trim] };
      delete newAtt[date];
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: { ...course, attendance: { ...course.attendance, [trim]: newAtt } }
          }
        }
      };
    });
    get().markChanged();
  },

  setObservation: (courseId, trim, studentIdx, text) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              observations: { ...course.observations, [trim]: { ...course.observations[trim], [studentIdx]: text } }
            }
          }
        }
      };
    });
    get().markChanged();
  },

  addTracking: (courseId, entry) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: { ...course, seguimiento: [...(course.seguimiento ?? []), entry] }
          }
        }
      };
    });
    get().markChanged();
  },

  deleteTracking: (courseId, ts) => {
    set(state => {
      const course = state.appData.courses[courseId];
      if (!course) return state;
      return {
        appData: {
          ...state.appData,
          courses: {
            ...state.appData.courses,
            [courseId]: {
              ...course,
              seguimiento: (course.seguimiento ?? []).filter(o => o.ts !== ts)
            }
          }
        }
      };
    });
    get().markChanged();
  },

  setQuickTexts: (texts) => {
    set(state => ({ appData: { ...state.appData, textosRapidos: texts } }));
    get().markChanged();
  },

  addCalendarEvent: (event) => {
    set(state => ({
      appData: { ...state.appData, calendario: [...(state.appData.calendario ?? []), event] }
    }));
    get().markChanged();
  },

  deleteCalendarEvent: (idx) => {
    set(state => ({
      appData: {
        ...state.appData,
        calendario: (state.appData.calendario ?? []).filter((_, i) => i !== idx)
      }
    }));
    get().markChanged();
  },

  setSection: (section) => set({ currentSection: section }),
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleDarkMode: () => set(state => {
    const next = !state.isDarkMode;
    localStorage.setItem(DARK_MODE_KEY, next ? '1' : '0');
    return { isDarkMode: next };
  }),

  showToast: (msg, type = 'ok') => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },

  openModal: (content) => set({ modalContent: content }),
  closeModal: () => set({ modalContent: null }),

  setNavKeys: (keys) => {
    localStorage.setItem(NAV_KEYS_KEY, JSON.stringify(keys));
    set({ navKeys: keys });
  },

  markChanged: () => {
    set({ hasChanges: true, saveStatus: 'saving' });
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => get().saveToLocalStorage(), 1500);
  },

  saveToLocalStorage: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().appData));
      set({ saveStatus: 'saved', hasChanges: false });
    } catch {
      set({ saveStatus: 'idle' });
    }
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const d: AppData = JSON.parse(saved);
      if (!d.courses || Object.keys(d.courses).length === 0) return false;
      if (!d.currentCourse) d.currentCourse = Object.keys(d.courses)[0];
      if (!d.textosRapidos) d.textosRapidos = { pos: [...DEFAULT_POS_TEXTS], neg: [...DEFAULT_NEG_TEXTS] };
      if (!d.calendario) d.calendario = [];
      set({ appData: d });
      return true;
    } catch { return false; }
  },

  exportJSON: async () => {
    interface ExportAppData extends AppData {
      exportedAt?: string;
      courses: Record<string, CourseData & {
        grades: Record<TrimesterNumber, Record<number, ExportGrade>>;
      }>;
    }
    const exp: ExportAppData = JSON.parse(JSON.stringify(get().appData));
    Object.values(exp.courses).forEach(c => {
      ([1, 2, 3] as TrimesterNumber[]).forEach(t => {
        c.students.forEach((_, i) => {
          const g = c.grades[t][i] as ExportGrade;
          if (!g) return;
          g.prom_ser = calcProm(c, t, i, 'ser');
          g.prom_saber = calcProm(c, t, i, 'saber');
          g.prom_hacer = calcProm(c, t, i, 'hacer');
          g.total = calcTotal(c, t, i);
        });
      });
    });
    exp.exportedAt = new Date().toISOString();
    const jsonStr = JSON.stringify(exp, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const fileName = `registro_musical_${new Date().toISOString().split('T')[0]}.json`;

    // Android WebView / móvil: usar navigator.share
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Registro Musical 2026' });
          get().showToast('JSON compartido', 'ok');
          return;
        }
      } catch { /* fallback al método tradicional */ }
    }

    // Fallback: método tradicional (desktop)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
    get().showToast('JSON exportado', 'ok');
  },

  importJSON: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const d: AppData = JSON.parse(e.target?.result as string);
          if (!d.courses) { get().showToast('JSON invalido', 'err'); reject(new Error('invalid')); return; }
          if (!d.currentCourse) d.currentCourse = Object.keys(d.courses)[0];
          set({ appData: d });
          get().markChanged();
          get().showToast(`Importado: ${Object.keys(d.courses).length} cursos`, 'ok');
          resolve();
        } catch { get().showToast('Error leyendo JSON', 'err'); reject(new Error('parse error')); }
      };
      reader.readAsText(file);
    });
  },

  resetApp: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  },

  exportXLSX: (courseId, trim) => {
    const course = get().appData.courses[courseId];
    if (!course) return;
    exportToXLSX(course, trim);
  },

  setDriveToken: (token) => set({ driveToken: token }),
  setDriveFileId: (id) => set({ driveFileId: id }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));