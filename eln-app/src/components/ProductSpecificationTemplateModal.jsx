import { useState, useMemo } from 'react'

/* ── Mock template data ──────────────────────── */
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: 'Specifications UAT',
    createdAt: '18-03-2026 14:41',
    createdBy: 'davin davin',
    parameters: [
      { parameter: 'pH Level',         specification: '6.5 – 7.5',             unit: 'pH'        },
      { parameter: 'Viscosity',         specification: '100 – 500',             unit: 'cP'        },
      { parameter: 'Moisture Content',  specification: '< 5',                   unit: '%'         },
      { parameter: 'Particle Size D50', specification: '< 200',                 unit: 'μm'        },
    ],
  },
  {
    id: 2,
    name: 'spec1',
    createdAt: '04-03-2026 09:56',
    createdBy: 'kenzie kenzie',
    parameters: [
      { parameter: 'Suhu Ruang', specification: '50', unit: 'fahrenheit' },
    ],
  },
  {
    id: 3,
    name: 'tes',
    createdAt: '03-03-2026 11:45',
    createdBy: 'kenzie kenzie',
    parameters: [
      { parameter: 'Temperature', specification: '25 ± 2', unit: '°C'   },
      { parameter: 'Humidity',    specification: '40 – 60', unit: '%RH' },
    ],
  },
  {
    id: 4,
    name: 'Specification experiment dummy',
    createdAt: '23-02-2026 14:26',
    createdBy: 'jopano jopano',
    parameters: [
      { parameter: 'Particle Size D50', specification: '< 200',                 unit: 'μm'   },
      { parameter: 'Bulk Density',      specification: '0.3 – 0.7',             unit: 'g/mL' },
      { parameter: 'Water Activity',    specification: '< 0.6',                 unit: 'aw'   },
      { parameter: 'Protein Content',   specification: '> 20',                  unit: '%'    },
    ],
  },
  {
    id: 5,
    name: 'Test specifications',
    createdAt: '23-02-2026 10:46',
    createdBy: 'jopano jopano',
    parameters: [
      { parameter: 'Appearance',  specification: 'White to off-white powder', unit: '—' },
      { parameter: 'Solubility',  specification: 'Freely soluble',            unit: '—' },
    ],
  },
]

function Avatar({ name }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
        {initials}
      </div>
      <span className="text-xs text-slate-600">{name}</span>
    </div>
  )
}

export default function ProductSpecificationTemplateModal({ onApply, onClose }) {
  const [search,         setSearch]         = useState('')
  const [selectedId,     setSelectedId]     = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [customTemplates, setCustomTemplates] = useState(() =>
    JSON.parse(localStorage.getItem('eln_spec_templates') || '[]')
  )

  const TEMPLATES = useMemo(() =>
    [...customTemplates, ...DEFAULT_TEMPLATES],
  [customTemplates])

  const filtered = useMemo(() =>
    TEMPLATES.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(search.toLowerCase())
    ),
  [search, TEMPLATES])

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? null

  function handleDeleteCustom(id) {
    const updated = customTemplates.filter((t) => t.id !== id)
    setCustomTemplates(updated)
    localStorage.setItem('eln_spec_templates', JSON.stringify(updated))
    if (selectedId === id) setSelectedId(null)
    setPendingDeleteId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl" style={{ maxHeight: '88vh' }}>

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>file_copy</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Apply Specification Template</h2>
              <p className="text-[11px] text-slate-400">Select a template to populate the specification table</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Available Specifications */}
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Specifications</h3>
              {selectedId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                  1 row selected
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }}>search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search specifications…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400"
              />
            </div>

            {/* Available specs table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-40">Created At</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-36">Created By</th>
                    <th className="px-3 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-400">No templates found</td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      pendingDeleteId === t.id ? (
                        /* ── Inline delete confirmation ── */
                        <tr key={t.id} className="bg-red-50">
                          <td colSpan={4} className="px-4 py-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-red-600 font-medium">
                                Delete <span className="font-bold">"{t.name}"</span>? This cannot be undone.
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPendingDeleteId(null) }}
                                  className="px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCustom(t.id) }}
                                  className="px-3 py-1 text-[11px] font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
                          className={`cursor-pointer transition-colors group ${
                            selectedId === t.id
                              ? 'bg-primary/5 border-l-2 border-l-primary'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {selectedId === t.id && (
                                <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '14px' }}>check_circle</span>
                              )}
                              <span className={`text-xs font-medium ${selectedId === t.id ? 'text-primary' : 'text-slate-800'}`}>
                                {t.name}
                              </span>
                              {t.custom && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-50 text-violet-500 border border-violet-200 shrink-0">
                                  Custom
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '11px' }}>schedule</span>
                              {t.createdAt}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <Avatar name={t.createdBy} />
                          </td>
                          <td className="px-3 py-2.5">
                            {t.custom && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(t.id) }}
                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                                title="Delete template"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Template preview */}
          <div className="px-6 pb-5">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '15px' }}>preview</span>
                <h3 className="text-xs font-bold text-slate-600">
                  {selected ? `Preview — ${selected.name}` : 'Template Preview'}
                </h3>
                {!selected && (
                  <span className="text-[10px] text-slate-400 ml-1">Select a specification above to preview</span>
                )}
              </div>

              {selected ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parameter</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specification</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.parameters.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 text-xs font-medium text-slate-800">{p.parameter}</td>
                        <td className="px-4 py-2 text-xs text-slate-600">{p.specification}</td>
                        <td className="px-4 py-2">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>table_view</span>
                  <p className="text-xs text-slate-400">No template selected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl shrink-0">
          <p className="text-[10px] text-slate-400">
            {selected
              ? `${selected.parameters.length} parameter${selected.parameters.length !== 1 ? 's' : ''} will be applied`
              : 'No template selected'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onApply(selected.parameters)}
              disabled={!selected}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Template
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
