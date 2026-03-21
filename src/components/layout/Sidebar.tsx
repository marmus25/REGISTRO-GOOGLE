// src/components/layout/Sidebar.tsx
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { NavigationSection } from '../../types/index';

const NAV_ITEMS: { sec: NavigationSection; label: string; icon: string }[] = [
  { sec: 'resumen',      label: 'Resumen',          icon: '📊' },
  { sec: 'config',       label: 'Actividades',       icon: '⚙️' },
  { sec: 'informe-curso',label: 'Informe del Curso', icon: '📈' },
  { sec: 'informe-ind',  label: 'Informe Individual',icon: '👤' },
];

const ATT_ITEMS: { sec: NavigationSection; label: string }[] = [
  { sec: 'att1', label: '1er Trimestre' },
  { sec: 'att2', label: '2do Trimestre' },
  { sec: 'att3', label: '3er Trimestre' },
];

const CAL_ITEMS: { sec: NavigationSection; label: string }[] = [
  { sec: 'cal1', label: '1er Trimestre' },
  { sec: 'cal2', label: '2do Trimestre' },
  { sec: 'cal3', label: '3er Trimestre' },
];

const SEG_ITEMS: { sec: NavigationSection; label: string; icon: string }[] = [
  { sec: 'seg',  label: 'Seguimiento rapido', icon: '✍️' },
  { sec: 'obs1', label: 'Obs. 1er Trim',      icon: '💬' },
  { sec: 'obs2', label: 'Obs. 2do Trim',      icon: '💬' },
  { sec: 'obs3', label: 'Obs. 3er Trim',      icon: '💬' },
];

export function Sidebar() {
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);
  const currentSection = useAppStore(s => s.currentSection);
  const setSection = useAppStore(s => s.setSection);
  const appData = useAppStore(s => s.appData);
  const setCurrentCourse = useAppStore(s => s.setCurrentCourse);
  const loadCourses = useAppStore(s => s.loadCourses);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const exportXLSX = useAppStore(s => s.exportXLSX);

  const courses = Object.values(appData.courses);
  const currentCourseId = appData.currentCourse ?? '';

  const handleAddCourse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length) await loadCourses(files);
    };
    input.click();
  };

  const handleVolcar = () => {
    if (!currentCourseId) return;
    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          Volcar datos a Excel
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Curso: <strong style={{ color: 'var(--text)' }}>{appData.courses[currentCourseId]?.meta.curso}</strong>
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[1, 2, 3].map(t => (
            <button
              key={t}
              className="btn btn-outline btn-sm"
              onClick={() => { exportXLSX(currentCourseId, t as 1|2|3); closeModal(); }}
            >
              {t === 1 ? '1er' : t === 2 ? '2do' : '3er'} Trimestre
            </button>
          ))}
        </div>
        <button
          className="btn btn-gold"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { exportXLSX(currentCourseId, 'todos'); closeModal(); }}
        >
          📤 Volcar los 3 trimestres
        </button>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
        </div>
      </div>
    );
  };

  const sectionLabel: Record<string, string> = {
    'GENERAL': '', 'ASISTENCIA': '', 'CALIFICACIONES': '', 'SEGUIMIENTO': '', 'EXTRA': ''
  };
  void sectionLabel;

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 0 : 230 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: 'linear-gradient(180deg,#1e1a10,#181410)',
        borderRight: '1px solid var(--border)',
        position: 'sticky',
        top: 62,
        height: 'calc(100vh - 62px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Selector de curso */}
      <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', marginBottom: 8,
        }}>
          Curso activo
        </div>
        <select
          value={currentCourseId}
          onChange={e => setCurrentCourse(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px',
            border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
            fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
            color: 'var(--text)', background: 'var(--card2)', cursor: 'pointer',
          }}
        >
          {courses.map(c => (
            <option key={c.meta.courseId} value={c.meta.courseId}>
              {c.meta.curso}
            </option>
          ))}
        </select>
      </div>

      {/* Navegacion */}
      <div style={{ padding: 8, flex: 1 }}>
        {/* General */}
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', padding: '14px 8px 6px',
        }}>General</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.sec}
            className={`nav-btn ${currentSection === item.sec ? 'active' : ''}`}
            onClick={() => setSection(item.sec)}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Asistencia */}
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', padding: '14px 8px 6px',
        }}>Asistencia</div>
        {ATT_ITEMS.map(item => (
          <button
            key={item.sec}
            className={`nav-btn ${currentSection === item.sec ? 'active' : ''}`}
            onClick={() => setSection(item.sec)}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>📅</span>
            {item.label}
          </button>
        ))}

        {/* Calificaciones */}
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', padding: '14px 8px 6px',
        }}>Calificaciones</div>
        {CAL_ITEMS.map(item => (
          <button
            key={item.sec}
            className={`nav-btn ${currentSection === item.sec ? 'active' : ''}`}
            onClick={() => setSection(item.sec)}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>📝</span>
            {item.label}
          </button>
        ))}

        {/* Seguimiento */}
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', padding: '14px 8px 6px',
        }}>Seguimiento</div>
        {SEG_ITEMS.map(item => (
          <button
            key={item.sec}
            className={`nav-btn ${currentSection === item.sec ? 'active' : ''}`}
            onClick={() => setSection(item.sec)}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Extra */}
        <div style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--gold-l)', padding: '14px 8px 6px',
        }}>Extra</div>
        <button
          className={`nav-btn ${currentSection === 'calendario' ? 'active' : ''}`}
          onClick={() => setSection('calendario')}
        >
          <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>🗓</span>
          Calendario
        </button>
      </div>

      {/* Bottom */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }}
          onClick={handleAddCourse}
        >
          + Agregar curso
        </button>
        <button
          className="btn btn-gold btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleVolcar}
        >
          📤 Volcar a Excel
        </button>
      </div>
    </motion.aside>
  );
}