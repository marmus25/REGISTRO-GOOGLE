// src/components/config/ActividadesPage.tsx
import { useAppStore } from '../../store/useAppStore';
import { TRIM_LABELS, DIM_CONFIG } from '../../utils/constants';
import type { TrimesterNumber, GradeDimension } from '../../types/index';

export function ActividadesPage() {
  const appData = useAppStore(s => s.appData);
  const currentCourseId = appData.currentCourse ?? '';
  const course = appData.courses[currentCourseId];
  const setActivityName = useAppStore(s => s.setActivityName);

  if (!course) return null;

  const dims: GradeDimension[] = ['ser', 'saber', 'hacer'];

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
          ⚙️ Actividades — {course.meta.curso}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
          Personaliza los nombres de cada actividad por trimestre
        </div>
      </div>

      {([1, 2, 3] as TrimesterNumber[]).map(t => (
        <div key={t} className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--text)' }}>
            {TRIM_LABELS[t]} Trimestre
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            {dims.map(dim => {
              const cfg = DIM_CONFIG[dim];
              const acts = course.activities[t][dim];
              return (
                <div key={dim} style={{ background: cfg.bg, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: cfg.color, fontSize: 12, marginBottom: 8 }}>
                    {cfg.label} — {cfg.max} pts
                  </div>
                  {acts.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: cfg.color, fontWeight: 700, width: 16 }}>
                        {i + 1}.
                      </span>
                      <input
                        defaultValue={name}
                        placeholder={`Actividad ${i + 1}`}
                        onBlur={e => setActivityName(currentCourseId, t, dim, i, e.target.value)}
                        style={{
                          flex: 1, padding: '5px 8px',
                          border: '1px solid var(--border)',
                          borderRadius: 6, fontSize: 12,
                          fontFamily: 'var(--font)',
                          background: 'var(--card2)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}