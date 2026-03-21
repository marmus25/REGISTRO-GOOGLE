// src/components/calendar/CalendarPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CALENDAR_TYPE_CONFIG, MONTHS_ES } from '../../utils/constants';
import type { CalendarEventType } from '../../types/index';

export function CalendarPage() {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const addCalendarEvent = useAppStore(s => s.addCalendarEvent);
  const deleteCalendarEvent = useAppStore(s => s.deleteCalendarEvent);
  const showToast = useAppStore(s => s.showToast);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [formTipo, setFormTipo] = useState<CalendarEventType>('examen');
  const [formFecha, setFormFecha] = useState(now.toISOString().split('T')[0]);
  const [formTitulo, setFormTitulo] = useState('');
  const [formCurso, setFormCurso] = useState('');
  const [formNotas, setFormNotas] = useState('');

  const eventos = appData.calendario ?? [];
  const evMes = eventos.filter(ev => {
    const d = new Date(ev.fecha + 'T12:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const navMes = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.toISOString().split('T')[0];

  const openNew = (fecha?: string) => {
    setFormFecha(fecha ?? now.toISOString().split('T')[0]);
    setFormTitulo(''); setFormNotas(''); setFormCurso('');
    setFormTipo('examen');
    setModalDate(fecha ?? '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formFecha || !formTitulo.trim()) { showToast('Completa fecha y titulo', 'err'); return; }
    addCalendarEvent({ tipo: formTipo, fecha: formFecha, titulo: formTitulo.trim(), curso: formCurso, notas: formNotas.trim() });
    setShowModal(false);
    showToast('Evento guardado', 'ok');
  };

  const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            🗓 Calendario de Planificacion
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{MONTHS_ES[month]} {year}</div>
        </div>
        <button className="btn btn-green btn-sm" onClick={() => openNew()}>+ Nuevo evento</button>
      </div>

      {/* Nav mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navMes(-1)}>◀ Anterior</button>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{MONTHS_ES[month]} {year}</div>
        <button className="btn btn-outline btn-sm" onClick={() => navMes(1)}>Siguiente ▶</button>
      </div>

      {/* Grid */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
          {dias.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--muted)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayEvs = evMes.filter(ev => ev.fecha === dateStr);
            const esHoy = dateStr === today;
            return (
              <div
                key={d}
                onClick={() => openNew(dateStr)}
                style={{
                  padding: '6px 4px', borderRadius: 8, textAlign: 'center',
                  cursor: 'pointer', minHeight: 48,
                  background: esHoy ? 'var(--gold)' : 'var(--card2)',
                  border: `1px solid ${esHoy ? 'var(--gold-bright)' : 'var(--border)'}`,
                  transition: 'background .1s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: esHoy ? 900 : 600, color: esHoy ? '#1a1610' : 'var(--text)' }}>{d}</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                  {dayEvs.map((ev, ei) => {
                    const cfg = CALENDAR_TYPE_CONFIG[ev.tipo];
                    return <div key={ei} style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {Object.entries(CALENDAR_TYPE_CONFIG).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
              {v.icon} {v.label}
            </div>
          ))}
        </div>
      </div>

      {/* Lista eventos */}
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
        Eventos de {MONTHS_ES[month]} ({evMes.length})
      </div>
      {evMes.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 13 }}>
          Sin eventos este mes
        </div>
      )}
      {evMes.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((ev, ei) => {
        const cfg = CALENDAR_TYPE_CONFIG[ev.tipo];
        const d = new Date(ev.fecha + 'T12:00:00');
        const dLabel = `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0, 3)}`;
        const globalIdx = eventos.indexOf(ev);
        return (
          <div key={ei} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 10,
            borderRadius: 10, background: cfg.bg,
            borderLeft: `4px solid ${cfg.color}`, marginBottom: 8,
          }}>
            <div style={{ fontSize: 20 }}>{cfg.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{dLabel} — {cfg.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ev.titulo}</div>
              {ev.curso && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ev.curso}</div>}
              {ev.notas && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{ev.notas}</div>}
            </div>
            <button
              onClick={() => { if (window.confirm('Eliminar este evento?')) { deleteCalendarEvent(globalIdx); showToast('Evento eliminado', 'ok'); } }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: .5 }}
            >🗑</button>
          </div>
        );
      })}

      {/* Modal nuevo evento */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, width: 320, maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,.4)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📅 Nuevo evento</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>TIPO</label>
                <select value={formTipo} onChange={e => setFormTipo(e.target.value as CalendarEventType)}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, marginTop: 4 }}>
                  {Object.entries(CALENDAR_TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>FECHA</label>
                <input type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>TITULO</label>
                <input type="text" value={formTitulo} onChange={e => setFormTitulo(e.target.value)}
                  placeholder="Ej: Examen parcial SER"
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>CURSO (opcional)</label>
                <select value={formCurso} onChange={e => setFormCurso(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, marginTop: 4 }}>
                  <option value="">Todos los cursos</option>
                  {Object.values(appData.courses).map(c => (
                    <option key={c.meta.courseId} value={c.meta.curso}>{c.meta.curso}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>NOTAS (opcional)</label>
                <input type="text" value={formNotas} onChange={e => setFormNotas(e.target.value)}
                  placeholder="Detalle adicional..."
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>✅ Guardar</button>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}