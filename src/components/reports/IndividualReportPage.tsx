// src/components/reports/IndividualReportPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calcTotal, calcProm, countAtt } from '../../utils/calculations';
import { TRIM_LABELS } from '../../utils/constants';
import { ScoreBadge } from '../common/Badge';
import type { TrimesterNumber } from '../../types/index';

export function IndividualReportPage() {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!course) return null;

  const trims = [1, 2, 3] as TrimesterNumber[];
  const selected = selectedIdx !== null ? course.students[selectedIdx] : null;

  const trimSection = (t: TrimesterNumber) => {
    if (selectedIdx === null) return null;
    const pS = calcProm(course, t, selectedIdx, 'ser');
    const pSb = calcProm(course, t, selectedIdx, 'saber');
    const pH = calcProm(course, t, selectedIdx, 'hacer');
    const tot = calcTotal(course, t, selectedIdx);
    const p = countAtt(course, t, selectedIdx, 'P');
    const f = countAtt(course, t, selectedIdx, 'F');
    const l = countAtt(course, t, selectedIdx, 'L');
    const r = countAtt(course, t, selectedIdx, 'R');
    const obs = (course.observations[t] ?? {})[selectedIdx] ?? '';

    return (
      <div key={t} className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--gold-bright)' }}>
          {TRIM_LABELS[t]}° Trimestre
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'SER', val: pS, max: 10, color: 'var(--ser-c)' },
            { label: 'SABER', val: pSb, max: 45, color: 'var(--saber-c)' },
            { label: 'HACER', val: pH, max: 40, color: 'var(--hacer-c)' },
            { label: 'TOTAL', val: tot, max: 100, color: 'var(--gold-bright)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.label}</div>
              <ScoreBadge value={item.val} max={item.max} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', marginBottom: obs ? 10 : 0 }}>
          <span>✅ Presencias: <strong style={{ color: 'var(--success-bright)' }}>{p}</strong></span>
          <span>❌ Faltas: <strong style={{ color: f > 3 ? 'var(--danger-bright)' : 'var(--text)' }}>{f}</strong></span>
          <span>📋 Licencias: <strong>{l}</strong></span>
          <span>⏰ Retrasos: <strong>{r}</strong></span>
        </div>
        {obs && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--ser-bg)', borderLeft: '3px solid var(--ser-c)', borderRadius: 6, fontSize: 12, color: 'var(--text)', fontStyle: 'italic' }}>
            {obs}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            👤 Informe Individual — {course.meta.curso}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Ficha completa por estudiante</div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            if (selectedIdx === null) return;
            window.print();
          }}
          style={{ opacity: selectedIdx === null ? .4 : 1 }}
        >
          🖨️ Imprimir
        </button>
      </div>

      <select
        value={selectedIdx ?? ''}
        onChange={e => setSelectedIdx(e.target.value === '' ? null : parseInt(e.target.value))}
        style={{
          width: '100%', maxWidth: 400, padding: '10px 12px',
          border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
          color: 'var(--text)', background: 'var(--card2)', cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        <option value="">— Seleccionar estudiante —</option>
        {course.students.map((st, i) => (
          <option key={i} value={i}>{st.nro}. {st.nombre}</option>
        ))}
      </select>

      {selected && selectedIdx !== null && (
        <div>
          {/* Header alumno */}
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--gold),var(--amber))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#1a1610', flexShrink: 0,
            }}>
              {selected.nombre.split(' ').slice(0,2).map(w => w[0]).join('')}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
                {selected.nombre}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                N° {selected.nro} · {selected.sexo === 'F' ? 'Femenino' : 'Masculino'} · Docente: {course.meta.docente}
              </div>
            </div>
          </div>

          {/* Trimestres */}
          {trims.map(t => trimSection(t))}

          {/* Seguimiento */}
          {(() => {
            const seg = (course.seguimiento ?? []).filter(o => o.idx === selectedIdx).sort((a,b) => b.ts - a.ts).slice(0, 10);
            if (!seg.length) return null;
            return (
              <div className="card">
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>✍️ Seguimiento ({seg.length})</div>
                {seg.map(o => (
                  <div key={o.ts} style={{
                    display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 8, marginBottom: 6,
                    background: o.tipo === 'pos' ? 'var(--success-l)' : 'var(--danger-l)',
                    border: `1px solid ${o.tipo === 'pos' ? 'var(--success)' : 'var(--danger)'}`,
                  }}>
                    <span>{o.tipo === 'pos' ? '✅' : '⚠️'}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{o.texto}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(o.ts).toLocaleDateString('es-BO')}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {selectedIdx === null && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 14 }}>Selecciona un estudiante para ver su ficha</div>
        </div>
      )}
    </div>
  );
}