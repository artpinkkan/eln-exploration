import { useRef } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────

function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// Strip HTML tags to plain text for PDF sections that don't render HTML
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ── Sub-sections ──────────────────────────────────────────────────────────────

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-800">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
    </div>
  )
}

function InfoGrid({ fields }) {
  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
          <p className="text-xs text-slate-800 font-medium">{value || '—'}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ExportPDFModal({ onClose, stages = [], formulas = [], stepContent = {} }) {
  const printRef = useRef(null)

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Recipe &amp; Protocol Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 11px; color: #1e293b; background: white; padding: 0; }
    .page { width: 210mm; min-height: 297mm; padding: 20mm 18mm; margin: 0 auto; }
    h1 { font-size: 18px; font-weight: 700; }
    h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    h3 { font-size: 11px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 10px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .chip { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
    .chip-mat { background: #ede9fe; color: #7c3aed; }
    .chip-ins { background: #e0f2fe; color: #0369a1; }
    .badge { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid; }
    .badge-mat { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .badge-reagent { background: #ffedd5; color: #92400e; border-color: #fed7aa; }
    .badge-sample { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
    .section { margin-bottom: 20px; page-break-inside: avoid; }
    .divider { border: none; border-top: 2px solid #1e293b; margin-bottom: 8px; }
    .divider-light { border: none; border-top: 1px solid #e2e8f0; margin: 6px 0; }
    .footer { position: fixed; bottom: 10mm; left: 18mm; right: 18mm; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
      .page { padding: 15mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${content}
  </div>
  <div class="footer">
    <span>Recipe &amp; Protocol — Confidential</span>
    <span>Printed: ${today()}</span>
  </div>
</body>
</html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 400)
  }

  // Collect all procedures across formulas/stages
  const allProcedures = formulas.flatMap(formula => {
    const includedStages = stages.filter(s =>
      formula.includedStageIds.size === 0 || formula.includedStageIds.has(s.id)
    )
    return includedStages.flatMap(stage => {
      const key = `${formula.id}-${stage.id}`
      const procs = stepContent[key] ?? []
      return procs.map(p => ({ ...p, formulaName: formula.name, stageName: stage.name }))
    })
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-100 rounded-2xl shadow-2xl border border-slate-200 w-full flex flex-col overflow-hidden" style={{ maxWidth: '860px', maxHeight: '92vh' }}>

        {/* ── Modal header ── */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>picture_as_pdf</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">Export as PDF</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Preview your document before printing or saving.</p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>print</span>
            Print / Save PDF
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* ── Preview area ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* A4 paper shadow */}
          <div className="bg-white shadow-xl rounded-sm mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '20mm 18mm', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#1e293b' }}>
            <div ref={printRef}>

              {/* ── Cover header ── */}
              <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '3px solid #1e293b', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '4px' }}>Electronic Lab Notebook</p>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Recipe &amp; Protocol</h1>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Hydro Coco · testing 1</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9px', color: '#94a3b8' }}>Exported {today()}</p>
                  <div style={{ marginTop: '4px', display: 'inline-block', padding: '2px 8px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '9px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    In Progress
                  </div>
                </div>
              </div>

              {/* ── Experiment Info ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #1e293b' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Experiment Information</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <tbody>
                    {[
                      ['Project Name', 'project 3 - pinkan', 'Product Name', 'Hydro Coco'],
                      ['Experiment Name', 'testing 1', 'Status', 'In Progress'],
                      ['Manager', '—', 'Contributors', 'crdadmin, pharma'],
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 600, color: '#475569', width: '20%', border: '1px solid #e2e8f0' }}>{row[0]}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', width: '30%' }}>{row[1]}</td>
                        <td style={{ padding: '5px 8px', fontWeight: 600, color: '#475569', width: '20%', border: '1px solid #e2e8f0' }}>{row[2]}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', width: '30%' }}>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Materials & Formulation ── */}
              {stages.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #1e293b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Materials &amp; Formulation</span>
                  </div>
                  {stages.map((stage, si) => (
                    <div key={stage.id} style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        Stage {si + 1} — {stage.name}
                      </p>
                      {(stage.materials ?? []).length === 0 ? (
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>No materials added.</p>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Material</th>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch No</th>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Quantity</th>
                              <th style={{ padding: '5px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>% w/w</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stage.materials ?? []).map((mat, mi) => (
                              <tr key={mat.id} style={{ background: mi % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '9px', textAlign: 'center' }}>{mi + 1}</td>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', fontWeight: 500 }}>{mat.name || '—'}</td>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0' }}>
                                  <span style={{
                                    display: 'inline-block', padding: '1px 5px', borderRadius: '3px',
                                    fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid',
                                    background: mat.type === 'REAGENT' ? '#ffedd5' : mat.type === 'SAMPLE' ? '#e0f2fe' : '#d1fae5',
                                    color: mat.type === 'REAGENT' ? '#92400e' : mat.type === 'SAMPLE' ? '#075985' : '#065f46',
                                    borderColor: mat.type === 'REAGENT' ? '#fed7aa' : mat.type === 'SAMPLE' ? '#bae6fd' : '#a7f3d0',
                                  }}>{mat.type || 'MATERIAL'}</span>
                                </td>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', color: '#64748b', fontFamily: 'monospace', fontSize: '9px' }}>{mat.batchNo || '—'}</td>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace' }}>{mat.qty ? `${mat.qty} ${mat.uom || ''}` : '—'}</td>
                                <td style={{ padding: '5px 8px', border: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>{mat.percent ? `${mat.percent}%` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Procedure & Protocol ── */}
              {allProcedures.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #1e293b' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Procedure &amp; Protocol</span>
                  </div>
                  {allProcedures.map((proc, pi) => (
                    <div key={pi} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                      {/* Stage/Formula breadcrumb */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: '3px' }}>{proc.formulaName}</span>
                        <span style={{ fontSize: '9px', color: '#cbd5e1' }}>›</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '1px 6px', borderRadius: '3px' }}>{proc.stageName}</span>
                        <span style={{ fontSize: '9px', color: '#cbd5e1' }}>›</span>
                        <span style={{ fontSize: '9px', color: '#94a3b8' }}>Step {pi + 1}</span>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        {/* Procedure name row */}
                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', color: 'white', fontSize: '9px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{pi + 1}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{proc.title || 'Untitled Procedure'}</span>
                        </div>

                        {/* Description */}
                        {proc.description && (
                          <div style={{ padding: '8px 12px', borderBottom: (proc.criteria?.length > 0) ? '1px solid #e2e8f0' : 'none' }}>
                            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '4px' }}>Description</p>
                            <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: proc.description
                                .replace(/data-m="mat"/g, 'class="chip chip-mat"')
                                .replace(/data-m="ins"/g, 'class="chip chip-ins"')
                                .replace(/style="[^"]*"/g, '')
                              }}
                            />
                          </div>
                        )}

                        {/* Criteria table */}
                        {proc.criteria?.length > 0 && (
                          <div style={{ padding: '8px 12px' }}>
                            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '6px' }}>Criteria ({proc.criteria.length})</p>
                            <table>
                              <thead>
                                <tr>
                                  {['#', 'Criteria Name', 'Type', 'Unit / Range', 'Value (Execution)'].map(h => (
                                    <th key={h} style={{ padding: '4px 8px', background: '#f8fafc', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {proc.criteria.map((c, ci) => (
                                  <tr key={ci} style={{ background: ci % 2 === 0 ? 'white' : '#f8fafc' }}>
                                    <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '9px', textAlign: 'center', width: '28px' }}>{ci + 1}</td>
                                    <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0', fontWeight: 500 }}>{c.name}</td>
                                    <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0' }}>
                                      <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', padding: '1px 5px', borderRadius: '3px', background: '#f1f5f9', color: '#475569' }}>{c.inputType?.replace('_', ' ') || 'text'}</span>
                                    </td>
                                    <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0', color: '#64748b', fontFamily: 'monospace', fontSize: '9px' }}>
                                      {c.unit || (c.min != null || c.max != null ? `${c.minNA ? '—' : c.min} – ${c.maxNA ? '—' : c.max}` : '—')}
                                    </td>
                                    <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0', color: '#cbd5e1', fontStyle: 'italic', fontSize: '9px' }}>to be filled</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Signature block ── */}
              <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '16px' }}>Signatures</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                  {['Prepared By', 'Reviewed By', 'Approved By'].map(role => (
                    <div key={role}>
                      <div style={{ borderBottom: '1px solid #cbd5e1', marginBottom: '6px', paddingBottom: '24px' }} />
                      <p style={{ fontSize: '9px', fontWeight: 600, color: '#475569' }}>{role}</p>
                      <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Name / Date</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
