import { useState } from 'react'

const STORAGE_KEY = 'eln_experiment_templates'

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const INCLUDE_OPTIONS = [
  {
    key: 'info',
    icon: 'group',
    label: 'Experiment Info & Collaborators',
    description: 'Project name, product, team members.',
  },
  {
    key: 'study',
    icon: 'description',
    label: 'Study Background',
    description: 'Background, study design, and objectives.',
  },
  {
    key: 'spec',
    icon: 'assignment_turned_in',
    label: 'Product Specification',
    description: 'Parameter table with specifications and units.',
  },
  {
    key: 'materials',
    icon: 'science',
    label: 'Materials & Formulation',
    description: 'Stages, material codes, and quantities.',
  },
  {
    key: 'procedure',
    icon: 'list_alt',
    label: 'Procedure & Protocol',
    description: 'Step-by-step procedures and criteria.',
  },
]

export default function SaveAsFormulaModal({ stages = [], formulas = [], stepContent = {}, studyBgHtml, specRows = [], collaboratorData, onClose }) {
  const [name,        setName]        = useState('')
  const [category,    setCategory]    = useState('Emulsions')
  const [version,     setVersion]     = useState('1.0.0')
  const [description, setDescription] = useState('')
  const [included,    setIncluded]    = useState({ info: true, study: true, spec: true, materials: true, procedure: true })
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  const totalMaterials = stages.reduce((sum, s) => sum + (s.materials?.length ?? 0), 0)
  const totalProcedures = Object.values(stepContent).reduce((sum, procs) => sum + procs.length, 0)

  function toggleIncluded(key) {
    setIncluded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    if (!name.trim()) { setError('Template name is required'); return }

    const existing = loadTemplates()
    const serialisedFormulas = formulas.map(f => ({
      ...f,
      includedStageIds: [...f.includedStageIds],   // Set → Array for JSON
    }))

    const template = {
      id:          `exp-tpl-${Date.now()}`,
      name:        name.trim(),
      category,
      version,
      description: description.trim(),
      createdAt:   formatDate(new Date()),
      summary: {
        stages:     stages.length,
        formulas:   formulas.length,
        materials:  totalMaterials,
        procedures: totalProcedures,
      },
      data: {
        stages:           included.materials ? stages            : [],
        formulas:         included.materials ? serialisedFormulas : [],
        stepContent:      included.procedure ? stepContent        : {},
        studyBgHtml:      included.study     ? (studyBgHtml ?? null) : null,
        specRows:         included.spec      ? specRows           : [],
        collaboratorData: included.info      ? (collaboratorData ?? null) : null,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([template, ...existing]))
    setSaved(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome_motion</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Save as Experiment Template</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Convert this experiment into a reusable blueprint.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">

          {/* Snapshot summary */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Stages',     value: stages.length,     icon: 'layers'     },
              { label: 'Formulas',   value: formulas.length,   icon: 'science'    },
              { label: 'Materials',  value: totalMaterials,    icon: 'colorize'   },
              { label: 'Procedures', value: totalProcedures,   icon: 'list_alt'   },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Template Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Standard Emulsion Base v1"
              className={`w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400 ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
            />
            {error && <p className="text-[10px] text-red-500">{error}</p>}
          </div>

          {/* Category + Version */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {['Emulsions','Serums','Ointments','Suspensions','Tablets','Capsules','Others'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Version</label>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the intended use and key characteristics..."
              className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400 resize-none"
            />
          </div>

          {/* Include in Template */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Include in Template</label>
            <div className="space-y-2">
              {INCLUDE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    included[opt.key]
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${included[opt.key] ? 'bg-primary/15 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[17px]">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={included[opt.key]}
                    onChange={() => toggleIncluded(opt.key)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">Saved locally — accessible from "Apply Template".</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {saved
                ? <><span className="material-symbols-outlined text-[14px]">check_circle</span>Saved!</>
                : <><span className="material-symbols-outlined text-[14px]">bookmark_add</span>Save Template</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
