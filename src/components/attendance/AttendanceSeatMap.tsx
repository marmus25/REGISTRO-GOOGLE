// src/components/attendance/AttendanceSeatMap.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { TrimesterNumber, AttendanceStatus } from '../../types/index';

interface Props { trim: TrimesterNumber; }

const STATUS_CONFIG = {
  P: { icon: '✅', bg: 'var(--success-l)', border: 'var(--success)', color: 'var(--success-bright)' },
  F: { icon: '❌', bg: 'var(--danger-l)',  border: 'var(--danger)',  color: 'var(--danger-bright)'  },
  L: { icon: '📋', bg: 'var(--warning-l)', border: 'var(--warning)', color: 'var(--warning-bright)' },
  R: { icon: '⏰', bg: 'var(--ser-bg)',    border: 'var(--ser-c)',   color: 'var(--ser-c)'           },
  _: { icon: '·',  bg: 'var(--card2)',     border: 'var(--border2)', color: 'var(--muted)'           },
};

export function AttendanceSeatMap({ trim }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const appData = useAppStore(s => s.appData);
  const setAttendance = useAppStore(s => s.setAttendance);
  const markAllAttendance = useAppStore(s => s.markAllAttendance);

  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  if (!course) return null;

  const dayData = course.attendance[trim][date] ?? {};
  const statuses: AttendanceStatus[] = ['P', 'F', 'L', 'R'];

  const cycle = (current: AttendanceStatus | undefined): AttendanceStatus | null => {
    if (!current) return 'P';
    const idx = statuses.indexOf(current);
    return idx < statuses.length - 1 ? statuses[idx + 1] : null;
  };

  const students = course.students.filter(s => !s.oculto);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10,
            border: '1px solid var(--border2)',
            background: 'var(--card2)', color: 'var(--text)',
            fontFamily: 'var(--font)', fontSize: 14,
          }}
        />
        <button className="btn btn-green btn-sm" onClick={() => markAllAttendance(courseId, trim, date, 'P')}>
          Todos P
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => markAllAttendance(courseId, trim, date, 'F')}>
          Todos F
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 10, padding: 4 }}>
        {students.map(st => {
          const idx = course.students.indexOf(st);
          const current = dayData[idx] as AttendanceStatus | undefined;
          const cfg = current ? STATUS_CONFIG[current] : STATUS_CONFIG['_'];
          const apellido = st.nombre.split(' ')[0];

          return (
            <div
              key={idx}
              onClick={() => setAttendance(courseId, trim, date, idx, cycle(current))}
              style={{
                borderRadius: 14,
                border: `2px solid ${cfg.border}`,
                background: cfg.bg,
                cursor: 'pointer',
                padding: '9px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 74,
                userSelect: 'none',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, marginBottom: 2 }}>
                {st.nro}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
                {apellido}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4, color: cfg.color }}>
                {cfg.icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}