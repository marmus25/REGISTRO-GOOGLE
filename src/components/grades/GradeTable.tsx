// src/components/grades/GradeTable.tsx
import { useAppStore } from '../../store/useAppStore';
import { calcProm, calcTotal, avgAct, avgDim, getScoreColor } from '../../utils/calculations';
import { DIM_CONFIG } from '../../utils/constants';
import { useGradeTableKeyNav } from '../../hooks/useKeyboardNav';
import type { TrimesterNumber, GradeDimension } from '../../types/index';

interface Props {
  trim: TrimesterNumber;
  dim: GradeDimension | 'auto' | 'total';
}

export function GradeTable({ trim, dim }: Props) {
  useGradeTableKeyNav();
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const setGrade = useAppStore(s => s.setGrade);
  const setAuto = useAppStore(s => s.setAuto);
  const autofillDim = useAppStore(s => s.autofillDim);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const showToast = useAppStore(s => s.showToast);

  if (!course) return null;

  const isAuto = dim === 'auto';
  const isTotal = dim === 'total';

  if (isTotal) {
    return (
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'var(--dark)', color: 'white', padding: 10, textAlign: 'left', minWidth: 150, zIndex: 3, fontSize: 12, borderRight: '2px solid var(--border)' }}>RESUMEN</th>
              {['SER /10', 'SABER /45', 'HACER /40', 'AUTO /5', 'TOTAL /100'].map((h, i) => (
                <th key={i} style={{ padding: '8px 6px', textAlign: 'center', fontSize: 11, fontWeight: 800, color: ['var(--ser-c)', 'var(--saber-c)', 'var(--hacer-c)', 'var(--auto-c)', 'var(--gold-bright)'][i], background: ['var(--ser-bg)', 'var(--saber-bg)', 'var(--hacer-bg)', 'var(--auto-bg)', 'var(--dark)'][i] }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {course.students.filter(s => !s.oculto).map(st => {
              const i = course.students.indexOf(st);
              const pS = calcProm(course, trim, i, 'ser');
              const pSb = calcProm(course, trim, i, 'saber');
              const pH = calcProm(course, trim, i, 'hacer');
              const auto = course.grades[trim][i]?.auto ?? null;
              const tot = calcTotal(course, trim, i);
              const cell = (val: number | null, max: number) => {
                const c = getScoreColor(val, max);
                return <td style={{ textAlign: 'center', padding: '6px 4px', fontSize: 14, fontWeight: 700, background: c.bg, color: c.text, border: '1px solid var(--border)' }}>{val !== null ? val : '—'}</td>;
              };
              return (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', minWidth: 150, fontSize: 12, fontWeight: 700, position: 'sticky', left: 0, background: 'var(--card)', zIndex: 2, borderRight: '2px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{st.nro}</div>
                    {st.nombre}
                  </td>
                  {cell(pS, 10)}{cell(pSb, 45)}{cell(pH, 40)}{cell(auto, 5)}
                  <td style={{ position: 'sticky', right: 0, textAlign: 'center', fontSize: 18, fontWeight: 800, background: getScoreColor(tot, 100).bg, color: getScoreColor(tot, 100).text, borderLeft: '2px solid var(--border)', padding: '6px 8px', zIndex: 2, minWidth: 56 }}>
                    {tot !== null ? Math.round(tot) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const cfg = isAuto
    ? { label: 'AUTO', max: 5, color: 'var(--auto-c)', bg: 'var(--auto-bg)' }
    : DIM_CONFIG[dim as GradeDimension];
  const acts = isAuto ? ['Auto'] : course.activities[trim][dim as GradeDimension];

  const handleAutofill = (actIdx: number) => {
    let val = '';
    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          Rellenar vacios — {acts[actIdx]}
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Valor para casillas vacias (0-{cfg.max}):
        </p>
        <input
          type="number"
          min={0}
          max={cfg.max}
          onChange={e => val = e.target.value}
          style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 16, marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-gold btn-sm" onClick={() => {
            const n = parseInt(val);
            if (isNaN(n) || n < 0 || n > cfg.max) { showToast('Valor invalido', 'err'); return; }
            autofillDim(courseId, trim, dim as GradeDimension, actIdx, n);
            closeModal();
            showToast('Casillas rellenas', 'ok');
          }}>Rellenar</button>
        </div>
      </div>
    );
  };

  const classAvg = isAuto
    ? (() => { const vals = course.students.map((_, i) => course.grades[trim][i]?.auto).filter((v): v is number => v !== null); return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null; })()
    : null;

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: 'var(--card2)' }}>
            <th style={{ position: 'sticky', left: 0, background: 'var(--dark)', color: 'white', padding: 10, textAlign: 'left', minWidth: 150, zIndex: 3, fontSize: 12, borderRight: '2px solid var(--border)' }}>
              {cfg.label}
            </th>
            {acts.map((a, ai) => (
              <th key={ai} style={{ minWidth: 52, background: cfg.bg, color: cfg.color, fontSize: 10, padding: '6px 4px', textAlign: 'center', maxWidth: 64 }}>
                {a.length > 6 ? a.slice(0, 6) + '…' : a}
                <br />
                <span style={{ fontSize: 9, opacity: .7 }}>{cfg.max}p</span>
                <br />
                <button
                  onClick={() => handleAutofill(ai)}
                  style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', borderRadius: 4, color: 'inherit', fontSize: 9, padding: '1px 5px', cursor: 'pointer', marginTop: 2 }}
                >
                  ✦
                </button>
              </th>
            ))}
            <th style={{ position: 'sticky', right: 0, background: cfg.bg, color: cfg.color, minWidth: 52, textAlign: 'center', fontSize: 11, fontWeight: 800, padding: '8px 4px', borderLeft: `2px solid ${cfg.color}`, zIndex: 3 }}>
              PROM
            </th>
          </tr>
          <tr style={{ background: 'var(--card2)', borderBottom: '2px solid var(--border)' }}>
            <td style={{ position: 'sticky', left: 0, background: 'var(--card2)', padding: '6px 10px', fontSize: 11, color: 'var(--muted)', fontWeight: 700, borderRight: '2px solid var(--border)', zIndex: 2 }}>
              Prom. clase
            </td>
            {acts.map((_, ai) => {
              const avg = isAuto ? classAvg : avgAct(course, trim, dim as GradeDimension, ai);
              return (
                <td key={ai} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '6px 4px' }}>
                  {avg !== null ? avg : '—'}
                </td>
              );
            })}
            <td style={{ position: 'sticky', right: 0, textAlign: 'center', fontSize: 13, fontWeight: 800, background: 'var(--card2)', borderLeft: `2px solid var(--border)`, padding: '6px 4px', zIndex: 2 }}>
              {isAuto ? classAvg ?? '—' : (avgDim(course, trim, dim as GradeDimension) ?? '—')}
            </td>
          </tr>
        </thead>
        <tbody>
          {course.students.filter(s => !s.oculto).map(st => {
            const i = course.students.indexOf(st);
            const g = course.grades[trim][i] ?? { ser: [], saber: [], hacer: [], auto: null };
            const prom = isAuto ? g.auto : calcProm(course, trim, i, dim as GradeDimension);
            const pc = getScoreColor(prom, cfg.max);

            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', minWidth: 150, fontSize: 12, fontWeight: 700, position: 'sticky', left: 0, background: 'var(--card)', zIndex: 2, borderRight: '2px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{st.nro}</div>
                  {st.nombre.split(' ').slice(0, 2).join(' ')}
                </td>
                {acts.map((_, ai) => {
                  const val = isAuto ? g.auto : (g[dim as GradeDimension] as (number | null)[])[ai];
                  return (
                    <td key={ai} style={{ padding: '4px 3px', textAlign: 'center' }}>
                      <input
                        type="number"
                        className="score-inp"
                        inputMode="numeric"
                        min={0}
                        max={cfg.max}
                        value={val !== null && val !== undefined ? val : ''}
                        placeholder="—"
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          const n = e.target.value === '' ? null : Math.min(cfg.max, Math.max(0, parseInt(e.target.value)));
                          if (isAuto) setAuto(courseId, trim, i, n);
                          else setGrade(courseId, trim, i, dim as GradeDimension, ai, n);
                        }}
                      />
                    </td>
                  );
                })}
                <td id={`prom-${trim}-${dim}-${i}`} style={{ position: 'sticky', right: 0, minWidth: 52, textAlign: 'center', background: pc.bg, color: pc.text, borderLeft: `2px solid ${pc.border}`, fontSize: 16, fontWeight: 800, padding: '4px 6px', zIndex: 2 }}>
                  {prom !== null ? prom : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}