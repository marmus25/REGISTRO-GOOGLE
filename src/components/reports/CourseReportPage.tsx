// src/components/reports/CourseReportPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calcTotal, countAtt, calcProm, avgDim } from '../../utils/calculations';
import { TRIM_LABELS } from '../../utils/constants';
import { exportFichasCurso } from '../../utils/exportPDF';
import { ScoreBadge } from '../common/Badge';
import type { TrimesterNumber } from '../../types/index';

export function CourseReportPage() {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const showToast = useAppStore(s => s.showToast);

  if (!course) return null;

  const trims = [1, 2, 3] as TrimesterNumber[];

  const buildStats = (t: TrimesterNumber) => {
    const tots = course.students.map((_, i) => calcTotal(course, t, i)).filter((v): v is number => v !== null);
    if (!tots.length) return null;
    const avg = tots.reduce((a, b) => a + b, 0) / tots.length;
    const aprobados = tots.filter(v => v >= 51).length;
    const dist = { '>70': 0, '50-70': 0, '36-50': 0, '<36': 0 } as Record<string, number>;
    tots.forEach(v => {
      if (v > 70) dist['>70']++;
      else if (v >= 50) dist['50-70']++;
      else if (v >= 36) dist['36-50']++;
      else dist['<36']++;
    });
    return {
      avg: Math.round(avg), aprobados, reprobados: tots.length - aprobados,
      total: tots.length, dist,
      avgSer: avgDim(course, t, 'ser'),
      avgSaber: avgDim(course, t, 'saber'),
      avgHacer: avgDim(course, t, 'hacer'),
    };
  };

  const handleFichas = () => {
    const checks: Record<number, boolean> = {};
    course.students.forEach((_, i) => { checks[i] = true; });

    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          📄 Generar PDF — Fichas para Padres
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          Selecciona los estudiantes a incluir.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className="btn btn-outline btn-xs" onClick={() => {
            document.querySelectorAll<HTMLInputElement>('.st-check').forEach(c => c.checked = true);
          }}>✅ Todos</button>
          <button className="btn btn-outline btn-xs" onClick={() => {
            document.querySelectorAll<HTMLInputElement>('.st-check').forEach(c => c.checked = false);
          }}>☐ Ninguno</button>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          {course.students.map((st, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              <input type="checkbox" className="st-check" data-idx={i} defaultChecked style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{st.nro}. {st.nombre}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{st.sexo}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-gold btn-sm" onClick={() => {
            const selected = Array.from(document.querySelectorAll<HTMLInputElement>('.st-check'))
              .filter(c => c.checked)
              .map(c => parseInt(c.dataset.idx ?? '0'));
            if (!selected.length) { showToast('Selecciona al menos uno', 'err'); return; }
            closeModal();
            exportFichasCurso(course, selected);
            showToast(`PDF generado: ${selected.length} fichas`, 'ok');
          }}>📄 Generar PDF</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            📈 Informe del Curso — {course.meta.curso}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {course.meta.area} · {course.students.length} estudiantes
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Imprimir</button>
          <button className="btn btn-gold btn-sm" onClick={handleFichas}>📄 PDF fichas para padres</button>
        </div>
      </div>

      {/* Cards por trimestre */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginBottom: 20 }}>
        {trims.map(t => {
          const s = buildStats(t);
          if (!s) return (
            <div key={t} className="card">
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{TRIM_LABELS[t]}° Trimestre</div>
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>Sin calificaciones</p>
            </div>
          );

          const pct = (v: number | null, max: number) => v !== null ? Math.round(v / max * 100) : 0;
          const barColor = (dim: string) => ({ ser: 'var(--ser-c)', saber: 'var(--saber-c)', hacer: 'var(--hacer-c)' })[dim] ?? 'var(--gold)';

          return (
            <div key={t} className="card">
              <div style={{ background: 'linear-gradient(135deg,var(--ser-bg),var(--saber-bg))', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{TRIM_LABELS[t]}° Trimestre</div>
                <div style={{ fontSize: 28, fontWeight: 900, margin: '4px 0', color: 'var(--gold-bright)' }}>
                  {s.avg}<span style={{ fontSize: 14 }}>/100</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {s.aprobados}/{s.total} aprobados · {s.reprobados} reprobados
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: 'var(--muted)' }}>PROMEDIOS POR DIMENSION</div>
              {[
                { dim: 'ser', val: s.avgSer, max: 10 },
                { dim: 'saber', val: s.avgSaber, max: 45 },
                { dim: 'hacer', val: s.avgHacer, max: 40 },
              ].map(({ dim, val, max }) => val !== null && (
                <div key={dim} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: barColor(dim), fontWeight: 700 }}>{dim.toUpperCase()}</span>
                    <span>{Math.round(val)}/{max} ({pct(val, max)}%)</span>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct(val, max)}%`, height: '100%', background: barColor(dim), borderRadius: 4, transition: 'width .5s' }} />
                  </div>
                </div>
              ))}

              <div style={{ fontWeight: 700, fontSize: 12, margin: '12px 0 8px', color: 'var(--muted)' }}>DISTRIBUCION</div>
              {Object.entries(s.dist).map(([rng, n]) => {
                const pctN = s.total ? Math.round(n / s.total * 100) : 0;
                const bg = rng === '>70' ? 'var(--success)' : rng === '50-70' ? 'var(--ser-c)' : rng === '36-50' ? 'var(--warning)' : 'var(--danger)';
                return (
                  <div key={rng} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 40, fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>{rng}</div>
                    <div style={{ flex: 1, background: 'var(--card2)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                      <div style={{ width: `${pctN}%`, height: '100%', background: bg, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 4, fontSize: 10, color: 'white', fontWeight: 700 }}>
                        {pctN > 8 ? `${pctN}%` : ''}
                      </div>
                    </div>
                    <div style={{ width: 20, fontSize: 11, fontWeight: 700 }}>{n}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Tabla bajo rendimiento */}
      <div className="card">
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
          📋 Estudiantes con bajo rendimiento (Total &lt; 36)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1a1610' }}>
                {['#', 'Estudiante', 'T1', 'T2', 'T3', 'Faltas'].map((h, i) => (
                  <th key={i} style={{ padding: 10, fontSize: 12, fontWeight: 800, color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)', textAlign: i <= 1 ? 'left' : 'center' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const rows = course.students.map((st, i) => {
                  const p1 = calcTotal(course, 1, i);
                  const p2 = calcTotal(course, 2, i);
                  const p3 = calcTotal(course, 3, i);
                  const faltas = trims.reduce((a, t) => a + countAtt(course, t, i, 'F'), 0);
                  const enRiesgo = (p1 !== null && p1 < 36) || (p2 !== null && p2 < 36) || (p3 !== null && p3 < 36) || faltas > 8;
                  if (!enRiesgo) return null;
                  return (
                    <tr key={i} style={{ background: 'var(--danger-l)', borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>{st.nro}</td>
                      <td style={{ padding: '7px 12px', fontWeight: 700 }}>{st.nombre}</td>
                      <td style={{ textAlign: 'center', padding: '4px 6px' }}><ScoreBadge value={p1} max={100} /></td>
                      <td style={{ textAlign: 'center', padding: '4px 6px' }}><ScoreBadge value={p2} max={100} /></td>
                      <td style={{ textAlign: 'center', padding: '4px 6px' }}><ScoreBadge value={p3} max={100} /></td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: faltas > 8 ? 'var(--danger-bright)' : 'var(--text)' }}>{faltas}</td>
                    </tr>
                  );
                }).filter(Boolean);
                return rows.length ? rows : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
                      Sin estudiantes en riesgo
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}