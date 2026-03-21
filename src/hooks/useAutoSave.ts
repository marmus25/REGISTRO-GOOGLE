// src/hooks/useAutoSave.ts
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useAutoSave() {
  const hasChanges = useAppStore(s => s.hasChanges);
  const saveToLocalStorage = useAppStore(s => s.saveToLocalStorage);

  useEffect(() => {
    if (!hasChanges) return;
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasChanges, saveToLocalStorage]);
}