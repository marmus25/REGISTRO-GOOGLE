// src/utils/xlsxExporter.ts
import * as XLSX from 'xlsx';
import type { CourseData, TrimesterNumber } from '../types/index';
import { calcProm, calcTotal } from './calculations';
import { TRIM_LABELS } from './constants';

function writeTrimestreToSheet(
  course: CourseData,
  trim: TrimesterNumber
): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: 0, c: 27 } };

  course.students.forEach((st, i) => {
    const rowIdx = 8 + i;
    if (rowIdx > range.e.r) range.e.r = rowIdx;

    const g = course.grades[trim][i] ?? { ser: [], saber: [], hacer: [], auto: null };

    // SER cols 4,5,6 (índice 3,4,5)
    g.ser.forEach((val, ai) => {
      if (val !== null) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c: 3 + ai });
        ws[addr] = { v: val, t: 'n' };
      }
    });

    // SABER cols 8-15 (índice 7-14)
    g.saber.forEach((val, ai) => {
      if (val !== null) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c: 7 + ai });
        ws[addr] = { v: val, t: 'n' };
      }
    });

    // HACER cols 17-24 (índice 16-23)
    g.hacer.forEach((val, ai) => {
      if (val !== null) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c: 16 + ai });
        ws[addr] = { v: val, t: 'n' };
      }
    });

    // AUTO col 26 (índice 25)
    if (g.auto !== null) {
      ws[XLSX.utils.encode_cell({ r: rowIdx, c: 25 })] = { v: g.auto, t: 'n' };
    }

    // PROM TOTAL col 27 (índice 26)
    const total = calcTotal(course, trim, i);
    if (total !== null) {
      ws[XLSX.utils.encode_cell({ r: rowIdx, c: 26 })] = { v: Math.round(total), t: 'n' };
    }

    // Promedios por dimensión
    const pSer = calcProm(course, trim, i, 'ser');
    const pSaber = calcProm(course, trim, i, 'saber');
    const pHacer = calcProm(course, trim, i, 'hacer');
    if (pSer !== null) ws[XLSX.utils.encode_cell({ r: rowIdx, c: 6 })] = { v: pSer, t: 'n' };
    if (pSaber !== null) ws[XLSX.utils.encode_cell({ r: rowIdx, c: 15 })] = { v: pSaber, t: 'n' };
    if (pHacer !== null) ws[XLSX.utils.encode_cell({ r: rowIdx, c: 24 })] = { v: pHacer, t: 'n' };
  });

  ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

export function exportToXLSX(
  course: CourseData,
  trim: TrimesterNumber | 'todos'
): void {
  const wb = XLSX.utils.book_new();

  if (trim === 'todos') {
    ([1, 2, 3] as TrimesterNumber[]).forEach(t => {
      const ws = writeTrimestreToSheet(course, t);
      XLSX.utils.book_append_sheet(wb, ws, `${TRIM_LABELS[t]} Trimestre`);
    });
    XLSX.writeFile(wb, `EDUCACION_MUSICAL_${course.meta.courseId}_TODOS.xlsx`);
  } else {
    const ws = writeTrimestreToSheet(course, trim);
    XLSX.utils.book_append_sheet(wb, ws, `${TRIM_LABELS[trim]} Trimestre`);
    XLSX.writeFile(wb, `EDUCACION_MUSICAL_${course.meta.courseId}_T${trim}.xlsx`);
  }
}