import { useState } from 'react'

const INCLUDE_OPTIONS = [
  {
    key: 'materials',
    label: 'Materials & Formulation',
    description: 'Includes all phases, material codes, and theoretical quantities.',
    defaultChecked: true,
  },
  {
    key: 'procedure',
    label: 'Procedure & Protocol',
    description: 'Includes step-by-step instructions and critical process parameters.',
    defaultChecked: true,
  },
  {
    key: 'specs',
    label: 'Product Specifications',
    description: 'Includes release criteria and target physical properties.',
    defaultChecked: false,
  },
]

export default function SaveAsFormulaModal({ onClose }) {
  const [included, setIncluded] = useState({
    materials: true,
    procedure: true,
    specs: false,
  })
  const [sharedWithTeam, setSharedWithTeam] = useState(true)

  function toggleIncluded(key) {
    setIncluded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">auto_awesome_motion</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Save as Formula Template</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Convert this experiment into a reusable blueprint.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Basic fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Template Name</label>
              <input
                type="text"
                placeholder="e.g. Standard Emulsion Base v1"
                className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary placeholder:text-slate-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <select className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary">
                  <option>Emulsions</option>
                  <option>Serums</option>
                  <option>Ointments</option>
                  <option>Suspensions</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Version Tag</label>
                <input
                  type="text"
                  defaultValue="1.0.0"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Template Description</label>
              <textarea
                rows={3}
                placeholder="Describe the intended use and key characteristics of this template..."
                className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Include in Template */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Include in Template</label>
            <div className="grid grid-cols-1 gap-2">
              {INCLUDE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={included[opt.key]}
                    onChange={() => toggleIncluded(opt.key)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                    <p className="text-[11px] text-slate-500">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Shared with Team toggle */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">group</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Shared with Team</p>
                <p className="text-[11px] text-slate-500">Allow other team members to use this template.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sharedWithTeam}
                onChange={() => setSharedWithTeam((v) => !v)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-primary hover:bg-[#0f4637] text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}
