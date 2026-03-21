// src/components/common/Badge.tsx

interface BadgeProps {
  value: number | null;
  max: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ value, max, size = 'md' }: BadgeProps) {
  if (value === null) {
    return <span className="badge-n">—</span>;
  }

  const pct = value / max;
  const cls = pct >= 0.51 ? 'badge-g' : pct >= 0.36 ? 'badge-m' : 'badge-r';

  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px' },
    md: { fontSize: 13, padding: '3px 10px' },
    lg: { fontSize: 16, padding: '4px 14px' },
  };

  return (
    <span
      className={`badge ${cls}`}
      style={{ fontSize: sizes[size].fontSize, padding: sizes[size].padding }}
    >
      {Math.round(value)}
    </span>
  );
}

interface ScoreBadgeProps {
  value: number | null;
  max: number;
}

export function ScoreBadge({ value, max }: ScoreBadgeProps) {
  if (value === null) return <span style={{ color: 'var(--muted)' }}>—</span>;
  const pct = value / max;
  const bg = pct >= 0.51 ? 'var(--success-l)' : pct >= 0.36 ? 'var(--warning-l)' : 'var(--danger-l)';
  const color = pct >= 0.51 ? 'var(--success-bright)' : pct >= 0.36 ? 'var(--warning-bright)' : 'var(--danger-bright)';
  const border = pct >= 0.51 ? 'var(--success)' : pct >= 0.36 ? 'var(--warning)' : 'var(--danger)';

  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 800,
    }}>
      {Math.round(value)}
    </span>
  );
}