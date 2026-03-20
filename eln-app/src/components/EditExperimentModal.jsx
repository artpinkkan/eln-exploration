import { useState } from 'react'
import MultiSelect from './MultiSelect'

export default function EditExperimentModal({ experiment, onClose, onSave }) {
  const [name, setName] = useState(experiment.name)
  const [contributors, setContributors] = useState(experiment.contributorNames ?? [])
  const [operators, setOperators] = useState(experiment.operatorNames ?? [])
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Experiment name is required.')
      return
    }
    onSave({
      ...experiment,
      name: name.trim(),
      contributorNames: contributors,
      contributors: contributors.length,
      operatorNames: operators,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '18px' }}>edit</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Experiment</h2>
              <p className="text-[11px] text-slate-400">{experiment.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Experiment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="relative">
            <MultiSelect
              label="Contributors"
              selected={contributors}
              onChange={setContributors}
              placeholder="Select contributors..."
            />
          </div>

          <div className="relative">
            <MultiSelect
              label="Operators"
              selected={operators}
              onChange={setOperators}
              placeholder="Select operators..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
