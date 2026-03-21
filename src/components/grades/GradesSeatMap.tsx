// src/components/grades/GradesSeatMap.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calcProm, getVGBLevel } from '../../utils/calculations';
import { VGB_LEVELS, DIM_CONFIG } from '../../utils/constants';
import { GradeInputPopup } from './GradeInputPopup.tsx';
import type { TrimesterNumber, GradeDimension } from '../../types/index';

interface Props { trim: TrimesterNumber; }
type MapDim = GradeDimension | 'auto';

export function GradesSeatMap({ trim }: Props) {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const [dim, setDim] = useState<MapDim>('ser');
  const [actIdx, setActIdx] = useState<number>(-1);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStudentIdx, setPopupStudentIdx] = useState(0);

  if (!course) return null;

  const cfg = dim === 'auto'
    ? { label: 'AUTO', max: 5, color: 'var(--auto-c)', bg: 'var(--auto-bg)' }
    : DIM_CONFIG[dim];

  const acts = dim === 'auto' ? ['Auto'] : course.activities[trim][dim];

  const getVal = (i: number): number | null => {
    const g = course.grades[trim][i];
    if (!g) return null;
    if (dim === 'auto') return g.auto;
    if (actIdx === -1) return calcProm(course, trim, i, dim);
    return (g[dim] as (number | null)[])[actIdx] ?? null;
  };

  const students = course.students.filter(s => !s.oculto);

  return (
    <div>
      {/* Dim tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content', marginBottom: 10 }}>
        {(['ser', 'saber', 'hacer', 'auto'] as MapDim[]).map(d => (
          <button
            key={d}
            className={`tab ${dim === d ? 'active' : ''}`}
            onClick={() => { setDim(d); setActIdx(-1); }}
          >
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Act tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          className={`btn btn-sm ${actIdx === -1 ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActIdx(-1)}
        >
          Promedio
        </button>
        {acts.map((a, ai) => (
          <button
            key={ai}
            className={`btn btn-sm ${actIdx === ai ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setActIdx(ai)}
          >
            {a.length > 8 ? a.slice(0, 8) + '…' : a}
          </button>
        ))}
      </div>

      {/* Label */}
      <div style={{
        background: 'var(--dark)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '6px 20px', textAlign: 'center',
        fontSize: 11, fontWeight: 800, letterSpacing: 2,
        marginBottom: 12, color: cfg.color,
      }}>
        {cfg.label} — {actIdx === -1 ? 'Promedio' : acts[actIdx]}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10, marginBottom: 80 }}>
        {students.map(st => {
          const i = course.students.indexOf(st);
          const val = getVal(i);
          const level = getVGBLevel(val, cfg.max);
          const colors = level >= 0 ? VGB_LEVELS[level] : { bg: 'var(--card2)', text: 'var(--muted)', border: 'var(--border2)' };
          const apellido = st.nombre.split(' ')[0];
          const editable = actIdx !== -1;

          return (
            <div
              key={i}
              onClick={() => {
                if (!editable) return;
                setPopupStudentIdx(i);
                setPopupOpen(true);
              }}
              style={{
                borderRadius: 10,
                border: `2px solid ${colors.border}`,
                background: colors.bg,
                padding: '10px 4px',
                textAlign: 'center',
                cursor: editable ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
                userSelect: 'none', transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700 }}>{st.nro}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{apellido}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: colors.text }}>{val !== null ? val : '—'}</div>
            </div>
          );
        })}
      </div>

      {/* Popup */}
      {popupOpen && actIdx !== -1 && (
        <GradeInputPopup
          trim={trim}
          dim={dim}
          actIdx={actIdx}
          actLabel={acts[actIdx]}
          max={cfg.max}
          initialStudentIdx={popupStudentIdx}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
}