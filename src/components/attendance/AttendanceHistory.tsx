// src/components/attendance/AttendanceHistory.tsx
import { useAppStore } from '../../store/useAppStore';
import type { TrimesterNumber } from '../../types/index';

interface Props { trim: TrimesterNumber; }

export function AttendanceHistory({ trim }: Props) {
  const appData = useAppStore(s => s.appData);
  const deleteAttendanceDate = useAppStore(s => s.deleteAttendanceDate);
  const showToast = useAppStore(s => s.showToast);

  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  if (!course) return null;

  const dates = Object.keys(course.attendance[trim])
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();

  const chipColors: Record<string, { bg: string; color: string }> = {
    P: { bg: 'var(--success-l)', color: 'var(--success-bright)' },
    F: { bg: 'var(--danger-l)',  color: 'var(--danger-bright)'  },
    L: { bg: 'var(--warning-l)', color: 'var(--warning-bright)' },
    R: { bg: 'var(--ser-bg)',    color: 'var(--ser-c)'           },
  };

  if (!dates.length) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
        Sin fechas registradas
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
        <thead>
          <tr style={{ background: '#1a1610' }}>
            <th style={{
              padding: 10, textAlign: 'left', minWidth: 170,
              color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)',
              position: 'sticky', left: 0, background: '#1a1610', zIndex: 5,
            }}>
              Estudiante
            </th>
            {dates.map(d => (
              <th key={d} style={{
                padding: '8px 4px', fontSize: 10, fontWeight: 800,
                color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {d.slice(5)}
                <br />
                <button
                  onClick={() => {
                    if (window.confirm(`Eliminar registro del ${d}?`)) {
                      deleteAttendanceDate(courseId, trim, d);
                      showToast('Fecha eliminada', 'ok');
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--danger-bright)', cursor: 'pointer', fontSize: 11 }}
                >
                  🗑️
                </button>
              </th>
            ))}
            <th style={{ padding: 8, color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)', textAlign: 'center' }}>
              Faltas
            </th>
          </tr>
        </thead>
        <tbody>
          {course.students.filter(s => !s.oculto).map(st => {
            const idx = course.students.indexOf(st);
            const faltas = dates.filter(d => course.attendance[trim][d]?.[idx] === 'F').length;
            return (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{
                  padding: '7px 12px', fontWeight: 700,
                  position: 'sticky', left: 0,
                  background: 'var(--card)', zIndex: 2,
                  boxShadow: '4px 0 10px rgba(0,0,0,.5)',
                }}>
                  {st.nombre}
                </td>
                {dates.map(d => {
                  const v = course.attendance[trim][d]?.[idx];
                  const cfg = v ? chipColors[v] : null;
                  return (
                    <td key={d} style={{ textAlign: 'center', padding: 3 }}>
                      {cfg ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 25, height: 25, borderRadius: 5,
                          background: cfg.bg, color: cfg.color,
                          fontSize: 11, fontWeight: 800,
                        }}>
                          {v}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>·</span>
                      )}
                    </td>
                  );
                })}
                <td style={{
                  textAlign: 'center', fontWeight: 700,
                  color: faltas > 3 ? 'var(--danger-bright)' : 'var(--muted)',
                }}>
                  {faltas}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}