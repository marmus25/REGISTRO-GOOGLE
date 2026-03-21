// src/components/grades/GradesPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TRIM_LABELS } from '../../utils/constants';
import type { TrimesterNumber } from '../../types/index';
import { GradeTable } from './GradeTable.tsx';
import { StarRating } from './StarRating.tsx';
import { GradesSeatMap } from './GradesSeatMap.tsx';
import { VisualGradebook } from './VisualGradebook.tsx';

interface Props { trim: TrimesterNumber; }

type GradeTab = 'ser' | 'saber' | 'hacer' | 'auto' | 'total' | 'estrellas' | 'mapa' | 'visual';

export function GradesPage({ trim }: Props) {
  const [activeTab, setActiveTab] = useState<GradeTab>('ser');
  const appData = useAppStore(s => s.appData);
  const course = appData.courses[appData.currentCourse ?? ''];
  if (!course) return null;

  const tabs: { key: GradeTab; label: string }[] = [
    { key: 'ser',      label: 'SER' },
    { key: 'saber',    label: 'SABER' },
    { key: 'hacer',    label: 'HACER' },
    { key: 'auto',     label: 'AUTO' },
    { key: 'total',    label: 'TOTAL' },
    { key: 'estrellas',label: '⭐ SER' },
    { key: 'mapa',     label: '🗺 Mapa' },
    { key: 'visual',   label: '🎨 Visual' },
  ];

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
          📝 Calificaciones — {TRIM_LABELS[trim]} Trim · {course.meta.curso}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
          SER (10) · SABER (45) · HACER (40) · Auto (5)
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 0, background: 'var(--card)',
        border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
        padding: 4, flexWrap: 'wrap', marginBottom: 16,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'ser' || activeTab === 'saber' || activeTab === 'hacer' || activeTab === 'auto' || activeTab === 'total') && (
        <GradeTable trim={trim} dim={activeTab} />
      )}
      {activeTab === 'estrellas' && <StarRating trim={trim} />}
      {activeTab === 'mapa' && <GradesSeatMap trim={trim} />}
      {activeTab === 'visual' && <VisualGradebook trim={trim} />}
    </div>
  );
}