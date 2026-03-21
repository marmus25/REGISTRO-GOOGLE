// src/types/index.ts

export type AttendanceStatus = 'P' | 'F' | 'L' | 'R';
export type ObservationType = 'pos' | 'neg';
export type CalendarEventType = 'examen' | 'actividad' | 'feriado' | 'reunion' | 'otro';
export type GradeDimension = 'ser' | 'saber' | 'hacer';
export type TrimesterNumber = 1 | 2 | 3;
export type SaveStatus = 'idle' | 'saving' | 'saved';

export type NavigationSection =
  | 'resumen' | 'config' | 'informe-curso' | 'informe-ind'
  | 'att1' | 'att2' | 'att3'
  | 'cal1' | 'cal2' | 'cal3'
  | 'seg' | 'obs1' | 'obs2' | 'obs3'
  | 'calendario';

export interface Student {
  nro: number;
  nombre: string;
  sexo: string;
  manual?: boolean;
  oculto?: boolean;
}

export interface GradeEntry {
  ser: (number | null)[];
  saber: (number | null)[];
  hacer: (number | null)[];
  auto: number | null;
}

export interface TrimesterActivities {
  ser: string[];
  saber: string[];
  hacer: string[];
}

export interface TrackingEntry {
  idx: number;
  texto: string;
  tipo: ObservationType;
  ts: number;
}

export interface CalendarEvent {
  tipo: CalendarEventType;
  fecha: string;
  titulo: string;
  curso?: string;
  notas?: string;
}

export interface CourseMeta {
  courseId: string;
  curso: string;
  docente: string;
  area: string;
  fileName: string;
  loadedAt: string;
  lastMerge?: string;
}

export interface CourseData {
  meta: CourseMeta;
  students: Student[];
  attendance: Record<TrimesterNumber, Record<string, Record<number, AttendanceStatus>>>;
  grades: Record<TrimesterNumber, Record<number, GradeEntry>>;
  activities: Record<TrimesterNumber, TrimesterActivities>;
  observations: Record<TrimesterNumber, Record<number, string>>;
  seguimiento: TrackingEntry[];
}

export interface QuickTexts {
  pos: string[];
  neg: string[];
}

export interface AppData {
  courses: Record<string, CourseData>;
  currentCourse: string | null;
  textosRapidos?: QuickTexts;
  calendario?: CalendarEvent[];
}

export interface NavKeys {
  prev: string;
  next: string;
}

export interface DimConfig {
  label: string;
  max: number;
  acts: number;
  color: string;
  bg: string;
}

export interface VGBLevel {
  min: number;
  max: number;
  bg: string;
  text: string;
  border: string;
  label: string;
}