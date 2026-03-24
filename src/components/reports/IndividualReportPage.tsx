// src/components/reports/IndividualReportPage.tsx
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calcTotal, calcProm, countAtt } from '../../utils/calculations';
import { TRIM_LABELS } from '../../utils/constants';
import { ScoreBadge } from '../common/Badge';
import type { TrimesterNumber } from '../../types/index';
import { LOGO_BASE64 } from '../../utils/logoBase64';

export function IndividualReportPage() {
  const appData = useAppStore(s => s.appData);
  const courseId = appData.currentCourse ?? '';
  const course = appData.courses[courseId];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!course) return null;

  const trims = [1, 2, 3] as TrimesterNumber[];
  const selected = selectedIdx !== null ? course.students[selectedIdx] : null;

  const printIndividual = () => {
    if (selectedIdx === null || !selected) return;
    const hoy = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
    const colors = ['#2563eb','#7c3aed','#16a34a','#dc2626','#ea580c','#0891b2'];
    const color = colors[selectedIdx % colors.length];
    const initials = selected.nombre.split(' ').slice(0,2).map((w: string) => w[0]).join('');

    const badge = (val: number | null, max: number) => {
      if (val === null) return '<span style="color:#999">—</span>';
      const pct = val / max;
      const bg = pct >= 0.51 ? '#16a34a' : pct >= 0.36 ? '#ca8a04' : '#dc2626';
      return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:10px;font-weight:700">${Math.round(val)}</span>`;
    };

    const trimHTML = trims.map(t => {
      const pS = calcProm(course, t, selectedIdx, 'ser');
      const pSb = calcProm(course, t, selectedIdx, 'saber');
      const pH = calcProm(course, t, selectedIdx, 'hacer');
      const tot = calcTotal(course, t, selectedIdx);
      const p = countAtt(course, t, selectedIdx, 'P');
      const f = countAtt(course, t, selectedIdx, 'F');
      const l = countAtt(course, t, selectedIdx, 'L');
      const r = countAtt(course, t, selectedIdx, 'R');
      const obs = (course.observations[t] ?? {})[selectedIdx] ?? '';
      const totColor = tot === null ? '#999' : tot >= 51 ? '#16a34a' : tot >= 36 ? '#ca8a04' : '#dc2626';
      return `
        <div style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:10px;min-width:0">
          <div style="font-weight:800;font-size:10pt;color:#374151;text-align:center;border-bottom:2px solid #e5e7eb;padding-bottom:5px;margin-bottom:8px">
            ${TRIM_LABELS[t]}° TRIMESTRE
          </div>
          <table style="width:100%;font-size:9pt;border-collapse:collapse">
            <tr><td style="color:#2563eb;font-weight:700;padding:3px 0">SER</td><td style="text-align:right">${badge(pS,10)} <span style="color:#999;font-size:8pt">/10</span></td></tr>
            <tr><td style="color:#7c3aed;font-weight:700;padding:3px 0">SABER</td><td style="text-align:right">${badge(pSb,45)} <span style="color:#999;font-size:8pt">/45</span></td></tr>
            <tr><td style="color:#16a34a;font-weight:700;padding:3px 0">HACER</td><td style="text-align:right">${badge(pH,40)} <span style="color:#999;font-size:8pt">/40</span></td></tr>
            <tr style="border-top:2px solid #e5e7eb">
              <td style="font-weight:800;padding:4px 0;font-size:10pt">TOTAL</td>
              <td style="text-align:right"><span style="background:${totColor};color:#fff;padding:3px 10px;border-radius:10px;font-weight:800">${tot !== null ? Math.round(tot) : '—'}</span> <span style="color:#999;font-size:8pt">/100</span></td>
            </tr>
          </table>
          <div style="margin-top:6px;font-size:8pt;color:#6b7280">
            ✅ P:${p} &nbsp; ❌ F:<span style="color:${f>3?'#dc2626':'inherit'}">${f}</span> &nbsp; 📋 L:${l} &nbsp; ⏰ R:${r}
          </div>
          ${obs ? `<div style="margin-top:5px;padding:5px;background:#eff6ff;border-left:3px solid #2563eb;border-radius:4px;font-size:8pt;color:#1e3a5f;font-style:italic">${obs}</div>` : ''}
        </div>`;
    }).join('');

    const seg = (course.seguimiento ?? []).filter(o => o.idx === selectedIdx).sort((a,b) => b.ts - a.ts);
    const segHTML = seg.length ? `
      <div style="margin-top:10px;padding:8px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px">
        <div style="font-size:9pt;font-weight:700;color:#374151;margin-bottom:6px">✍️ Seguimiento (${seg.length})</div>
        ${seg.map(o => `<div style="font-size:8pt;padding:2px 0;color:${o.tipo==='pos'?'#16a34a':'#dc2626'}">${o.tipo==='pos'?'✅':'⚠️'} ${o.texto} <span style="color:#9ca3af">(${new Date(o.ts).toLocaleDateString('es-BO')})</span></div>`).join('')}
      </div>` : '';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Informe — ${selected.nombre}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;font-size:10pt;padding:20px}
      @media print{body{padding:12px}}
    </style></head><body>
    <div style="border-bottom:3px solid #1e40af;padding-bottom:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${LOGO_BASE64}" style="width:48px;height:48px;object-fit:contain" />
        <div>
          <div style="font-size:13pt;font-weight:800;color:#1e40af">U.E. MARISTA "NUESTRA SEÑORA DEL PILAR"</div>
          <div style="font-size:9pt;color:#666">Fe y Alegria — Nivel Secundario · Cochabamba - Bolivia</div>
          <div style="font-size:9pt;color:#666">${course.meta.area} · Gestion 2026</div>
        </div>
      </div>
      <div style="text-align:right;font-size:9pt;color:#666">${hoy}</div>
    </div>
    <div style="background:linear-gradient(135deg,#1e40af,#1e3a8a);color:#fff;border-radius:10px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:14px">
      <div style="width:48px;height:48px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0">${initials}</div>
      <div style="flex:1">
        <div style="font-size:14pt;font-weight:800">${selected.nombre}</div>
        <div style="font-size:9pt;opacity:.85">N° ${selected.nro} · ${selected.sexo==='F'?'Femenino':'Masculino'} · ${course.meta.curso} · Docente: ${course.meta.docente}</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:10px">${trimHTML}</div>
    ${segHTML}
    <div style="margin-top:14px;border-top:1px dashed #ccc;padding-top:8px;display:flex;justify-content:flex-end">
      <div style="font-size:8pt;color:#6b7280">Firma del Docente: ____________________</div>
    </div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); setTimeout(() => win.print(), 300); };
    }
  };

  return (
    <div style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            👤 Informe Individual — {course.meta.curso}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Ficha completa por estudiante</div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={printIndividual}
          style={{ opacity: selectedIdx === null ? .4 : 1 }}
        >
          🖨️ Imprimir ficha
        </button>
      </div>

      <select
        value={selectedIdx ?? ''}
        onChange={e => setSelectedIdx(e.target.value === '' ? null : parseInt(e.target.value))}
        style={{
          width: '100%', maxWidth: 400, padding: '10px 12px',
          border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
          color: 'var(--text)', background: 'var(--card2)', cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        <option value="">— Seleccionar estudiante —</option>
        {course.students.map((st, i) => (
          <option key={i} value={i}>{st.nro}. {st.nombre}</option>
        ))}
      </select>

      {selected && selectedIdx !== null && (
        <div>
          <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#1e40af,#1e3a8a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {selected.nombre.split(' ').slice(0,2).map((w: string) => w[0]).join('')}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
                {selected.nombre}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                N° {selected.nro} · {selected.sexo === 'F' ? 'Femenino' : 'Masculino'} · Docente: {course.meta.docente}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
            {trims.map(t => {
              const pS = calcProm(course, t, selectedIdx, 'ser');
              const pSb = calcProm(course, t, selectedIdx, 'saber');
              const pH = calcProm(course, t, selectedIdx, 'hacer');
              const tot = calcTotal(course, t, selectedIdx);
              const p = countAtt(course, t, selectedIdx, 'P');
              const f = countAtt(course, t, selectedIdx, 'F');
              const l = countAtt(course, t, selectedIdx, 'L');
              const r = countAtt(course, t, selectedIdx, 'R');
              const obs = (course.observations[t] ?? {})[selectedIdx] ?? '';
              return (
                <div key={t} className="card">
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--gold-bright)' }}>
                    {TRIM_LABELS[t]}° Trimestre
                  </div>
                  {[
                    { label: 'SER', val: pS, max: 10, color: 'var(--ser-c)' },
                    { label: 'SABER', val: pSb, max: 45, color: 'var(--saber-c)' },
                    { label: 'HACER', val: pH, max: 40, color: 'var(--hacer-c)' },
                    { label: 'TOTAL', val: tot, max: 100, color: 'var(--gold-bright)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</span>
                      <ScoreBadge value={item.val} max={item.max} />
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                    ✅ {p} · ❌ <span style={{ color: f > 3 ? 'var(--danger-bright)' : 'var(--muted)' }}>{f}</span> · 📋 {l} · ⏰ {r}
                  </div>
                  {obs && (
                    <div style={{ marginTop: 8, padding: '6px 8px', background: 'var(--ser-bg)', borderLeft: '3px solid var(--ser-c)', borderRadius: 4, fontSize: 11, fontStyle: 'italic' }}>
                      {obs}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(() => {
            const seg = (course.seguimiento ?? []).filter(o => o.idx === selectedIdx).sort((a,b) => b.ts - a.ts).slice(0, 10);
            if (!seg.length) return null;
            return (
              <div className="card">
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>✍️ Seguimiento ({seg.length})</div>
                {seg.map(o => (
                  <div key={o.ts} style={{
                    display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 8, marginBottom: 6,
                    background: o.tipo === 'pos' ? 'var(--success-l)' : 'var(--danger-l)',
                    border: `1px solid ${o.tipo === 'pos' ? 'var(--success)' : 'var(--danger)'}`,
                  }}>
                    <span>{o.tipo === 'pos' ? '✅' : '⚠️'}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{o.texto}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(o.ts).toLocaleDateString('es-BO')}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {selectedIdx === null && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 14 }}>Selecciona un estudiante para ver su ficha</div>
        </div>
      )}
    </div>
  );
}