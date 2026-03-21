// src/components/layout/Header.tsx
import { useAppStore } from '../../store/useAppStore';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { SaveIndicator } from '../common/SaveIndicator';

export function Header() {
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const toggleDarkMode = useAppStore(s => s.toggleDarkMode);
  const isDarkMode = useAppStore(s => s.isDarkMode);
  const appData = useAppStore(s => s.appData);
  const hasData = Object.keys(appData.courses).length > 0;
  const exportJSON = useAppStore(s => s.exportJSON);
  const importJSON = useAppStore(s => s.importJSON);
  const resetApp = useAppStore(s => s.resetApp);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const showToast = useAppStore(s => s.showToast);
  const { isConnected, connect, disconnect, syncToDrive, loadFromDrive } = useGoogleDrive();
  const lastSyncTime = useAppStore(s => s.lastSyncTime);
  const sidebarCollapsed = useAppStore(s => s.sidebarCollapsed);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      openModal(
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            Importar JSON
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            Esto reemplazara los datos actuales. ¿Continuar?
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
            <button className="btn btn-gold btn-sm" onClick={async () => {
              await importJSON(file);
              closeModal();
            }}>Importar</button>
          </div>
        </div>
      );
    };
    input.click();
  };

  const handleReset = () => {
    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          Reiniciar app
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Se perderan todos los datos no exportados.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-red btn-sm" onClick={resetApp}>Reiniciar</button>
        </div>
      </div>
    );
  };

  const handleDrive = () => {
    if (isConnected) {
      openModal(
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            Google Drive
          </div>
          <p style={{ fontSize: 13, color: 'var(--success-bright)', marginBottom: 16 }}>
            Conectado {lastSyncTime ? `· Ultimo sync: ${lastSyncTime}` : ''}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => { loadFromDrive(); closeModal(); }}>
              Restaurar desde Drive
            </button>
            <button className="btn btn-red btn-sm" onClick={() => { disconnect(); closeModal(); }}>
              Desconectar
            </button>
            <button className="btn btn-outline btn-sm" onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      );
    } else {
      connect();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Pantalla completa no disponible', 'err');
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header style={{
      background: isDarkMode
        ? 'linear-gradient(135deg,#1e1a10,#2a2215)'
        : 'linear-gradient(135deg,#fffef8,#f5f0e8)',
      borderBottom: '2px solid var(--gold-l)',
      padding: '0 18px',
      height: 62,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 300,
      boxShadow: '0 4px 20px rgba(0,0,0,.7)',
      gap: 8,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
            fontSize: 14, color: 'var(--muted)', transition: 'all .15s',
          }}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
        <div style={{
          width: 38, height: 38,
          background: 'linear-gradient(135deg,var(--gold),var(--amber))',
          borderRadius: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20,
          boxShadow: '0 0 14px rgba(201,168,76,.4)',
        }}>
          🎵
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900,
            color: 'var(--text)', letterSpacing: 1,
          }}>
            PROF. MARCELO ZURITA{' '}
            <span style={{ color: 'var(--gold-bright)' }}>PRO</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
            Educacion Musical 2026 · U.E. Nuestra Senora del Pilar
          </div>
        </div>
      </div>

      {/* Derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
        {/* Online indicator */}
        <span title="Estado de conexion" style={{ fontSize: 13 }}>
          {navigator.onLine ? '🟢' : '🔴'}
        </span>

        <SaveIndicator />

        {/* Drive buttons */}
        <button
          onClick={() => syncToDrive()}
          title="Subir datos a Drive"
          style={{
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid #16a34a', background: '#dcfce7',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#15803d',
          }}
        >
          ⬆️ Subir
        </button>
        <button
          onClick={() => loadFromDrive()}
          title="Restaurar desde Drive"
          style={{
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid #2563eb', background: '#dbeafe',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#1d4ed8',
          }}
        >
          ⬇️ Restaurar
        </button>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            onClick={handleDrive}
            style={{
              padding: '5px 12px', borderRadius: 8,
              border: `1px solid ${isConnected ? '#16a34a' : 'var(--border2)'}`,
              background: isConnected ? '#16a34a' : 'var(--card2)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: isConnected ? 'white' : 'var(--text)',
            }}
          >
            ☁️ Drive {isConnected ? '✓' : ''}
          </button>
          {lastSyncTime && (
            <div style={{ fontSize: 9, color: '#16a34a', marginTop: 1 }}>
              ⟳ {lastSyncTime}
            </div>
          )}
        </div>

        {/* Botones con datos */}
        {hasData && (
          <>
            <button className="btn btn-outline btn-sm" onClick={handleImport}>
              📂 Importar
            </button>
            <button className="btn btn-gold btn-sm" onClick={exportJSON}>
              📥 Exportar
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid transparent' }}
              onClick={handleReset}
            >
              ↩ Reiniciar
            </button>
          </>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            fontSize: 15, color: 'var(--muted)',
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'var(--card2)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            fontSize: 14, color: 'var(--muted)',
          }}
        >
          ⛶
        </button>
      </div>
    </header>
  );
}