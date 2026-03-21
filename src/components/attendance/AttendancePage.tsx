// src/components/attendance/AttendancePage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TRIM_LABELS } from '../../utils/constants';
import type { TrimesterNumber } from '../../types/index';
import { AttendanceList } from './AttendanceList.tsx';
import { AttendanceSeatMap } from './AttendanceSeatMap.tsx';
import { AttendanceHistory } from './AttendanceHistory.tsx';
interface Props { trim: TrimesterNumber; }

export function AttendancePage({ trim }: Props) {
  const [activeTab, setActiveTab] = useState<'reg' | 'mapa' | 'hist'>('reg');
  const appData = useAppStore(s => s.appData);
  const course = appData.courses[appData.currentCourse ?? ''];

  if (!course) return null;

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
          📅 Asistencia — {TRIM_LABELS[trim]} Trim · {course.meta.curso}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content', marginBottom: 16 }}>
        {[
          { key: 'reg',  label: 'Registrar' },
          { key: 'mapa', label: '🗺 Mapa' },
          { key: 'hist', label: 'Historial' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as 'reg' | 'mapa' | 'hist')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'reg'  && <AttendanceList trim={trim} />}
      {activeTab === 'mapa' && <AttendanceSeatMap trim={trim} />}
      {activeTab === 'hist' && <AttendanceHistory trim={trim} />}
    </div>
  );
}