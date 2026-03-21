// src/components/landing/LandingScreen.tsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';

export function LandingScreen() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const loadCourses = useAppStore(s => s.loadCourses);
  const importJSON = useAppStore(s => s.importJSON);
  const showToast = useAppStore(s => s.showToast);
  const { connectAndRestore } = useGoogleDrive();

  const handleFiles = async (files: File[]) => {
    const xlsx = files.filter(f => f.name.endsWith('.xlsx'));
    if (!xlsx.length) { showToast('No hay archivos .xlsx', 'err'); return; }
    await loadCourses(xlsx);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 62px)',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,.06) 0%, transparent 70%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          padding: 40,
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 520,
          width: '100%',
          border: '1px solid var(--border2)',
        }}
      >
        {/* Icono */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 52, marginBottom: 16 }}
        >
          🎵
        </motion.div>

        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: 28, fontWeight: 900,
          color: 'var(--text)', marginBottom: 6, letterSpacing: .5,
        }}>
          Registro Pedagogico Musical 2026
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>
          Educacion Musical · U.E. Nuestra Senora del Pilar
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--gold)' : 'var(--border2)'}`,
            borderRadius: 14,
            padding: '32px 20px',
            cursor: 'pointer',
            transition: 'all .2s',
            marginBottom: 16,
            background: isDragOver ? 'var(--card3)' : 'var(--card2)',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Cargar archivos .xlsx
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Clic aqui o arrasta uno o varios registros Excel
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(Array.from(e.target.files ?? []))}
        />

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--muted)', fontSize: 12, margin: '16px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          o
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* JSON */}
        <button
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          onClick={() => jsonRef.current?.click()}
        >
          📋 Cargar datos_todos_cursos.json
        </button>
        <input
          ref={jsonRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={async e => {
            const file = e.target.files?.[0];
            if (file) await importJSON(file);
          }}
        />

        {/* Drive */}
        <div style={{
          border: '2px solid var(--ser-c)',
          borderRadius: 12, padding: 16,
          background: 'var(--ser-bg)',
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700,
            color: 'var(--ser-c)', marginBottom: 10, textAlign: 'center',
          }}>
            ☁️ Ya tenes datos guardados en otro dispositivo?
          </p>
          <button
            className="btn btn-gold"
            style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14 }}
            onClick={connectAndRestore}
          >
            🔗 Conectar con Google y restaurar datos
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
            Toca aqui para sincronizar desde Google Drive
          </p>
        </div>
      </motion.div>
    </div>
  );
}