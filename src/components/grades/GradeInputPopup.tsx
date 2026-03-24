// src/components/grades/GradeInputPopup.tsx
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMapPopupKeyNav } from '../../hooks/useKeyboardNav';
import type { TrimesterNumber, GradeDimension } from '../../types/index';

interface Props {
  trim: TrimesterNumber;
  dim: GradeDimension | 'auto';
  actIdx: number;
  actLabel: string;
  max: number;
  initialStudentIdx: number;
  onClose: () => void;
}

export function GradeInputPopup({ trim, dim, actIdx, actLabel, max, initialStudentIdx, onClose }: Props) {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const setGrade = useAppStore(s => s.setGrade);
  const setAuto = useAppStore(s => s.setAuto);
  const addTracking = useAppStore(s => s.addTracking);
  const navKeys = useAppStore(s => s.navKeys);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);

  const students = course?.students.filter(s => !s.oculto) ?? [];
  const [currentPos, setCurrentPos] = useState(() =>
    students.findIndex(s => course?.students.indexOf(s) === initialStudentIdx)
  );
  const [inputVal, setInputVal] = useState('');
  const [comment, setComment] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStudent = students[currentPos];
  const studentIdx = currentStudent ? course!.students.indexOf(currentStudent) : -1;

  useEffect(() => {
    if (!currentStudent || studentIdx < 0) return;
    const g = course!.grades[trim][studentIdx];
    const val = dim === 'auto' ? g?.auto : (g?.[dim as GradeDimension] as (number | null)[])?.[actIdx];
    setInputVal(val !== null && val !== undefined ? String(val) : '');
    setComment('');
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30);
  }, [currentPos]);

  const saveCurrentGrade = () => {
    if (!currentStudent || studentIdx < 0) return;
    const n = inputVal === '' ? null : Math.min(max, Math.max(0, parseInt(inputVal)));
    if (dim === 'auto') setAuto(courseId, trim, studentIdx, n);
    else setGrade(courseId, trim, studentIdx, dim, actIdx, n);

    if (comment.trim()) {
      addTracking(courseId, {
        idx: studentIdx,
        texto: comment.trim(),
        tipo: 'pos',
        ts: Date.now(),
      });
    }
  };

  // Aceptar: guarda y avanza al siguiente, o cierra si es el último
  const saveAndNext = () => {
    saveCurrentGrade();
    if (currentPos < students.length - 1) {
      setCurrentPos(p => p + 1);
    } else {
      onClose();
    }
  };

  // ◄ Anterior: guarda y retrocede
  const handlePrev = () => {
    saveCurrentGrade();
    if (currentPos > 0) setCurrentPos(p => p - 1);
  };

  // ► Siguiente: guarda y avanza, o cierra si es el último
  const handleNext = () => {
    saveCurrentGrade();
    if (currentPos < students.length - 1) setCurrentPos(p => p + 1);
    else onClose();
  };

  // El hook maneja Enter, PageUp, PageDown — NO duplicar onKeyDown en el input
  useMapPopupKeyNav(handlePrev, handleNext, saveAndNext, true);

  const handleConfigKeys = () => {
    openModal(<KeyConfigModal onClose={closeModal} />);
  };

  if (!currentStudent) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.5)',
        zIndex: 300, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)', borderRadius: 16, padding: 20,
          width: 300, maxWidth: '94vw',
          boxShadow: '0 8px 40px rgba(0,0,0,.4)', textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Nav buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <button
            onClick={handlePrev}
            disabled={currentPos === 0}
            style={{
              padding: '8px 14px', borderRadius: 10,
              border: '2px solid var(--border)', background: 'var(--card2)',
              color: 'var(--text)', fontSize: 18, cursor: 'pointer',
              opacity: currentPos === 0 ? .3 : 1, flexShrink: 0,
            }}
          >◄</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold-bright)' }}>
              {currentStudent.nombre.split(' ').slice(0, 2).join(' ')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {actLabel} (0–{max}) · {currentPos + 1}/{students.length}
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={currentPos === students.length - 1}
            style={{
              padding: '8px 14px', borderRadius: 10,
              border: '2px solid var(--border)', background: 'var(--card2)',
              color: 'var(--text)', fontSize: 18, cursor: 'pointer',
              opacity: currentPos === students.length - 1 ? .3 : 1, flexShrink: 0,
            }}
          >►</button>
        </div>

        {/* Input — sin onKeyDown, el hook maneja Enter */}
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={max}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          style={{
            width: '100%', height: 64, fontSize: 28, fontWeight: 800,
            textAlign: 'center', border: '2px solid var(--border)',
            borderRadius: 10, background: 'var(--card2)',
            color: 'var(--text)', fontFamily: 'var(--font)',
            marginBottom: 10,
          }}
        />

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Comentario para seguimiento (opcional)"
          rows={2}
          style={{
            width: '100%', padding: '8px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--card2)',
            color: 'var(--text)', fontFamily: 'var(--font)',
            fontSize: 12, resize: 'none', marginBottom: 12,
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }} onClick={saveAndNext}>
            ✅ Aceptar
          </button>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancelar
          </button>
        </div>

        {/* Key config */}
        <button
          onClick={handleConfigKeys}
          style={{
            marginTop: 8, background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
          }}
        >
          ⌨️ {navKeys.prev}/{navKeys.next} para navegar
        </button>
      </div>
    </div>
  );
}

function KeyConfigModal({ onClose }: { onClose: () => void }) {
  const navKeys = useAppStore(s => s.navKeys);
  const setNavKeys = useAppStore(s => s.setNavKeys);
  const [capturing, setCapturing] = useState<'prev' | 'next' | null>(null);
  const [keys, setKeys] = useState(navKeys);

  useEffect(() => {
    if (!capturing) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeys(k => ({ ...k, [capturing]: e.key }));
      setCapturing(null);
    };
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, [capturing]);

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
        Teclas de navegacion
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {(['prev', 'next'] as const).map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13 }}>{k === 'prev' ? '◄ Anterior' : '► Siguiente'}</span>
            <button
              onClick={() => setCapturing(k)}
              style={{
                padding: '6px 16px', borderRadius: 8,
                border: `2px solid ${capturing === k ? 'var(--gold)' : 'var(--border2)'}`,
                background: 'var(--card2)', color: 'var(--text)',
                fontSize: 13, cursor: 'pointer', minWidth: 120,
              }}
            >
              {capturing === k ? 'Presiona una tecla...' : keys[k]}
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setKeys({ prev: 'PageUp', next: 'PageDown' })}>
          Restablecer
        </button>
        <button className="btn btn-gold btn-sm" onClick={() => { setNavKeys(keys); onClose(); }}>
          Listo
        </button>
      </div>
    </div>
  );
}
