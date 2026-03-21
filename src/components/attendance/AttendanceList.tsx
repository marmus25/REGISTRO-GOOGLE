// src/components/attendance/AttendanceList.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { TrimesterNumber, AttendanceStatus } from '../../types/index';

interface Props { trim: TrimesterNumber; }

const STATUS_CONFIG = {
  P: { label: 'P', bg: 'var(--success-l)', border: 'var(--success)', color: 'var(--success-bright)' },
  F: { label: 'F', bg: 'var(--danger-l)',  border: 'var(--danger)',  color: 'var(--danger-bright)'  },
  L: { label: 'L', bg: 'var(--warning-l)', border: 'var(--warning)', color: 'var(--warning-bright)' },
  R: { label: 'R', bg: 'var(--ser-bg)',    border: 'var(--ser-c)',   color: 'var(--ser-c)'           },
};

export function AttendanceList({ trim }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const appData = useAppStore(s => s.appData);
  const setAttendance = useAppStore(s => s.setAttendance);
  const markAllAttendance = useAppStore(s => s.markAllAttendance);
  const clearAttendanceDate = useAppStore(s => s.clearAttendanceDate);

  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  if (!course) return null;

  const dayData = course.attendance[trim][date] ?? {};

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
        <button className="btn btn-sm btn-outline" onClick={() => markAllAttendance(courseId, trim, date, 'F')}>
          Todos F
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => clearAttendanceDate(courseId, trim, date)}>
          Borrar dia
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {course.students.filter(s => !s.oculto).map(st => {
          const idx = course.students.indexOf(st);
          const current = dayData[idx];
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', background: 'var(--card)',
              borderRadius: 10, border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', width: 28 }}>{st.nro}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{st.nombre}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['P', 'F', 'L', 'R'] as AttendanceStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const active = current === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setAttendance(courseId, trim, date, idx, active ? null : s)}
                      style={{
                        minWidth: 44, height: 38,
                        borderRadius: 10,
                        border: `1px solid ${active ? cfg.border : 'var(--border2)'}`,
                        background: active ? cfg.bg : 'var(--card2)',
                        color: active ? cfg.color : 'var(--muted)',
                        fontFamily: 'var(--font)',
                        fontSize: 13, fontWeight: 800,
                        cursor: 'pointer', transition: 'all .1s',
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}