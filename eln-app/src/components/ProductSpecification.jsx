import { useState, useRef } from 'react'
import ProductSpecificationTemplateModal from './ProductSpecificationTemplateModal'

const COLUMNS = ['Parameter', 'Specification', 'Unit']
const STORAGE_KEY = 'eln_spec_templates'

function saveTemplateToStorage(name, parameters) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const newTemplate = {
    id: `custom-${Date.now()}`,
    name,
    createdAt: (() => {
      const d = new Date()
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${dd}-${mm}-${d.getFullYear()} ${hh}:${min}`
    })(),
    createdBy: 'pinkan pinkan',
    custom: true,
    parameters,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newTemplate, ...existing]))
}

function SaveAsTemplateModal({ parameters, onClose }) {
  const [name,  setName]  = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) { setError('Template name is required'); return }
    saveTemplateToStorage(name.trim(), parameters)
    setSaved(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px' }}>bookmark_add</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Save as Template</h3>
              <p className="text-[11px] text-slate-400">{parameters.length} parameter{parameters.length !== 1 ? 's' : ''} will be saved</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Hydro Coco Standard Spec"
              className={`w-full text-xs px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400 ${error ? 'border-red-400' : 'border-slate-200'}`}
            />
            {error && <p className="text-[10px] text-red-500">{error}</p>}
          </div>

          {/* Preview of parameters */}
          <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parameters to save</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
              {parameters.map((p, i) => (
                <div key={i} className="px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs text-slate-700">{p.parameter || <span className="italic text-slate-400">Untitled</span>}</span>
                  <span className="text-[10px] font-mono text-slate-400">{p.unit || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {saved
              ? <><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check_circle</span>Saved!</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>bookmark_add</span>Save Template</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductSpecification({ isEditing = false }) {
  const [rows,           setRows]           = useState([])
  const [showTemplate,   setShowTemplate]   = useState(false)
  const [showSaveAs,     setShowSaveAs]     = useState(false)
  const [collapsed,      setCollapsed]      = useState(false)
  const [saveStatus,     setSaveStatus]     = useState(null) // null | 'saving' | 'saved'
  const saveTimerRef = useRef(null)

  function triggerAutoSave() {
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus('saved'), 800)
  }

  function handleApplyTemplate(parameters) {
    setRows(parameters.map((p, i) => ({ id: i + 1, ...p })))
    setShowTemplate(false)
    triggerAutoSave()
  }

  function handleDeleteRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id))
    triggerAutoSave()
  }

  function handleAddRow() {
    const id = Date.now()
    setRows((prev) => [...prev, { id, parameter: '', specification: '', unit: '' }])
    triggerAutoSave()
  }

  function handleCellChange(id, field, value) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
    triggerAutoSave()
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>assignment_turned_in</span>
            Product Specification
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 ml-1">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '11px' }}>autorenew</span>
                Saving…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 ml-1">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                Automatically saved
              </span>
            )}
          </h2>

          <div className="flex items-center gap-2">
            {/* Apply Template — only in editing mode */}
            {isEditing && (
              <button
                onClick={() => setShowTemplate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary bg-primary/5 rounded-lg text-xs font-semibold hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>file_copy</span>
                Apply Template
              </button>
            )}

            {/* Save as Template — only in editing mode with rows */}
            {isEditing && rows.length > 0 && (
              <button
                onClick={() => setShowSaveAs(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bookmark_add</span>
                Save as Template
              </button>
            )}

            {/* Add row — only in editing mode */}
            {isEditing && (
              <button
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                Add Row
              </button>
            )}

            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {collapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        {!collapsed && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {isEditing && <th className="px-3 py-2.5 w-8" />}
                    <th className="px-3 py-2.5 text-[10px] font-bold text-slate-400 w-8 text-right">#</th>
                    {COLUMNS.map((col) => (
                      <th key={col} className="px-5 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={isEditing ? 5 : 4} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '36px' }}>assignment_turned_in</span>
                          <span className="text-xs text-slate-400 font-medium">No specifications yet</span>
                          {isEditing && (
                            <p className="text-[10px] text-slate-400">
                              Use <span className="font-semibold">Apply Template</span> to populate from a saved template, or <span className="font-semibold">Add Row</span> to enter manually.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.id} className={`transition-colors ${isEditing ? 'hover:bg-slate-50/60' : ''}`}>
                        {/* Delete */}
                        {isEditing && (
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </td>
                        )}

                        {/* Row number */}
                        <td className="px-3 py-2.5 text-[10px] text-slate-400 font-mono text-right w-8">{idx + 1}</td>

                        {/* Parameter */}
                        <td className="px-5 py-2.5">
                          {isEditing ? (
                            <input
                              value={row.parameter}
                              onChange={(e) => handleCellChange(row.id, 'parameter', e.target.value)}
                              className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Parameter name"
                            />
                          ) : (
                            <span className="text-xs font-medium text-slate-800">{row.parameter}</span>
                          )}
                        </td>

                        {/* Specification */}
                        <td className="px-5 py-2.5">
                          {isEditing ? (
                            <input
                              value={row.specification}
                              onChange={(e) => handleCellChange(row.id, 'specification', e.target.value)}
                              className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="e.g. 6.5 – 7.5"
                            />
                          ) : (
                            <span className="text-xs text-slate-700">{row.specification}</span>
                          )}
                        </td>

                        {/* Unit */}
                        <td className="px-5 py-2.5">
                          {isEditing ? (
                            <input
                              value={row.unit}
                              onChange={(e) => handleCellChange(row.id, 'unit', e.target.value)}
                              className="w-28 text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Unit"
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{row.unit || '—'}</span>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {rows.length > 0 && (
              <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{rows.length} parameter{rows.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Template modal ── */}
      {showTemplate && (
        <ProductSpecificationTemplateModal
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplate(false)}
        />
      )}

      {/* ── Save as Template modal ── */}
      {showSaveAs && (
        <SaveAsTemplateModal
          parameters={rows}
          onClose={() => setShowSaveAs(false)}
        />
      )}
    </>
  )
}
