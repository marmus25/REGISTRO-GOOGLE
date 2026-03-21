// src/components/grades/StarRating.tsx
import { useAppStore } from '../../store/useAppStore';
import { calcProm } from '../../utils/calculations';
import type { TrimesterNumber } from '../../types/index';

interface Props { trim: TrimesterNumber; }

export function StarRating({ trim }: Props) {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const setGrade = useAppStore(s => s.setGrade);
  const autofillDim = useAppStore(s => s.autofillDim);
  const showToast = useAppStore(s => s.showToast);

  if (!course) return null;

  const acts = course.activities[trim].ser;

  const handleAutofill = () => {
    const stars = parseInt(prompt('Cuantas estrellas para casillas vacias? (1-5):') ?? '');
    if (isNaN(stars) || stars < 1 || stars > 5) { showToast('Ingresa entre 1 y 5', 'err'); return; }
    acts.forEach((_, ai) => autofillDim(courseId, trim, 'ser', ai, stars * 2));
    showToast(`${stars} estrellas aplicadas`, 'ok');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ser-bg)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, color: 'var(--ser-c)', fontSize: 14 }}>⭐ SER — Estrellas</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>★ = 2 pts · max 5 estrellas = 10 pts</div>
        </div>
        <button className="btn btn-sm" style={{ background: 'var(--ser-c)', color: 'white', border: 'none' }} onClick={handleAutofill}>
          ✦ Rellenar vacios
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', background: 'var(--card)' }}>
          <tbody>
            {course.students.filter(s => !s.oculto).map(st => {
              const i = course.students.indexOf(st);
              const g = course.grades[trim][i] ?? { ser: [], saber: [], hacer: [], auto: null };
              const prom = calcProm(course, trim, i, 'ser');
              const promStars = prom !== null ? Math.round(prom / 2) : 0;

              return (
                <tr key={i} style={{ borderBottom: '2px solid var(--border)' }}>
                  <td style={{ padding: 10, minWidth: 120, position: 'sticky', left: 0, background: 'var(--card)', zIndex: 2, borderRight: '2px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{st.nro}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{st.nombre.split(' ').slice(0, 2).join(' ')}</div>
                    <div style={{ marginTop: 4, fontSize: 18, color: '#f59e0b' }}>
                      {'★'.repeat(promStars)}{'☆'.repeat(5 - promStars)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ser-c)', fontWeight: 700 }}>
                      Prom: {prom !== null ? prom : '—'}/10
                    </div>
                  </td>
                  {acts.map((actName, ai) => {
                    const val = (g.ser ?? [])[ai];
                    const stars = val !== null && val !== undefined ? Math.round(val / 2) : 0;
                    return (
                      <td key={ai} style={{ padding: '10px 6px', textAlign: 'center', minWidth: 100 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                          {actName.length > 8 ? actName.slice(0, 8) + '…' : actName}
                        </div>
                        <div style={{ fontSize: 24, cursor: 'pointer', letterSpacing: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <span
                              key={s}
                              style={{ color: s <= stars ? '#f59e0b' : '#6b7280', transition: 'color .1s' }}
                              onClick={() => setGrade(courseId, trim, i, 'ser', ai, s * 2)}
                              onMouseEnter={e => {
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent) Array.from(parent.children).forEach((child, ci) => {
                                  (child as HTMLElement).style.color = ci < s ? '#fbbf24' : '#6b7280';
                                });
                              }}
                              onMouseLeave={e => {
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent) Array.from(parent.children).forEach((child, ci) => {
                                  (child as HTMLElement).style.color = ci < stars ? '#f59e0b' : '#6b7280';
                                });
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ser-c)', marginTop: 4 }}>
                          {val !== null && val !== undefined ? `${val}/10` : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
        Toca las estrellas para calificar
      </div>
    </div>
  );
}