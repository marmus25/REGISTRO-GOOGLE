import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calcProm, calcTotal, avgAct, avgDim, getVGBLevel } from '../../utils/calculations';
import { VGB_LEVELS, TRIM_LABELS } from '../../utils/constants';
import type { TrimesterNumber, GradeDimension } from '../../types/index';

interface Props { trim: TrimesterNumber; }

export function VisualGradebook({ trim: initialTrim }: Props) {
  const [trim, setTrim] = useState<TrimesterNumber>(initialTrim);
  const [fullscreen, setFullscreen] = useState(false);
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const setGrade = useAppStore(s => s.setGrade);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!course) return null;

  const dims: GradeDimension[] = ['ser', 'saber', 'hacer'];
  const dimCfg = {
    ser:   { color: 'var(--ser-c)',   bg: 'var(--ser-bg)',   max: 10 },
    saber: { color: 'var(--saber-c)', bg: 'var(--saber-bg)', max: 45 },
    hacer: { color: 'var(--hacer-c)', bg: 'var(--hacer-bg)', max: 40 },
  };

  const cellStyle = (val: number | null, max: number) => {
    const level = getVGBLevel(val, max);
    const c = level >= 0 ? VGB_LEVELS[level] : { bg: 'var(--card2)', text: 'var(--muted)', border: 'var(--border)' };
    return { background: c.bg, color: c.text, border: `1px solid ${c.border}` };
  };

  const content = (
    <div style={{ overflowX: 'auto' }}>
      {/* Trim selector in fullscreen */}
      {fullscreen && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          {([1, 2, 3] as TrimesterNumber[]).map(t => (
            <button
              key={t}
              className={`tab ${trim === t ? 'active' : ''}`}
              onClick={() => setTrim(t)}
            >
              {TRIM_LABELS[t]}°
            </button>
          ))}
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setFullscreen(false)}>
            ✕ Cerrar
          </button>
        </div>
      )}

      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{
              position: 'sticky', left: 0, background: 'var(--dark)', color: 'white',
              padding: '10px', textAlign: 'left', minWidth: 160, zIndex: 3,
              borderRight: '2px solid var(--border)', fontSize: 12,
            }}>
              # Apellidos y Nombres
            </th>
            {dims.map(d => {
              const acts = course.activities[trim][d];
              const cfg = dimCfg[d];
              return [
                ...acts.map((a, ai) => (
                  <th key={`${d}-${ai}`} style={{
                    background: cfg.bg, color: cfg.color,
                    padding: '6px 4px', textAlign: 'center',
                    fontSize: 10, fontWeight: 800, minWidth: 48,
                  }}>
                    {a.length > 6 ? a.slice(0, 6) + '…' : a}
                    <div style={{ fontSize: 8, opacity: .7 }}>{d.toUpperCase()} /{cfg.max}</div>
                  </th>
                )),
                <th key={`${d}-prom`} style={{
                  background: cfg.bg, color: cfg.color,
                  padding: '6px 4px', textAlign: 'center',
                  fontSize: 10, fontWeight: 900, minWidth: 52,
                  borderLeft: `2px solid ${cfg.color}`,
                }}>
                  Prom<br />{d.toUpperCase()}
                </th>
              ];
            })}
            <th style={{
              position: 'sticky', right: 0, background: 'var(--dark)', color: 'var(--gold-bright)',
              padding: '8px 6px', textAlign: 'center', fontSize: 11, zIndex: 3,
              borderLeft: '2px solid var(--border)', minWidth: 56,
            }}>
              TOTAL<br />/100
            </th>
          </tr>
          {/* Avg row */}
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <td style={{
              position: 'sticky', left: 0, background: 'var(--card2)',
              padding: '6px 10px', fontSize: 11, color: 'var(--muted)',
              fontWeight: 700, borderRight: '2px solid var(--border)', zIndex: 2,
            }}>
              Prom. clase
            </td>
            {dims.map(d => {
              const acts = course.activities[trim][d];
              const cfg = dimCfg[d];
              return [
                ...acts.map((_, ai) => {
                  const avg = avgAct(course, trim, d, ai);
                  const s = cellStyle(avg, cfg.max);
                  return (
                    <td key={`avg-${d}-${ai}`} style={{ ...s, padding: 2, textAlign: 'center', fontSize: 11, fontWeight: 800, borderRadius: 6 }}>
                      {avg !== null ? Math.round(avg) : '—'}
                    </td>
                  );
                }),
                <td key={`avg-${d}-prom`} style={{
                  textAlign: 'center', fontSize: 12, fontWeight: 900,
                  color: 'white', background: ['#1e40af', '#6d28d9', '#15803d'][dims.indexOf(d)],
                  borderRadius: 6, padding: 2,
                }}>
                  {avgDim(course, trim, d) !== null ? Math.round(avgDim(course, trim, d)!) : '—'}
                </td>
              ];
            })}
            <td style={{ position: 'sticky', right: 0, background: 'var(--card2)', zIndex: 2 }} />
          </tr>
        </thead>
        <tbody>
          {course.students.filter(s => !s.oculto).map(st => {
            const i = course.students.indexOf(st);
            const tot = calcTotal(course, trim, i);
            const totStyle = cellStyle(tot, 100);
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{
                  padding: '6px 10px', minWidth: 160, fontSize: 12, fontWeight: 700,
                  position: 'sticky', left: 0, background: 'var(--card)', zIndex: 2,
                  borderRight: '2px solid var(--border)',
                }}>
                  {st.nro}. {st.nombre}
                </td>
                {dims.map(d => {
                  const acts = course.activities[trim][d];
                  const cfg = dimCfg[d];
                  const g = course.grades[trim][i] ?? { ser: [], saber: [], hacer: [], auto: null };
                  const prom = calcProm(course, trim, i, d);
                  return [
                    ...acts.map((_, ai) => {
                      const val = (g[d] as (number | null)[])[ai] ?? null;
                      const s = cellStyle(val, cfg.max);
                      return (
                        <td key={`${d}-${ai}`} style={{ padding: '2px 3px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min={0}
                            max={cfg.max}
                            value={val !== null ? val : ''}
                            placeholder="—"
                            onFocus={e => e.target.select()}
                            onChange={e => {
                              const n = e.target.value === '' ? null : Math.min(cfg.max, Math.max(0, parseInt(e.target.value)));
                              setGrade(courseId, trim, i, d, ai, n);
                            }}
                            style={{
                              width: 46, height: 32,
                              border: `2px solid ${s.border}`,
                              borderRadius: 6,
                              background: s.background,
                              color: s.color,
                              textAlign: 'center',
                              fontFamily: 'var(--font)',
                              fontSize: 13, fontWeight: 800,
                              padding: 0,
                            }}
                          />
                        </td>
                      );
                    }),
                    <td key={`${d}-prom`} style={{
                      ...cellStyle(prom, cfg.max),
                      textAlign: 'center', padding: '4px 6px',
                      fontWeight: 900, fontSize: 14,
                      borderLeft: `2px solid ${dimCfg[d].color}`,
                    }}>
                      {prom !== null ? prom : '—'}
                    </td>
                  ];
                })}
                <td style={{
                  position: 'sticky', right: 0,
                  ...totStyle,
                  textAlign: 'center', fontSize: 16, fontWeight: 900,
                  borderLeft: '2px solid var(--border)',
                  padding: '4px 6px', zIndex: 2, minWidth: 56,
                }}>
                  {tot !== null ? Math.round(tot) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, padding: 8, background: 'var(--card2)', borderRadius: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Nivel:</span>
        {VGB_LEVELS.map((l, i) => (
          <span key={i} style={{
            padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800,
            background: l.bg, color: l.text, border: `2px solid ${l.border}`,
          }}>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setFullscreen(true)}>
          ⛶ Pantalla completa
        </button>
      </div>

      {content}

      {fullscreen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'var(--bg)',
          zIndex: 500, padding: 20,
          overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900,
            color: 'var(--text)', marginBottom: 12,
          }}>
            🎨 {course.meta.curso} — {TRIM_LABELS[trim]}° Trimestre · Vista Visual
          </div>
          {content}
        </div>
      )}
    </>
  );
}