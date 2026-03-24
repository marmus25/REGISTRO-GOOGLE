// src/hooks/useGoogleDrive.ts
import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DRIVE_CLIENT_ID, DRIVE_SCOPE, DRIVE_FILE_NAME } from '../utils/constants';

const REDIRECT_URI = window.location.origin + window.location.pathname;
const TOKEN_KEY = 'driveAccessToken';
const TOKEN_EXP_KEY = 'driveTokenExpiry';

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: DRIVE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: DRIVE_SCOPE,
    include_granted_scopes: 'true',
    state: 'drive_auth',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXP_KEY);
    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXP_KEY);
      return null;
    }
    return token;
  } catch { return null; }
}

function storeToken(token: string, expiresIn: number) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + expiresIn * 1000));
  } catch {}
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXP_KEY);
  } catch {}
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

  // Leer token del hash al volver del redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('state=drive_auth')) {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get('access_token');
      const expiresIn = parseInt(params.get('expires_in') ?? '3600');
      if (token) {
        storeToken(token, expiresIn);
        setDriveToken(token);
        // Limpiar hash de la URL
        window.history.replaceState(null, '', window.location.pathname);
        showToast('Conectado a Google Drive', 'ok');
      }
    }
  }, [setDriveToken, showToast]);

  // Recuperar token guardado al montar
  useEffect(() => {
    const stored = getStoredToken();
    if (stored && !driveToken) {
      setDriveToken(stored);
    }
  }, [setDriveToken, driveToken]);

  const syncToDrive = useCallback(async (token?: string) => {
    const t = token ?? driveToken;
    if (!t || !navigator.onLine) return;
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
    if (!navigator.onLine) { showToast('Sin conexion a internet', 'err'); return; }
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
    if (!navigator.onLine) { showToast('Sin conexion a internet', 'err'); return; }
    window.location.href = buildAuthUrl();
  }, [showToast]);

  const connectAndRestore = useCallback(async () => {
    if (!navigator.onLine) { showToast('Sin conexion a internet', 'err'); return; }
    // Guardar flag para restaurar después del redirect
    localStorage.setItem('driveRestoreAfterAuth', '1');
    window.location.href = buildAuthUrl();
  }, [showToast]);

  // Restaurar desde Drive si venía del redirect con flag
  useEffect(() => {
    const shouldRestore = localStorage.getItem('driveRestoreAfterAuth');
    if (shouldRestore && driveToken) {
      localStorage.removeItem('driveRestoreAfterAuth');
      setTimeout(() => loadFromDrive(), 1000);
    }
  }, [driveToken, loadFromDrive]);

  const disconnect = useCallback(() => {
    clearStoredToken();
    setDriveToken(null);
    setDriveFileId(null);
    showToast('Drive desconectado', 'ok');
  }, [setDriveToken, setDriveFileId, showToast]);

  // Auto-sync cada 3 minutos
  useEffect(() => {
    if (!driveToken) return;
    const interval = setInterval(() => {
      if (navigator.onLine && driveToken && hasChanges) syncToDrive();
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