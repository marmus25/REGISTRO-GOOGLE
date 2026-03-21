// src/components/layout/FloatingNav.tsx
import { useAppStore } from '../../store/useAppStore';
import type { NavigationSection } from '../../types/index';

const FLOAT_ITEMS: { sec: NavigationSection; icon: string; title: string }[] = [
  { sec: 'resumen',   icon: '📊', title: 'Resumen' },
  { sec: 'att1',      icon: '📅', title: 'Asistencia T1' },
  { sec: 'cal1',      icon: '📝', title: 'Calificaciones T1' },
  { sec: 'calendario',icon: '🗓', title: 'Calendario' },
  { sec: 'seg',       icon: '👁', title: 'Seguimiento' },
];

export function FloatingNav() {
  const currentSection = useAppStore(s => s.currentSection);
  const setSection = useAppStore(s => s.setSection);

  return (
    <div style={{
      position: 'fixed',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 150,
    }}>
      {FLOAT_ITEMS.map(item => (
        <button
          key={item.sec}
          title={item.title}
          onClick={() => setSection(item.sec)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${currentSection === item.sec ? 'var(--gold)' : 'var(--border2)'}`,
            background: currentSection === item.sec
              ? 'linear-gradient(135deg,var(--gold),var(--amber))'
              : 'var(--card2)',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow)',
            transition: 'all .15s',
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}