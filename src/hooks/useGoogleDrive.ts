// src/hooks/useGoogleDrive.ts
import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  DRIVE_CLIENT_ID, DRIVE_SCOPE, DRIVE_FILE_NAME
} from '../utils/constants';

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
            error_callback?: () => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

export function useGoogleDrive() {
  const driveToken = useAppStore(s => s.driveToken);
  const driveFileId = useAppStore(s => s.driveFileId);
  const hasChanges = useAppStore(s => s.hasChanges);
  const appData = useAppStore(s => s.appData);
  const setDriveToken = useAppStore(s => s.setDriveToken);
  const setDriveFileId = useAppStore(s => s.setDriveFileId);
  const setLastSyncTime = useAppStore(s => s.setLastSyncTime);
  const showToast = useAppStore(s => s.showToast);
  const loadFromLocalStorage = useAppStore(s => s.loadFromLocalStorage);

  const syncToDrive = useCallback(async (token?: string) => {
    const t = token ?? driveToken;
    if (!t) return;
    try {
      const jsonStr = JSON.stringify({ ...appData, exportedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      let fileId = driveFileId;

      if (!fileId) {
        const search = await fetch(
          `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILE_NAME}'`,
          { headers: { Authorization: `Bearer ${t}` } }
        );
        const sdata = await search.json();
        if (sdata.files?.length > 0) fileId = sdata.files[0].id;
      }

      if (!fileId) {
        const meta = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: DRIVE_FILE_NAME, parents: ['appDataFolder'] })
        });
        const mdata = await meta.json();
        fileId = mdata.id;
        setDriveFileId(fileId);
      }

      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: blob }
      );

      const now = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(now);
      showToast('Datos subidos a Drive', 'ok');
    } catch (e) {
      console.error('Drive sync error:', e);
      showToast('Error al subir a Drive', 'err');
    }
  }, [driveToken, driveFileId, appData, setDriveFileId, setLastSyncTime, showToast]);

  const loadFromDrive = useCallback(async () => {
    if (!driveToken) { showToast('Primero conectate a Drive', 'err'); return; }
    try {
      showToast('Cargando desde Drive...', 'info');
      let fileId = driveFileId;
      if (!fileId) {
        const search = await fetch(
          `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILE_NAME}'`,
          { headers: { Authorization: `Bearer ${driveToken}` } }
        );
        const sdata = await search.json();
        if (!sdata.files?.length) { showToast('No hay datos en Drive', 'err'); return; }
        fileId = sdata.files[0].id;
        setDriveFileId(fileId);
      }
      const resp = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${driveToken}` } }
      );
      const data = await resp.json();
      if (data.courses) {
        useAppStore.setState({ appData: data });
        showToast('Datos restaurados desde Drive', 'ok');
      }
    } catch { showToast('Error cargando desde Drive', 'err'); }
  }, [driveToken, driveFileId, setDriveFileId, showToast]);

  const connect = useCallback(() => {
    if (!window.google) { showToast('Google no disponible', 'err'); return; }
    window.google.accounts.oauth2.initTokenClient({
      client_id: DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          showToast('Error conectando a Google', 'err'); return;
        }
        setDriveToken(resp.access_token);
        showToast('Conectado a Google Drive', 'ok');
        syncToDrive(resp.access_token);
      }
    }).requestAccessToken();
  }, [setDriveToken, showToast, syncToDrive]);

  const connectAndRestore = useCallback(() => {
    if (!window.google) { showToast('Google no disponible', 'err'); return; }
    window.google.accounts.oauth2.initTokenClient({
      client_id: DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: async (resp) => {
        if (resp.error || !resp.access_token) {
          showToast('Error conectando a Google', 'err'); return;
        }
        setDriveToken(resp.access_token);
        await loadFromDrive();
      }
    }).requestAccessToken();
  }, [setDriveToken, showToast, loadFromDrive]);

  const disconnect = useCallback(() => {
    setDriveToken(null);
    setDriveFileId(null);
    showToast('Drive desconectado', 'ok');
  }, [setDriveToken, setDriveFileId, showToast]);

  // Reconexion silenciosa al montar
  useEffect(() => {
    if (!DRIVE_CLIENT_ID || !navigator.onLine) return;
    const timer = setTimeout(() => {
      try {
        if (!window.google) return;
        window.google.accounts.oauth2.initTokenClient({
          client_id: DRIVE_CLIENT_ID,
          scope: DRIVE_SCOPE,
          prompt: 'none',
          callback: (resp) => {
            if (!resp.error && resp.access_token) {
              setDriveToken(resp.access_token);
            }
          },
          error_callback: () => {}
        }).requestAccessToken({ prompt: 'none' });
      } catch { /* silencioso */ }
    }, 2500);
    return () => clearTimeout(timer);
  }, [setDriveToken]);

  // Auto-sync cada 3 minutos
  useEffect(() => {
    if (!driveToken) return;
    const interval = setInterval(() => {
      if (navigator.onLine && driveToken && hasChanges) {
        syncToDrive();
      }
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [driveToken, hasChanges, syncToDrive]);

  // Sync al recuperar conexion
  useEffect(() => {
    const handler = () => {
      if (driveToken && hasChanges) syncToDrive();
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [driveToken, hasChanges, syncToDrive]);

  return {
    isConnected: !!driveToken,
    connect,
    disconnect,
    syncToDrive,
    loadFromDrive,
    connectAndRestore,
  };
}