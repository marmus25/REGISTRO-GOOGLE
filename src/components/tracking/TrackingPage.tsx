// src/components/tracking/TrackingPage.tsx
import { exportSegPDF } from '../../utils/exportPDF';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_POS_TEXTS, DEFAULT_NEG_TEXTS } from '../../utils/constants';

export function TrackingPage() {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const addTracking = useAppStore(s => s.addTracking);
  const deleteTracking = useAppStore(s => s.deleteTracking);
  const setQuickTexts = useAppStore(s => s.setQuickTexts);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const showToast = useAppStore(s => s.showToast);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [customText, setCustomText] = useState('');

  if (!course) return null;

  const quickTexts = appData.textosRapidos ?? { pos: [...DEFAULT_POS_TEXTS], neg: [...DEFAULT_NEG_TEXTS] };
  const filtered = course.students.filter(s =>
    !search || s.nombre.toLowerCase().includes(search.toLowerCase())
  );
  const colors = ['#2563eb','#7c3aed','#16a34a','#dc2626','#ea580c','#0891b2'];
  const selected = selectedIdx !== null ? course.students[selectedIdx] : null;
  const obs = selectedIdx !== null
    ? (course.seguimiento ?? []).filter(o => o.idx === selectedIdx).sort((a,b) => b.ts - a.ts)
    : [];

  const handleEditTexts = () => {
    const pos = [...quickTexts.pos];
    const neg = [...quickTexts.neg];
    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          Editar textos rapidos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success-bright)', marginBottom: 8 }}>✅ POSITIVOS</div>
            {pos.map((t, i) => (
              <input key={i} defaultValue={t} onChange={e => pos[i] = e.target.value}
                style={{ width: '100%', padding: '6px 8px', marginBottom: 4, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 12 }} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger-bright)', marginBottom: 8 }}>⚠️ NEGATIVOS</div>
            {neg.map((t, i) => (
              <input key={i} defaultValue={t} onChange={e => neg[i] = e.target.value}
                style={{ width: '100%', padding: '6px 8px', marginBottom: 4, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontSize: 12 }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-gold btn-sm" onClick={() => {
            setQuickTexts({ pos, neg });
            closeModal();
            showToast('Textos actualizados', 'ok');
          }}>Guardar</button>
        </div>
      </div>
    );
  };

  const handleWA = () => {
    if (!selected) return;
    const lines = obs.map(o => `${o.tipo === 'pos' ? '✅' : '⚠️'} ${o.texto} (${new Date(o.ts).toLocaleDateString('es-BO')})`);
    const text = `*Seguimiento — ${selected.nombre}*\n${course.meta.curso} · ${course.meta.area}\n\n${lines.join('\n')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            ✍️ Seguimiento — {course.meta.curso}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Registro rapido de observaciones</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={handleEditTexts}>✏️ Editar textos</button>
          <button className="btn btn-outline btn-sm" onClick={handleWA}>📱 WhatsApp</button>
          <button className="btn btn-outline btn-sm" onClick={() => exportSegPDF(course)}>📄 PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, minHeight: 500 }}>
        {/* Lista */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder="🔍 Buscar estudiante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13 }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(st => {
              const i = course.students.indexOf(st);
              const obsCount = (course.seguimiento ?? []).filter(o => o.idx === i).length;
              const color = colors[i % colors.length];
              const initials = st.nombre.split(' ').slice(0,2).map(w => w[0]).join('');
              return (
                <div
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: selectedIdx === i ? 'var(--card3)' : 'transparent',
                    transition: 'background .1s',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{st.sexo}</div>
                  </div>
                  {obsCount > 0 && (
                    <span style={{ background: 'var(--gold)', color: '#1a1610', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 800 }}>
                      {obsCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel detalle */}
        {selected && selectedIdx !== null ? (
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', padding: 16, overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setSelectedIdx(i => i !== null && i > 0 ? i - 1 : i)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--card2)', color: 'var(--text)', fontSize: 18, cursor: 'pointer' }}>◀</button>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors[selectedIdx % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {selected.nombre.split(' ').slice(0,2).map(w => w[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{selected.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{course.meta.curso} · N°{selected.nro} · {obs.length} obs</div>
              </div>
              <button onClick={() => setSelectedIdx(i => i !== null && i < course.students.length - 1 ? i + 1 : i)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--card2)', color: 'var(--text)', fontSize: 18, cursor: 'pointer' }}>▶</button>
            </div>

            {/* Positivos */}
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white', background: '#16a34a', padding: '7px 14px', borderRadius: 8, marginBottom: 8 }}>✅ POSITIVOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 6, marginBottom: 14 }}>
              {quickTexts.pos.map((t, i) => (
                <button key={i} onClick={() => { addTracking(courseId, { idx: selectedIdx, texto: t, tipo: 'pos', ts: Date.now() }); showToast('Obs. agregada', 'ok'); }}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--success)', background: 'var(--success-l)', color: 'var(--success-bright)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Negativos */}
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white', background: '#dc2626', padding: '7px 14px', borderRadius: 8, marginBottom: 8 }}>⚠️ NECESITA MEJORAR</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 6, marginBottom: 14 }}>
              {quickTexts.neg.map((t, i) => (
                <button key={i} onClick={() => { addTracking(courseId, { idx: selectedIdx, texto: t, tipo: 'neg', ts: Date.now() }); showToast('Obs. agregada', 'ok'); }}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--danger)', background: 'var(--danger-l)', color: 'var(--danger-bright)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Custom */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customText.trim()) {
                    addTracking(courseId, { idx: selectedIdx, texto: customText.trim(), tipo: 'pos', ts: Date.now() });
                    setCustomText('');
                    showToast('Obs. agregada', 'ok');
                  }
                }}
                placeholder="Escribir observacion personalizada..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card2)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13 }}
              />
              <button className="btn btn-outline btn-sm" onClick={() => {
                if (!customText.trim()) return;
                addTracking(courseId, { idx: selectedIdx, texto: customText.trim(), tipo: 'pos', ts: Date.now() });
                setCustomText('');
                showToast('Obs. agregada', 'ok');
              }}>+ Agregar</button>
            </div>

            {/* Historial */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>📋 Historial ({obs.length})</div>
              {obs.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12 }}>Sin observaciones</div>}
              {obs.map(o => (
                <div key={o.ts} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                  borderRadius: 8, marginBottom: 6,
                  background: o.tipo === 'pos' ? 'var(--success-l)' : 'var(--danger-l)',
                  border: `1px solid ${o.tipo === 'pos' ? 'var(--success)' : 'var(--danger)'}`,
                }}>
                  <span>{o.tipo === 'pos' ? '✅' : '⚠️'}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{o.texto}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(o.ts).toLocaleDateString('es-BO')}</span>
                    <button onClick={() => deleteTracking(courseId, o.ts)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: .6 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', color: 'var(--muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Selecciona un estudiante</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}