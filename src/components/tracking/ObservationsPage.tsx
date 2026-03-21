// src/components/tracking/ObservationsPage.tsx
import { useAppStore } from '../../store/useAppStore';
import { TRIM_LABELS } from '../../utils/constants';
import { exportObsPDF } from '../../utils/exportPDF';
import type { TrimesterNumber } from '../../types/index';

interface Props { trim: TrimesterNumber; }

export function ObservationsPage({ trim }: Props) {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const setObservation = useAppStore(s => s.setObservation);

  if (!course) return null;

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            💬 Observaciones — {TRIM_LABELS[trim]} Trim · {course.meta.curso}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            Observacion libre por estudiante
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => exportObsPDF(course)}>
          📄 Exportar PDF
        </button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border2)', background: 'var(--card)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1a1610' }}>
              <th style={{ padding: 10, fontSize: 12, fontWeight: 800, color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)', textAlign: 'center', width: 40 }}>#</th>
              <th style={{ padding: 10, fontSize: 12, fontWeight: 800, color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)', textAlign: 'left', width: 200 }}>Estudiante</th>
              <th style={{ padding: 10, fontSize: 12, fontWeight: 800, color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)', textAlign: 'left' }}>Observacion</th>
            </tr>
          </thead>
          <tbody>
            {course.students.filter(s => !s.oculto).map(st => {
              const i = course.students.indexOf(st);
              const obs = (course.observations[trim] ?? {})[i] ?? '';
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                    {st.nro}
                  </td>
                  <td style={{ padding: '7px 12px', fontWeight: 700 }}>
                    {st.nombre}
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <textarea
                      defaultValue={obs}
                      onBlur={e => setObservation(courseId, trim, i, e.target.value)}
                      placeholder="Sin observacion..."
                      rows={2}
                      style={{
                        width: '100%', border: 'none',
                        background: 'transparent',
                        fontFamily: 'var(--font)', fontSize: 12,
                        padding: 4, resize: 'none',
                        minHeight: 34, color: 'var(--text)',
                        outline: 'none',
                      }}
                      onFocus={e => { e.target.style.outline = '2px solid var(--gold)'; }}
                      onBlurCapture={e => { e.target.style.outline = 'none'; }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}