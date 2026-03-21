import * as XLSX from 'xlsx';
import type { CourseData, Student, GradeEntry, TrimesterNumber } from '../types/index';

/**
 * Obtiene el valor de una celda específica de forma segura.
 */
function getCellVal(ws: XLSX.WorkSheet, row: number, col: number): string | number | null {
  const addr = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
  const cell = ws[addr];
  if (!cell) return null;
  return cell.v !== undefined ? cell.v : (cell.w ?? null);
}

/**
 * Define las etiquetas de actividades por defecto.
 */
function defActivities(): CourseData['activities'] {
  const defActs = (n: number) => Array.from({ length: n }, (_, i) => `Act.${i + 1}`);
  return {
    1: { ser: defActs(3), saber: defActs(8), hacer: defActs(8) },
    2: { ser: defActs(3), saber: defActs(8), hacer: defActs(8) },
    3: { ser: defActs(3), saber: defActs(8), hacer: defActs(8) },
  };
}

/**
 * Inicializa el objeto de calificaciones vacío para el número de estudiantes dado.
 */
function defGrades(studentCount: number): CourseData['grades'] {
  const empty = (): GradeEntry => ({ ser: [], saber: [], hacer: [], auto: null });
  const trimGrades = () => Object.fromEntries(
    Array.from({ length: studentCount }, (_, i) => [i, empty()])
  );
  return { 1: trimGrades(), 2: trimGrades(), 3: trimGrades() };
}

/**
 * Procesa el archivo Excel y extrae la información de Filiación y Parámetros.
 */
export async function parseXLSXFile(file: File): Promise<{ courseId: string; data: CourseData }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dataBuffer = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(dataBuffer, { type: 'array' });
        
        const wsP = wb.Sheets['parametros'];
        const wsF = wb.Sheets['Filiacion'];

        // Extracción de metadatos desde 'parametros'
        const curso = wsP ? String(getCellVal(wsP, 2, 3) ?? file.name.replace('.xlsx', '')) : file.name.replace('.xlsx', '');
        const docente = wsP ? String(getCellVal(wsP, 3, 3) ?? '') : '';
        const area = wsP ? String(getCellVal(wsP, 4, 3) ?? 'EDUCACION MUSICAL') : 'EDUCACION MUSICAL';
        const courseId = curso.trim().replace(/\s+/g, '_');

        const students: Student[] = [];
        if (wsF) {
          // Lógica específica para el formato oficial (Filas 9 a 60)
          for (let r = 9; r <= 60; r++) {
            const nro = getCellVal(wsF, r, 2);
            const nombre = getCellVal(wsF, r, 3);
            const sexo = getCellVal(wsF, r, 6);
            if (nro && nombre) {
              students.push({
                nro: Number(nro),
                nombre: String(nombre).trim(),
                sexo: String(sexo ?? ''),
              });
            }
          }
        }

        const data: CourseData = {
          meta: {
            courseId,
            curso: curso.trim(),
            docente: docente.trim(),
            area: area.trim(),
            fileName: file.name,
            loadedAt: new Date().toISOString(),
          },
          students,
          attendance: { 1: {}, 2: {}, 3: {} },
          grades: defGrades(students.length),
          activities: defActivities(),
          observations: { 1: {}, 2: {}, 3: {} },
          seguimiento: [],
        };

        resolve({ courseId, data });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Error procesando el archivo Excel'));
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo del disco'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Combina datos existentes con un nuevo archivo Excel sin perder calificaciones previas.
 */
export function mergeCourseData(existing: CourseData, fresh: CourseData): CourseData {
  const oldMap: Record<string, number> = {};
  existing.students.forEach((st, i) => {
    oldMap[st.nombre.trim().toUpperCase()] = i;
  });

  const newG: CourseData['grades'] = { 1: {}, 2: {}, 3: {} };
  const newO: CourseData['observations'] = { 1: {}, 2: {}, 3: {} };
  const newA: CourseData['attendance'] = { 1: {}, 2: {}, 3: {} };

  fresh.students.forEach((st, ni) => {
    const key = st.nombre.trim().toUpperCase();
    const oi = oldMap[key];
    
    if (oi !== undefined) {
      ([1, 2, 3] as TrimesterNumber[]).forEach(t => {
        newG[t][ni] = existing.grades[t][oi] ?? { ser: [], saber: [], hacer: [], auto: null };
        if (existing.observations[t][oi]) newO[t][ni] = existing.observations[t][oi];
        
        Object.keys(existing.attendance[t]).forEach(d => {
          if (!newA[t][d]) newA[t][d] = {};
          if (existing.attendance[t][d][oi] !== undefined) {
            newA[t][d][ni] = existing.attendance[t][d][oi];
          }
        });
      });
    } else {
      ([1, 2, 3] as TrimesterNumber[]).forEach(t => {
        newG[t][ni] = { ser: [], saber: [], hacer: [], auto: null };
      });
    }
  });

  return {
    ...fresh,
    grades: newG,
    observations: newO,
    attendance: newA,
    seguimiento: existing.seguimiento,
    activities: existing.activities,
    meta: { ...fresh.meta, lastMerge: new Date().toISOString() },
  };
}