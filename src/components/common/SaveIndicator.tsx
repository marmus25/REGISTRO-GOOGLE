// src/components/common/SaveIndicator.tsx
import { useAppStore } from '../../store/useAppStore';

export function SaveIndicator() {
  const saveStatus = useAppStore(s => s.saveStatus);

  const config = {
    idle:   { text: '● Sin cambios', color: 'var(--muted)',           bg: 'var(--card2)', border: 'var(--border)' },
    saving: { text: '● Guardando...', color: 'var(--warning-bright)', bg: 'var(--warning-l)', border: 'var(--warning)' },
    saved:  { text: '✓ Guardado',    color: 'var(--success-bright)',  bg: 'var(--success-l)', border: 'var(--success)' },
  };

  const c = config[saveStatus];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      transition: 'all .3s',
    }}>
      {c.text}
    </span>
  );
}