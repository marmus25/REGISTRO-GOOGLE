// src/components/calendar/CalendarPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CALENDAR_TYPE_CONFIG, MONTHS_ES } from '../../utils/constants';
import type { CalendarEventType } from '../../types/index';

const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const COLORS: Record<string, string> = {
  examen: '#dc2626', prueba: '#ea580c', actividad: '#16a34a',
  feriado: '#7c3aed', reunion: '#2563eb', otro: '#0891b2',
};

export function CalendarPage() {
  const appData = useAppStore(s => s.appData);
  const addCalendarEvent = useAppStore(s => s.addCalendarEvent);
  const deleteCalendarEvent = useAppStore(s => s.deleteCalendarEvent);
  const showToast = useAppStore(s => s.showToast);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showModal, setShowModal] = useState(false);
  const [formFecha, setFormFecha] = useState(now.toISOString().split('T')[0]);
  const [formTipo, setFormTipo] = useState<CalendarEventType>('examen');
  const [formTitulo, setFormTitulo] = useState('');
  const [formCurso, setFormCurso] = useState('');
  const [formNotas, setFormNotas] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const eventos = appData.calendario ?? [];

  const navMes = (dir: number) => {
    let m = month + dir, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.toISOString().split('T')[0];

  const getEventsForDate = (dateStr: string) =>
    eventos.filter(ev => ev.fecha === dateStr);

  const openNew = (fecha: string) => {
    setFormFecha(fecha);
    setFormTitulo(''); setFormNotas(''); setFormCurso('');
    setFormTipo('examen');
    setSelectedDate(fecha);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formFecha || !formTitulo.trim()) { showToast('Completa fecha y titulo', 'err'); return; }
    addCalendarEvent({ tipo: formTipo, fecha: formFecha, titulo: formTitulo.trim(), curso: formCurso, notas: formNotas.trim() });
    setShowModal(false);
    showToast('Evento guardado', 'ok');
  };

  const totalCells = offset + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);

  return (
    <div style={{ padding: '16px 20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navMes(-1)} style={navBtn}>‹</button>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 900, color: 'var(--text)', minWidth: 200, textAlign: 'center' }}>
            {MONTHS_ES[month].toUpperCase()} {year}
          </div>
          <button onClick={() => navMes(1)} style={navBtn}>›</button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}
            style={{ ...navBtn, fontSize: 11, padding: '4px 10px', background: 'var(--gold)', color: '#1a1610', fontWeight: 700 }}>
            HOY
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(CALENDAR_TYPE_CONFIG).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[k] ?? '#888' }} />
              <span style={{ color: 'var(--muted)' }}>{v.label}</span>
            </div>
          ))}
          <button className="btn btn-green btn-sm" onClick={() => openNew(today)}>+ Evento</button>
        </div>
      </div>

      {/* Grid días semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 2 }}>
        {DIAS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 800,
            color: d === 'SÁB' || d === 'DOM' ? 'var(--danger-bright)' : 'var(--muted)',
            padding: '6px 0', letterSpacing: 1,
          }}>{d}</div>
        ))}
      </div>

      {/* Grid calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} style={{ minHeight: 80, background: 'var(--card2)', opacity: .3, borderRadius: 6 }} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayEvs = getEventsForDate(dateStr);
          const esHoy = dateStr === today;
          const dow = (offset + i) % 7;
          const esFinDeSemana = dow === 5 || dow === 6;

          return (
            <div
              key={d}
              onClick={() => openNew(dateStr)}
              style={{
                minHeight: 80, borderRadius: 6, padding: '4px 5px',
                background: esHoy ? 'var(--ser-bg)' : esFinDeSemana ? 'rgba(220,38,38,.05)' : 'var(--card)',
                border: `1px solid ${esHoy ? 'var(--gold)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'background .1s', overflow: 'hidden',
              }}
            >
              <div style={{
                fontSize: 13, fontWeight: esHoy ? 900 : 600,
                color: esHoy ? 'var(--gold-bright)' : esFinDeSemana ? 'var(--danger-bright)' : 'var(--text)',
                marginBottom: 3,
              }}>
                {d}
                {esHoy && <span style={{ fontSize: 9, marginLeft: 4, background: 'var(--gold)', color: '#1a1610', borderRadius: 4, padding: '1px 4px' }}>HOY</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayEvs.slice(0, 3).map((ev, ei) => {
                  const c = COLORS[ev.tipo] ?? '#888';
                  const globalIdx = eventos.indexOf(ev);
                  return (
                    <div
                      key={ei}
                      onClick={e => { e.stopPropagation(); if (window.confirm(`Eliminar: ${ev.titulo}?`)) { deleteCalendarEvent(globalIdx); showToast('Eliminado', 'ok'); } }}
                      style={{
                        background: c + '22',
                        border: `1px solid ${c}`,
                        borderRadius: 3,
                        padding: '2px 5px',
                        cursor: 'pointer',
                      }}
                      title={`${ev.titulo}${ev.curso ? ' · ' + ev.curso : ''}`}
                    >
                      {/* Título */}
                      <div style={{
                        fontSize: 10, fontWeight: 700,
                        color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ev.titulo}
                      </div>
                      {/* Curso — solo si existe */}
                      {ev.curso && (
                        <div style={{
                          fontSize: 9, fontWeight: 600,
                          color: c,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          opacity: 0.9,
                        }}>
                          {ev.curso}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dayEvs.length > 3 && (
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>+{dayEvs.length - 3} más</div>
                )}
              </div>
            </div>
          );
        })}

        {Array.from({ length: weeks * 7 - totalCells }).map((_, i) => (
          <div key={`f-${i}`} style={{ minHeight: 80, background: 'var(--card2)', opacity: .3, borderRadius: 6 }} />
        ))}
      </div>

      {/* Modal nuevo evento */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, width: 340, maxWidth: '95vw', boxShadow: '0 8px 40px rgba(0,0,0,.4)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>📅 Nuevo evento</div>
            <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 14 }}>{formFecha}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {Object.entries(CALENDAR_TYPE_CONFIG).map(([k, v]) => (
                  <button key={k} onClick={() => setFormTipo(k as CalendarEventType)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      border: `2px solid ${formTipo === k ? COLORS[k] : 'var(--border)'}`,
                      background: formTipo === k ? COLORS[k] + '22' : 'var(--card2)',
                      color: formTipo === k ? COLORS[k] : 'var(--muted)',
                      cursor: 'pointer',
                    }}>
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
              <input type="text" value={formTitulo} onChange={e => setFormTitulo(e.target.value)}
                placeholder="Título del evento *"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
              <select value={formCurso} onChange={e => setFormCurso(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13 }}>
                <option value="">Todos los cursos</option>
                {Object.values(appData.courses).map(c => (
                  <option key={c.meta.courseId} value={c.meta.curso}>{c.meta.curso}</option>
                ))}
              </select>
              <input type="text" value={formNotas} onChange={e => setFormNotas(e.target.value)}
                placeholder="Notas (opcional)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }} />
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

const navBtn: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 8,
  border: '1px solid var(--border2)', background: 'var(--card2)',
  color: 'var(--text)', fontSize: 20, cursor: 'pointer',
};
