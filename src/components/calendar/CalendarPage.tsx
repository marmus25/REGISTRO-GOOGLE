import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CALENDAR_TYPE_CONFIG, MONTHS_ES } from '../../utils/constants';
import type { CalendarEventType } from '../../types';

export function CalendarPage() {
  const appData = useAppStore(s => s.appData);
  const addCalendarEvent = useAppStore(s => s.addCalendarEvent);
  const deleteCalendarEvent = useAppStore(s => s.deleteCalendarEvent);
  const showToast = useAppStore(s => s.showToast);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showModal, setShowModal] = useState(false);
  
  const [formTipo, setFormTipo] = useState<CalendarEventType>('examen');
  const [formFecha, setFormFecha] = useState(now.toISOString().split('T')[0]);
  const [formTitulo, setFormTitulo] = useState('');
  const [formCurso, setFormCurso] = useState('');
  const [formNotas, setFormNotas] = useState('');

  const eventos = appData.calendario ?? [];
  const mesBusqueda = `${year}-${String(month + 1).padStart(2, '0')}`;
  const evMes = eventos.filter(ev => ev.fecha.startsWith(mesBusqueda));

  const navMes = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSave = () => {
    if (!formTitulo.trim()) {
      showToast('El título es obligatorio', 'err');
      return;
    }
    addCalendarEvent({
      tipo: formTipo,
      fecha: formFecha,
      titulo: formTitulo.trim(),
      curso: formCurso.trim(),
      notas: formNotas.trim()
    });
    setFormTitulo(''); setFormCurso(''); setFormNotas('');
    setShowModal(false);
    showToast('Evento guardado', 'ok');
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontWeight: 900 }}>🗓 Calendario Musical</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-green">+ Nuevo Evento</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: 'var(--card2)', padding: '10px', borderRadius: '12px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navMes(-1)}>◀</button>
        <span style={{ fontWeight: 800 }}>{MONTHS_ES[month]} {year}</span>
        <button className="btn btn-outline btn-sm" onClick={() => navMes(1)}>▶</button>
      </div>

      <div className="card" style={{ padding: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 800, marginBottom: '10px', color: 'var(--gold)' }}>
          {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = evMes.filter(e => e.fecha === dateStr);
            return (
              <div key={day} style={{ minHeight: '70px', background: 'var(--card2)', borderRadius: '8px', padding: '5px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>{day}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  {dayEvents.map((ev, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { if(window.confirm('¿Borrar evento?')) deleteCalendarEvent(eventos.indexOf(ev)) }}
                      style={{ fontSize: '9px', padding: '2px', borderRadius: '3px', background: CALENDAR_TYPE_CONFIG[ev.tipo]?.color || 'var(--gold)', color: '#000', cursor: 'pointer' }}
                    >
                      {ev.titulo}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '320px', padding: '20px' }}>
            <h3>Nuevo Evento</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="date" value={formFecha} onChange={e => setFormFecha(e.target.value)} className="input-field" />
              <input type="text" placeholder="Título" value={formTitulo} onChange={e => setFormTitulo(e.target.value)} className="input-field" />
              <input type="text" placeholder="Curso (opcional)" value={formCurso} onChange={e => setFormCurso(e.target.value)} className="input-field" />
              <textarea placeholder="Notas" value={formNotas} onChange={e => setFormNotas(e.target.value)} className="input-field" />
              <select value={formTipo} onChange={e => setFormTipo(e.target.value as CalendarEventType)} className="input-field">
                {Object.entries(CALENDAR_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <button className="btn btn-green" onClick={handleSave}>Guardar</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}