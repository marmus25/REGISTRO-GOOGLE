// src/utils/calculations.ts

import type { CourseData, GradeDimension, TrimesterNumber, AttendanceStatus } from '../types/index';
import { VGB_LEVELS } from './constants';

export function calcProm(
  course: CourseData,
  trim: TrimesterNumber,
  idx: number,
  dim: GradeDimension
): number | null {
  const vals = (course.grades[trim]?.[idx]?.[dim] ?? [])
    .filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function calcTotal(
  course: CourseData,
  trim: TrimesterNumber,
  idx: number
): number | null {
  const pSer   = calcProm(course, trim, idx, 'ser');
  const pSaber = calcProm(course, trim, idx, 'saber');
  const pHacer = calcProm(course, trim, idx, 'hacer');
  const auto   = course.grades[trim]?.[idx]?.auto ?? null;
  if (pSer === null && pSaber === null && pHacer === null) return null;
  return (pSer ?? 0) + (pSaber ?? 0) + (pHacer ?? 0) + (auto ?? 0);
}

export function countAtt(
  course: CourseData,
  trim: TrimesterNumber,
  idx: number,
  type: AttendanceStatus
): number {
  return Object.values(course.attendance[trim])
    .filter(day => day[idx] === type).length;
}

export function avgAct(
  course: CourseData,
  trim: TrimesterNumber,
  dim: GradeDimension,
  actIdx: number
): number | null {
  const vals = course.students
    .map((_, i) => (course.grades[trim]?.[i]?.[dim] ?? [])[actIdx])
    .filter((v): v is number => v !== null);
  return vals.length
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : null;
}

export function avgDim(
  course: CourseData,
  trim: TrimesterNumber,
  dim: GradeDimension
): number | null {
  const proms = course.students
    .map((_, i) => calcProm(course, trim, i, dim))
    .filter((v): v is number => v !== null);
  return proms.length
    ? Math.round(proms.reduce((a, b) => a + b, 0) / proms.length)
    : null;
}

export function avgTotal(
  course: CourseData,
  trim: TrimesterNumber
): number | null {
  const tots = course.students
    .map((_, i) => calcTotal(course, trim, i))
    .filter((v): v is number => v !== null);
  return tots.length
    ? Math.round(tots.reduce((a, b) => a + b, 0) / tots.length)
    : null;
}

export function getScoreClass(
  val: number | null,
  max: number
): 'green' | 'yellow' | 'red' | 'empty' {
  if (val === null) return 'empty';
  const p = val / max;
  if (p >= 0.51) return 'green';
  if (p >= 0.36) return 'yellow';
  return 'red';
}

export function getVGBLevel(val: number | null, max: number): number {
  if (val === null) return -1;
  const p = val / max;
  for (let i = VGB_LEVELS.length - 1; i >= 0; i--) {
    if (p >= VGB_LEVELS[i].min) return i;
  }
  return 0;
}

export function getScoreColor(val: number | null, max: number): {
  bg: string; text: string; border: string;
} {
  if (val === null) return { bg: '#2e2719', text: '#9a8a6a', border: '#4a3e28' };
  const p = val / max;
  if (p >= 0.51) return { bg: '#1a3322', text: '#6abf7e', border: '#4a7c59' };
  if (p >= 0.36) return { bg: '#3a2a05', text: '#f0c030', border: '#b8860b' };
  return { bg: '#3a1515', text: '#e05c5c', border: '#8b3a3a' };
}