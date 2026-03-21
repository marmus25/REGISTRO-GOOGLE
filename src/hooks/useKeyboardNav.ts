// src/hooks/useKeyboardNav.ts
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useGradeTableKeyNav() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inp = document.activeElement as HTMLInputElement;
      if (!inp || !inp.classList.contains('score-inp')) return;
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Enter', 'Tab'].includes(e.key)) return;

      const table = inp.closest('table');
      if (!table) return;
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const rowInps = rows.map(r => Array.from(r.querySelectorAll<HTMLInputElement>('.score-inp')));

      let curRow = -1, curCol = -1;
      rowInps.forEach((ri, r) => {
        const c = ri.indexOf(inp);
        if (c !== -1) { curRow = r; curCol = c; }
      });

      let target: HTMLInputElement | null = null;

      if (e.key === 'Enter') {
        e.preventDefault();
        target = curRow < rowInps.length - 1
          ? (rowInps[curRow + 1]?.[curCol] ?? null)
          : (rowInps[0]?.[curCol] ?? null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const all = Array.from(document.querySelectorAll<HTMLInputElement>('.score-inp'));
        const idx = all.indexOf(inp);
        target = all[e.shiftKey ? idx - 1 : idx + 1] ?? null;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        target = rowInps[curRow + 1]?.[curCol] ?? null;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        target = curRow > 0 ? (rowInps[curRow - 1]?.[curCol] ?? null) : null;
      } else if (e.key === 'ArrowRight') {
        const atEnd = inp.selectionStart === inp.value.length;
        if (atEnd) {
          e.preventDefault();
          const all = Array.from(document.querySelectorAll<HTMLInputElement>('.score-inp'));
          target = all[all.indexOf(inp) + 1] ?? null;
        }
      } else if (e.key === 'ArrowLeft') {
        const atStart = inp.selectionStart === 0;
        if (atStart) {
          e.preventDefault();
          const all = Array.from(document.querySelectorAll<HTMLInputElement>('.score-inp'));
          target = all[all.indexOf(inp) - 1] ?? null;
        }
      }

      if (target) { target.focus(); target.select(); }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}

export function useMapPopupKeyNav(
  onPrev: () => void,
  onNext: () => void,
  onConfirm: () => void,
  isOpen: boolean
) {
  const navKeys = useAppStore(s => s.navKeys);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === navKeys.prev) { e.preventDefault(); onPrev(); }
      else if (e.key === navKeys.next) { e.preventDefault(); onNext(); }
      else if (e.key === 'Enter') { e.preventDefault(); onConfirm(); }
      else if (e.key === 'Escape') { e.preventDefault(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, navKeys, onPrev, onNext, onConfirm]);
}