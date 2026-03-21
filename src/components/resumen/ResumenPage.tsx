// src/components/resumen/ResumenPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { calcTotal, countAtt } from '../../utils/calculations';
import { ScoreBadge } from '../common/Badge';
import { TRIM_LABELS } from '../../utils/constants';

export function ResumenPage() {
  const appData = useAppStore(s => s.appData);
  const currentCourseId = appData.currentCourse ?? '';
  const course = appData.courses[currentCourseId];
  const addManualStudent = useAppStore(s => s.addManualStudent);
  const hideStudent = useAppStore(s => s.hideStudent);
  const restoreStudent = useAppStore(s => s.restoreStudent);
  const setSection = useAppStore(s => s.setSection);
  const openModal = useAppStore(s => s.openModal);
  const closeModal = useAppStore(s => s.closeModal);
  const showToast = useAppStore(s => s.showToast);
  const [showOcultos, setShowOcultos] = useState(false);

  if (!course) return null;

  const trims = [1, 2, 3] as const;

  // Stats globales
  let tP = 0, tF = 0, tL = 0;
  trims.forEach(t =>
    Object.values(course.attendance[t]).forEach(d =>
      Object.values(d).forEach(v => {
        if (v === 'P') tP++;
        else if (v === 'F') tF++;
        else if (v === 'L') tL++;
      })
    )
  );
  const totalDays = trims.reduce((a, t) => a + Object.keys(course.attendance[t]).length, 0);
  const ocultos = course.students.filter(s => s.oculto);
  const visibles = course.students.filter(s => !s.oculto);

  const handleAddStudent = () => {
    let nro = '', nombre = '', sexo = 'M';
    openModal(
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, marginBottom: 16 }}>
          Agregar estudiante
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>NUMERO</label>
            <input
              type="number"
              defaultValue={nro}
              onChange={e => nro = e.target.value}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--card2)',
                color: 'var(--text)', fontSize: 14, marginTop: 4,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>NOMBRE COMPLETO</label>
            <input
              type="text"
              onChange={e => nombre = e.target.value}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--card2)',
                color: 'var(--text)', fontSize: 14, marginTop: 4,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>SEXO</label>
            <select
              onChange={e => sexo = e.target.value}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--card2)',
                color: 'var(--text)', fontSize: 14, marginTop: 4,
              }}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={closeModal}>Cancelar</button>
          <button className="btn btn-gold btn-sm" onClick={() => {
            if (!nombre.trim()) { showToast('Ingresa el nombre', 'err'); return; }
            addManualStudent(currentCourseId, Number(nro) || 0, nombre.trim(), sexo);
            closeModal();
            showToast('Estudiante agregado', 'ok');
          }}>Agregar</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '22px 26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            📊 {course.meta.curso} — Resumen
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {course.meta.area} · Docente: {course.meta.docente}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-green btn-sm" onClick={handleAddStudent}>
            ➕ Agregar estudiante
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowOcultos(!showOcultos)}
          >
            🙈 Ocultos {ocultos.length > 0 ? `(${ocultos.length})` : ''}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { val: course.students.length, label: 'Estudiantes', sub: `${course.students.filter(s => s.sexo === 'F').length}F · ${course.students.filter(s => s.sexo === 'M').length}M`, color: 'var(--ser-c)' },
          { val: totalDays, label: 'Dias registrados', sub: '', color: 'var(--saber-c)' },
          { val: tP, label: 'Presencias', sub: '', color: 'var(--hacer-c)' },
          { val: tF, label: 'Faltas', sub: '', color: 'var(--danger-bright)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 38, fontWeight: 900, lineHeight: 1, marginBottom: 4, color: s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>
              {s.label}
            </div>
            {s.sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Cards trimestre */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {trims.map(t => {
          const tots = course.students.map((_, i) => calcTotal(course, t, i)).filter((v): v is number => v !== null);
          const avg = tots.length ? Math.round(tots.reduce((a, b) => a + b, 0) / tots.length) : null;
          const attDays = Object.keys(course.attendance[t]).length;
          const withNotes = course.students.filter((_, i) => {
            const g = course.grades[t][i];
            return g && (g.ser.some(v => v !== null) || g.saber.some(v => v !== null) || g.hacer.some(v => v !== null));
          }).length;
          return (
            <div key={t} className="card">
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                {TRIM_LABELS[t]} Trimestre
              </div>
              <div style={{ marginBottom: 6 }}>
                <ScoreBadge value={avg} max={100} />
                {avg !== null && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>/100</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {attDays} dias · {withNotes}/{course.students.length} con notas
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-xs" onClick={() => setSection(`att${t}` as 'att1'|'att2'|'att3')}>
                  📅 Asistencia
                </button>
                <button className="btn btn-outline btn-xs" onClick={() => setSection(`cal${t}` as 'cal1'|'cal2'|'cal3')}>
                  📝 Calificaciones
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla ocultos */}
      {showOcultos && ocultos.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
            🙈 Estudiantes ocultos ({ocultos.length})
          </div>
          {ocultos.map((st, i) => {
            const idx = course.students.indexOf(st);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{st.nro}. {st.nombre}</span>
                <button className="btn btn-outline btn-xs" onClick={() => { restoreStudent(currentCourseId, idx); showToast(`${st.nombre} restaurado`, 'ok'); }}>
                  Restaurar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabla principal */}
      <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border2)', boxShadow: 'var(--shadow)', background: 'var(--card)' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
          <thead>
            <tr style={{ background: '#1a1610' }}>
              {['#', 'Estudiante', 'Sx', 'F.T1', 'F.T2', 'F.T3', 'Prom.T1', 'Prom.T2', 'Prom.T3', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '10px', fontSize: 12, fontWeight: 800,
                  whiteSpace: 'nowrap', textAlign: i <= 1 ? 'left' : 'center',
                  color: 'var(--gold-bright)', borderBottom: '2px solid var(--gold-l)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((st, fi) => {
              const i = course.students.indexOf(st);
              const f1 = countAtt(course, 1, i, 'F');
              const f2 = countAtt(course, 2, i, 'F');
              const f3 = countAtt(course, 3, i, 'F');
              const p1 = calcTotal(course, 1, i);
              const p2 = calcTotal(course, 2, i);
              const p3 = calcTotal(course, 3, i);
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fi * 0.02 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '7px 4px', textAlign: 'center', color: 'var(--muted)', fontSize: 12, width: 34 }}>
                    {st.nro}
                  </td>
                  <td style={{ padding: '7px 12px', fontWeight: 700, minWidth: 175 }}>
                    {st.nombre}
                    {st.manual && (
                      <span style={{
                        fontSize: 9, background: 'var(--warning)', color: '#000',
                        borderRadius: 3, padding: '1px 4px', fontWeight: 700, marginLeft: 4,
                      }}>TEMP</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{st.sexo}</td>
                  {[f1, f2, f3].map((f, fi2) => (
                    <td key={fi2} style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: f > 3 ? 'var(--danger-bright)' : 'var(--muted)' }}>
                        {f}
                      </span>
                    </td>
                  ))}
                  {[p1, p2, p3].map((p, pi) => (
                    <td key={pi} style={{ textAlign: 'center', padding: '4px 6px' }}>
                      <ScoreBadge value={p} max={100} />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Ocultar a ${st.nombre}?`)) {
                          hideStudent(currentCourseId, i);
                          showToast(`${st.nombre} ocultado`, 'ok');
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: .5 }}
                    >
                      🙈
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}