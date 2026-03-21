// src/utils/exportPDF.ts
import type { CourseData } from '../types/index';
import { calcProm, calcTotal, countAtt } from './calculations';
import { TRIM_LABELS } from './constants';

function escH(str: string | number | null | undefined): string {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function badge(val: number | null, max: number): string {
  if (val === null) return '<span style="color:#999">—</span>';
  const pct = val / max;
  const bg = pct >= 0.51 ? '#16a34a' : pct >= 0.36 ? '#ca8a04' : '#dc2626';
  return `<span style="background:${bg};color:#fff;padding:2px 10px;border-radius:12px;font-weight:700;font-size:11pt">${Math.round(val)}</span>`;
}

export function exportFichasCurso(course: CourseData, studentIndices: number[]): void {
  const m = course.meta;
  const hoy = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
  const colors = ['#2563eb', '#7c3aed', '#16a34a', '#dc2626', '#ea580c', '#0891b2'];

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Fichas - ${escH(m.curso)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;font-size:10pt}
    .ficha{page-break-after:always;padding:18px 20px;max-width:100%}
    .ficha:last-child{page-break-after:avoid}
    .ficha-header{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#217346,#155228);color:#fff;border-radius:10px;padding:12px 16px;margin-bottom:12px}
    .avatar{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0}
    .trims{display:flex;gap:8px;margin-bottom:8px}
    .trim-card{flex:1;border:1px solid #ddd;border-radius:8px;padding:10px;min-width:0}
    .inst-header{text-align:center;border-bottom:2px solid #217346;padding-bottom:10px;margin-bottom:14px}
    .inst-header h1{font-size:13pt;color:#217346;font-weight:800}
    @media print{body{margin:0}.ficha{padding:12px 15px}}
  </style></head><body>`;

  studentIndices.forEach(i => {
    const st = course.students[i];
    if (!st) return;
    const initials = st.nombre.split(' ').slice(0, 2).map(w => w[0]).join('');
    const color = colors[i % colors.length];
    const faltaTotal = ([1, 2, 3] as const).reduce((a, t) => a + countAtt(course, t, i, 'F'), 0);
    const segObs = (course.seguimiento ?? []).filter(o => o.idx === i);

    const trimsHTML = ([1, 2, 3] as const).map(t => {
      const pS = calcProm(course, t, i, 'ser');
      const pSb = calcProm(course, t, i, 'saber');
      const pH = calcProm(course, t, i, 'hacer');
      const tot = calcTotal(course, t, i);
      const faltas = countAtt(course, t, i, 'F');
      const lic = countAtt(course, t, i, 'L');
      const ret = countAtt(course, t, i, 'R');
      const obs = (course.observations[t] ?? {})[i] ?? '';
      const totColor = tot === null ? '#999' : tot >= 51 ? '#16a34a' : tot >= 36 ? '#ca8a04' : '#dc2626';
      const g = (course.grades[t] ?? {})[i] ?? { ser: [], saber: [], hacer: [], auto: null };
      const acts = course.activities[t] ?? { ser: [], saber: [], hacer: [] };

      const actRows = (dim: 'ser' | 'saber' | 'hacer', color: string, maxPts: number) => {
        const vals = g[dim] ?? [];
        const names = acts[dim] ?? [];
        return names.map((n, idx) => {
          const v = vals[idx];
          if (v === null || v === undefined) return '';
          const nm = (!n || n.startsWith('Act')) ? `Act.${idx + 1}` : n;
          return `<tr><td style="color:${color};font-size:7.5pt;padding:1px 0 1px 10px">↳ ${escH(nm)}</td>
            <td style="text-align:right;font-size:8pt"><b>${v}</b><span style="color:#bbb;font-size:7pt">/${maxPts}</span></td></tr>`;
        }).join('');
      };

      return `<div class="trim-card">
        <div style="font-weight:800;font-size:10pt;color:#374151;text-align:center;border-bottom:2px solid #e5e7eb;padding-bottom:5px;margin-bottom:8px">${TRIM_LABELS[t]}° TRIMESTRE</div>
        <table style="width:100%;font-size:9pt;border-collapse:collapse">
          <tr><td style="color:#2563eb;font-weight:700;padding:3px 0">SER</td><td style="text-align:right">${badge(pS, 10)} <span style="color:#999;font-size:8pt">/10</span></td></tr>
          ${actRows('ser', '#2563eb', 10)}
          <tr><td style="color:#7c3aed;font-weight:700;padding:3px 0">SABER</td><td style="text-align:right">${badge(pSb, 45)} <span style="color:#999;font-size:8pt">/45</span></td></tr>
          ${actRows('saber', '#7c3aed', 45)}
          <tr><td style="color:#16a34a;font-weight:700;padding:3px 0">HACER</td><td style="text-align:right">${badge(pH, 40)} <span style="color:#999;font-size:8pt">/40</span></td></tr>
          ${actRows('hacer', '#16a34a', 40)}
          <tr style="border-top:2px solid #e5e7eb">
            <td style="font-weight:800;padding:4px 0;font-size:10pt">TOTAL</td>
            <td style="text-align:right"><span style="background:${totColor};color:#fff;padding:3px 12px;border-radius:12px;font-weight:800;font-size:11pt">${tot !== null ? Math.round(tot) : '—'}</span></td>
          </tr>
        </table>
        <div style="margin-top:6px;font-size:8pt;color:#6b7280">Faltas: <b style="color:${faltas > 3 ? '#dc2626' : '#374151'}">${faltas}</b> · Lic: <b>${lic}</b> · Ret: <b>${ret}</b></div>
        ${obs ? `<div style="margin-top:5px;padding:5px 7px;background:#f0f9ff;border-left:3px solid #2563eb;border-radius:4px;font-size:8pt;color:#1e3a5f;font-style:italic">${escH(obs)}</div>` : ''}
      </div>`;
    }).join('');

    const segHTML = segObs.length ? `
      <div style="margin-top:8px;padding:6px 10px;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px">
        <div style="font-size:8pt;font-weight:700;color:#374151;margin-bottom:4px">Observaciones de seguimiento:</div>
        ${segObs.map(o => `<div style="font-size:8pt;padding:2px 0;color:${o.tipo === 'pos' ? '#16a34a' : '#dc2626'}">
          ${o.tipo === 'pos' ? '✅' : '⚠️'} ${escH(o.texto)}
          <span style="color:#9ca3af;font-size:7pt">(${new Date(o.ts).toLocaleDateString('es-BO')})</span>
        </div>`).join('')}
      </div>` : '';

    html += `<div class="ficha">
      <div class="inst-header">
        <h1>U.E. Nuestra Senora del Pilar</h1>
        <p>${escH(m.area)} · ${escH(m.curso)} · Gestion 2026 · Generado: ${hoy}</p>
      </div>
      <div class="ficha-header">
        <div class="avatar" style="background:${color}">${initials}</div>
        <div style="flex:1">
          <div style="font-size:14pt;font-weight:800">${escH(st.nombre)}</div>
          <div style="font-size:9pt;opacity:.85">N° ${st.nro} · ${st.sexo === 'F' ? 'Femenino' : 'Masculino'} · Docente: ${escH(m.docente)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:8pt;opacity:.8">Faltas totales</div>
          <div style="font-size:22pt;font-weight:900;color:${faltaTotal > 8 ? '#fca5a5' : '#fff'}">${faltaTotal}</div>
        </div>
      </div>
      <div class="trims">${trimsHTML}</div>
      ${segHTML}
      <div style="margin-top:10px;display:flex;justify-content:space-between;border-top:1px dashed #ccc;padding-top:8px">
        <div style="font-size:8pt;color:#6b7280">${segObs.length} observacion(es) de seguimiento</div>
        <div style="font-size:8pt;color:#6b7280">Firma del Docente: ____________________</div>
      </div>
    </div>`;
  });

  html += '</body></html>';
  const win = window.open('', '_blank', 'width=950,height=750');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); setTimeout(() => win.print(), 300); };
  }
}

export function exportObsPDF(course: CourseData): void {
  const m = course.meta;
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Observaciones</title>
  <style>body{font-family:Arial,sans-serif;font-size:10pt}table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th,td{border:1px solid #ddd;padding:6px 8px}th{background:#f0f0f0}h2{margin:16px 0 8px}</style>
  </head><body><h1>Observaciones — ${escH(m.curso)}</h1>`;

  ([1, 2, 3] as const).forEach(t => {
    html += `<h2>${TRIM_LABELS[t]} Trimestre</h2>
    <table><thead><tr><th>#</th><th>Nombre</th><th>Observacion</th></tr></thead><tbody>`;
    course.students.forEach((st, i) => {
      const obs = (course.observations[t] ?? {})[i] ?? '';
      html += `<tr><td>${st.nro}</td><td>${escH(st.nombre)}</td><td>${obs ? escH(obs) : '<span style="color:#999">Sin observacion</span>'}</td></tr>`;
    });
    html += '</tbody></table>';
  });

  html += '</body></html>';
  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) { win.document.write(html); win.document.close(); win.onload = () => { win.focus(); win.print(); }; }
}

export function exportSegPDF(course: CourseData): void {
  const m = course.meta;
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Seguimiento</title>
  <style>body{font-family:Arial,sans-serif;font-size:10pt}.pos{color:#16a34a}.neg{color:#dc2626}
  .alumno{margin-bottom:16px;border:1px solid #ddd;border-radius:6px;padding:10px}
  h3{margin-bottom:6px}</style></head><body><h1>Seguimiento — ${escH(m.curso)}</h1>`;

  course.students.forEach((st, i) => {
    const obs = (course.seguimiento ?? []).filter(o => o.idx === i).sort((a, b) => b.ts - a.ts);
    if (!obs.length) return;
    html += `<div class="alumno"><h3>${escH(st.nombre)}</h3>`;
    obs.forEach(o => {
      html += `<div class="${o.tipo}"><b>${o.tipo === 'pos' ? '✅' : '⚠️'}</b> ${escH(o.texto)} <span style="color:#999;font-size:8pt">(${new Date(o.ts).toLocaleDateString('es-BO')})</span></div>`;
    });
    html += '</div>';
  });

  html += '</body></html>';
  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) { win.document.write(html); win.document.close(); win.onload = () => { win.focus(); win.print(); }; }
}