import { useState } from 'react'
import MultiSelect from './MultiSelect'

export default function CreateExperimentModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [contributors, setContributors] = useState([])
  const [operators, setOperators] = useState([])
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Experiment name is required.')
      return
    }
    onCreate({ name: name.trim(), contributors, operators })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>science</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Experiment</h2>
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
              placeholder="e.g. Neural Growth Assay #B01"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 placeholder:text-slate-400"
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
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Create Experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
