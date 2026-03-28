import { useState, useRef, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'


let nextProcedureId = 1
let nextCriteriaId = 1

const INPUT_TYPES = [
  { value: 'text',          label: 'Text',             cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  { value: 'number',        label: 'Number',           cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'date',          label: 'Date',             cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'yes_no',        label: 'Yes / No',         cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  { value: 'custom_option', label: 'Custom Option',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { value: 'matrix_table',  label: 'Matrix Table',     cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  { value: 'image',         label: 'Image Attachment', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
]

const CRITERIA_PRESETS = [
  'Temperature', 'pH Level', 'Viscosity', 'Density', 'Particle Size',
  'Moisture Content', 'Dissolution Rate', 'Melting Point', 'Boiling Point',
  'Turbidity', 'Color', 'Odor', 'Appearance', 'Mixing Speed', 'Pressure',
  'Yield', 'Purity', 'Water Activity', 'Hardness', 'Friability',
]

let criteriaNamePool = [...CRITERIA_PRESETS]
let nextMatrixRowId = 1
let nextMatrixColId = 1

const MATRIX_CELL_TYPES = [
  { value: 'text',     label: 'Text'     },
  { value: 'number',   label: 'Number'   },
  { value: 'date',     label: 'Date'     },
  { value: 'yes_no',   label: 'Yes / No' },
  { value: 'checkbox', label: 'Checkbox' },
]

// ── Matrix Config Modal ───────────────────────────────────────────────────────

function MatrixConfigModal({ initialName = '', initialDescription = '', initialRows = [], initialColumns = [], onSave, onClose }) {
  const [name,        setName]        = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [nameError,   setNameError]   = useState('')

  const [rows, setRows] = useState(
    initialRows.length > 0
      ? initialRows
      : [{ id: nextMatrixRowId++, rowName: '', cellType: 'number', unit: '', dateFormat: 'DD/MM/YYYY', min: '', max: '', minNA: true, maxNA: true }]
  )
  const [cols, setCols] = useState(
    initialColumns.length > 0
      ? initialColumns
      : [
          { id: nextMatrixColId++, name: 'Column 1' },
          { id: nextMatrixColId++, name: 'Column 2' },
        ]
  )

  const addRow    = ()             => setRows(r => [...r, { id: nextMatrixRowId++, rowName: '', cellType: 'number', unit: '', dateFormat: 'DD/MM/YYYY' }])
  const removeRow = (id)           => setRows(r => r.filter(r => r.id !== id))
  const updateRow = (id, field, v) => setRows(r => r.map(r => r.id === id ? { ...r, [field]: v } : r))

  const addCol    = ()             => setCols(c => [...c, { id: nextMatrixColId++, name: `Column ${c.length + 1}` }])
  const removeCol = (id)           => setCols(c => c.filter(c => c.id !== id))
  const updateCol = (id, v)        => setCols(c => c.map(c => c.id === id ? { ...c, name: v } : c))

  function handleSave() {
    if (!name.trim()) { setNameError('Name is required'); return }
    if (!criteriaNamePool.includes(name.trim())) criteriaNamePool = [...criteriaNamePool, name.trim()]
    onSave({ name: name.trim(), inputType: 'matrix_table', unit: '', description, matrixRows: rows, matrixColumns: cols })
  }

  const namedRows = rows.filter(r => r.rowName.trim())
  const namedCols = cols.filter(c => c.name.trim())

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-[18px]">table_chart</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Configure Matrix Table</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Define the criteria rows and columns for this matrix.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Criteria name + description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Criteria Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                list="criteria-name-list"
                value={name}
                onChange={e => { setName(e.target.value); setNameError('') }}
                placeholder="e.g. Temperature Stability"
                autoFocus
                className={`w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none ${nameError ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
              />
              {nameError && <p className="text-[10px] text-red-500 mt-0.5">{nameError}</p>}
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional"
                className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Rows + Columns side by side */}
          <div className="grid grid-cols-2 gap-4">

            {/* ── Rows ── */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria Rows</p>
              <p className="text-[10px] text-slate-400 mb-2">Define each measurement criteria (row name, cell type, unit).</p>
              <datalist id="matrix-row-name-list">
                {criteriaNamePool.map(n => <option key={n} value={n} />)}
              </datalist>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-[24px_1fr_100px_96px_24px] gap-x-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <span>#</span><span>Row Name</span><span>Cell Type</span><span>Unit / Format</span><span />
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row, idx) => (
                    <div key={row.id}>
                      <div className="grid grid-cols-[24px_1fr_100px_96px_24px] gap-x-2 items-center px-3 py-2">
                        <span className="text-[10px] text-slate-400 font-mono">{idx + 1}</span>
                        <input
                          type="text"
                          list="matrix-row-name-list"
                          value={row.rowName}
                          onChange={e => updateRow(row.id, 'rowName', e.target.value)}
                          placeholder={`Row ${idx + 1}`}
                          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none min-w-0"
                        />
                        <select
                          value={row.cellType}
                          onChange={e => {
                            const v = e.target.value
                            updateRow(row.id, 'cellType', v)
                            if (v === 'date') updateRow(row.id, 'unit', '')
                          }}
                          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                          {MATRIX_CELL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {row.cellType === 'date' ? (
                          <select
                            value={row.dateFormat ?? 'DD/MM/YYYY'}
                            onChange={e => updateRow(row.id, 'dateFormat', e.target.value)}
                            className="text-xs bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.unit}
                            onChange={e => updateRow(row.id, 'unit', e.target.value)}
                            placeholder="Unit"
                            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        )}
                        <button
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1}
                          className="text-slate-300 hover:text-red-400 disabled:opacity-20 transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                      {row.cellType === 'number' && (
                        <div className="flex items-center gap-3 px-3 pb-2.5 bg-blue-50/60 dark:bg-blue-900/10">
                          <span className="w-6 shrink-0" />
                          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider shrink-0">Range</span>
                          {/* Min */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-400">Min</span>
                            {(row.minNA ?? true) ? (
                              <button
                                onClick={() => updateRow(row.id, 'minNA', false)}
                                className="text-[10px] text-slate-400 italic px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary transition-colors"
                              >No limit</button>
                            ) : (
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={row.min ?? ''}
                                  onChange={e => updateRow(row.id, 'min', e.target.value)}
                                  placeholder="Value"
                                  autoFocus
                                  className="w-16 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <button
                                  onClick={() => { updateRow(row.id, 'minNA', true); updateRow(row.id, 'min', '') }}
                                  className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                                  title="Reset to No limit"
                                >
                                  <span className="material-symbols-outlined text-[13px]">close</span>
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-slate-300 text-xs">–</span>
                          {/* Max */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-400">Max</span>
                            {(row.maxNA ?? true) ? (
                              <button
                                onClick={() => updateRow(row.id, 'maxNA', false)}
                                className="text-[10px] text-slate-400 italic px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary transition-colors"
                              >No limit</button>
                            ) : (
                              <div className="flex items-center gap-0.5">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={row.max ?? ''}
                                  onChange={e => updateRow(row.id, 'max', e.target.value)}
                                  placeholder="Value"
                                  autoFocus
                                  className="w-16 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <button
                                  onClick={() => { updateRow(row.id, 'maxNA', true); updateRow(row.id, 'max', '') }}
                                  className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                                  title="Reset to No limit"
                                >
                                  <span className="material-symbols-outlined text-[13px]">close</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={addRow} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">
                    <span className="material-symbols-outlined text-[13px]">add_circle</span> Add Row
                  </button>
                </div>
              </div>
            </div>

            {/* ── Columns ── */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Columns</p>
              <p className="text-[10px] text-slate-400 mb-2">Define the column headers users will fill in during execution.</p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-[24px_1fr_24px] gap-x-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <span>#</span><span>Column Name</span><span />
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cols.map((col, idx) => (
                    <div key={col.id} className="grid grid-cols-[24px_1fr_24px] gap-x-2 items-center px-3 py-2">
                      <span className="text-[10px] text-slate-400 font-mono">{idx + 1}</span>
                      <input
                        type="text"
                        value={col.name}
                        onChange={e => updateCol(col.id, e.target.value)}
                        placeholder={`Column ${idx + 1}`}
                        className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <button
                        onClick={() => removeCol(col.id)}
                        disabled={cols.length === 1}
                        className="text-slate-300 hover:text-red-400 disabled:opacity-20 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={addCol} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">
                    <span className="material-symbols-outlined text-[13px]">add_circle</span> Add Column
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(namedRows.length > 0 || namedCols.length > 0) && (
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview</p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-600 dark:text-slate-300 w-40 shrink-0 border-r border-slate-200 dark:border-slate-700">
                        {name || 'Criteria'}
                      </th>
                      {(namedCols.length > 0 ? namedCols : cols).map(col => (
                        <th key={col.id} className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 min-w-[100px]">
                          {col.name || '—'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(namedRows.length > 0 ? namedRows : rows).map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.rowName || <span className="text-slate-300 italic">Unnamed</span>}
                          {row.cellType === 'date'
                            ? <span className="text-[10px] font-mono text-purple-400 ml-1">{row.dateFormat ?? 'DD/MM/YYYY'}</span>
                            : row.cellType === 'number' && (!(row.minNA ?? true) || !(row.maxNA ?? true))
                              ? <span className="text-[10px] font-mono text-blue-400 ml-1">[{!(row.minNA ?? true) ? row.min : '∞'} – {!(row.maxNA ?? true) ? row.max : '∞'}]</span>
                              : row.unit && <span className="text-[10px] text-slate-400 font-normal ml-1">({row.unit})</span>
                          }
                        </td>
                        {(namedCols.length > 0 ? namedCols : cols).map(col => (
                          <td key={col.id} className="px-3 py-2 text-center border-l border-slate-100 dark:border-slate-800 text-slate-300 text-[10px] italic">
                            {row.cellType === 'yes_no' ? 'Yes / No'
                              : row.cellType === 'checkbox' ? '☐'
                              : row.cellType === 'date' ? (row.dateFormat ?? 'DD/MM/YYYY')
                              : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0 rounded-b-xl">
          <span className="text-[10px] text-slate-400">
            {rows.length} row{rows.length !== 1 ? 's' : ''} · {cols.length} column{cols.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors">
              Save Criteria
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Procedure Card ────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', inputType: 'text', unit: '', description: '', customOptions: [], min: '', max: '', minNA: true, maxNA: true }

function ProcedureCard({
  procedure, index,
  onUpdate, onDelete, onDuplicate,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
  materials,
}) {
  const descRef = useRef(null)

  const [menuOpen,             setMenuOpen]             = useState(false)
  const [showAddForm,          setShowAddForm]          = useState(false)
  const [addForm,              setAddForm]              = useState(EMPTY_FORM)
  const [formError,            setFormError]            = useState('')
  const [showMatrixModal,      setShowMatrixModal]      = useState(false)
  const [expandedCriteria,     setExpandedCriteria]     = useState(null)
  const [editingCriteriaId,    setEditingCriteriaId]    = useState(null)
  const [editingMatrixCriteria,setEditingMatrixCriteria]= useState(null)

  const removeCriteria = (cId) =>
    onUpdate({ ...procedure, criteria: procedure.criteria.filter(c => c.id !== cId) })

  function handleAddCriteria() {
    if (addForm.inputType === 'matrix_table') { setShowMatrixModal(true); return }
    if (!addForm.name.trim()) { setFormError('Name is required'); return }
    if (!criteriaNamePool.includes(addForm.name.trim()))
      criteriaNamePool = [...criteriaNamePool, addForm.name.trim()]
    if (editingCriteriaId !== null) {
      onUpdate({ ...procedure, criteria: procedure.criteria.map(c => c.id === editingCriteriaId ? { ...c, ...addForm, name: addForm.name.trim() } : c) })
      setEditingCriteriaId(null)
    } else {
      onUpdate({ ...procedure, criteria: [...procedure.criteria, { id: nextCriteriaId++, ...addForm, name: addForm.name.trim() }] })
    }
    setAddForm(EMPTY_FORM)
    setFormError('')
    setShowAddForm(false)
  }

  function handleMatrixSave(criteriaData) {
    if (editingMatrixCriteria !== null) {
      onUpdate({ ...procedure, criteria: procedure.criteria.map(c => c.id === editingMatrixCriteria.id ? { ...c, ...criteriaData } : c) })
      setEditingMatrixCriteria(null)
    } else {
      onUpdate({ ...procedure, criteria: [...procedure.criteria, { id: nextCriteriaId++, ...criteriaData }] })
    }
    setShowMatrixModal(false)
    setAddForm(EMPTY_FORM)
    setShowAddForm(false)
  }

  function handleEditCriteria(c) {
    setEditingCriteriaId(c.id)
    setAddForm({ name: c.name, inputType: c.inputType, unit: c.unit ?? '', description: c.description ?? '', customOptions: c.customOptions ?? [], min: c.min ?? '', max: c.max ?? '', minNA: c.minNA ?? true, maxNA: c.maxNA ?? true })
    setFormError('')
    setShowAddForm(true)
  }

  function handleEditMatrixCriteria(c) {
    setEditingMatrixCriteria(c)
    setShowMatrixModal(true)
  }

  function cancelAddForm() {
    setAddForm(EMPTY_FORM)
    setFormError('')
    setShowAddForm(false)
    setEditingCriteriaId(null)
    setEditingMatrixCriteria(null)
  }

  return (
    <>
    <div
      className={`rounded-lg border overflow-hidden flex flex-col md:flex-row transition-colors ${isDragOver && !isDragging ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'} ${isDragging ? 'opacity-40' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDrop={(e) => { e.preventDefault(); onDrop() }}
    >
      {/* Left — title + description */}
      <div className="flex-1 min-w-0 p-4 flex gap-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
        <span
          className="material-symbols-outlined text-slate-300 hover:text-slate-500 text-lg cursor-grab active:cursor-grabbing select-none mt-0.5 shrink-0"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          drag_indicator
        </span>
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-300 shrink-0">#{index}</span>
            <input
              type="text"
              value={procedure.title}
              onChange={e => onUpdate({ ...procedure, title: e.target.value })}
              placeholder="Procedure name"
              className="flex-1 min-w-0 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            {/* Options menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 text-slate-300 hover:text-slate-500 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 overflow-hidden">
                    <button
                      onClick={() => { onDuplicate(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span> Duplicate
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <RichTextEditor
            ref={descRef}
            isEditing
            defaultHtml={procedure.description || ''}
            materials={materials}
            minHeight="120px"
            onChange={() => onUpdate({ ...procedure, description: descRef.current?.innerHTML ?? '' })}
          />
        </div>
      </div>

      {/* Right — criteria */}
      <div className="w-full md:w-[400px] bg-slate-50/50 dark:bg-slate-900/30 p-4 shrink-0 flex flex-col gap-2">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Criteria</p>

        {/* Criteria list */}
        {procedure.criteria.length > 0 && (
          <div className="space-y-1.5">
            {procedure.criteria.map(c => {
              const typeInfo = INPUT_TYPES.find(t => t.value === c.inputType) ?? INPUT_TYPES[0]

              if (c.inputType === 'matrix_table') {
                const isExpanded = expandedCriteria === c.id
                return (
                  <div key={c.id} className="bg-white dark:bg-slate-800 rounded-lg border border-teal-200 dark:border-teal-800 overflow-hidden">
                    <div className="flex items-center gap-2 px-2.5 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeInfo.cls}`}>
                            Matrix Table
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {c.matrixRows?.length || 0} row{(c.matrixRows?.length || 0) !== 1 ? 's' : ''} · {c.matrixColumns?.length || 0} col{(c.matrixColumns?.length || 0) !== 1 ? 's' : ''}
                          {c.description && ` · ${c.description}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedCriteria(isExpanded ? null : c.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors shrink-0"
                        title={isExpanded ? 'Hide table' : 'Show execution table'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEditMatrixCriteria(c)}
                        className="text-slate-300 hover:text-primary transition-colors shrink-0"
                        title="Edit criteria"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button
                        onClick={() => removeCriteria(c.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-teal-100 dark:border-teal-900 overflow-x-auto">
                        <table className="text-xs w-full">
                          <thead>
                            <tr className="bg-teal-50/60 dark:bg-teal-900/20 border-b border-teal-100 dark:border-teal-900">
                              <th className="px-3 py-1.5 text-left text-[9px] font-bold text-teal-600 dark:text-teal-400 border-r border-teal-100 dark:border-teal-900 w-28 shrink-0">{c.name}</th>
                              {c.matrixColumns?.map(col => (
                                <th key={col.id} className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-500 dark:text-slate-400 border-l border-teal-100 dark:border-teal-900 min-w-[80px]">{col.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-teal-50 dark:divide-teal-900/30">
                            {c.matrixRows?.map((row, ri) => (
                              <tr key={row.id ?? ri}>
                                <td className="px-3 py-1.5 border-r border-teal-100 dark:border-teal-900 align-middle">
                                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{row.rowName || `Row ${ri + 1}`}</span>
                                  {row.cellType === 'date'
                                    ? <span className="text-[9px] font-mono text-purple-400 ml-1">{row.dateFormat ?? 'DD/MM/YYYY'}</span>
                                    : row.unit ? <span className="text-[9px] text-slate-400 ml-1">({row.unit})</span> : null}
                                </td>
                                {c.matrixColumns?.map(col => (
                                  <td key={col.id} className="px-1.5 py-1.5 border-l border-teal-50 dark:border-teal-900/30">
                                    {row.cellType === 'yes_no' ? (
                                      <select disabled className="w-full text-[10px] px-1.5 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded cursor-not-allowed text-slate-400">
                                        <option>Yes / No</option>
                                      </select>
                                    ) : row.cellType === 'checkbox' ? (
                                      <div className="flex justify-center">
                                        <input type="checkbox" disabled className="w-3.5 h-3.5 cursor-not-allowed opacity-40" />
                                      </div>
                                    ) : row.cellType === 'date' ? (
                                      <input disabled type="text" placeholder={row.dateFormat ?? 'DD/MM/YYYY'}
                                        className="w-full text-[10px] px-1.5 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded cursor-not-allowed text-slate-400 placeholder-slate-300" />
                                    ) : (
                                      <input disabled type="text" placeholder="—"
                                        className="w-full text-[10px] px-1.5 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded cursor-not-allowed text-slate-400 placeholder-slate-300" />
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <div key={c.id} className="flex items-start gap-2 px-2.5 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeInfo.cls}`}>
                        {typeInfo.label}
                      </span>
                      {c.unit && <span className="text-[10px] font-mono text-slate-400">{c.unit}</span>}
                      {c.inputType === 'number' && (!(c.minNA ?? true) || !(c.maxNA ?? true)) && (
                        <span className="text-[9px] font-mono text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                          {!(c.minNA ?? true) ? c.min : '∞'} – {!(c.maxNA ?? true) ? c.max : '∞'}
                        </span>
                      )}
                    </div>
                    {c.description && c.inputType !== 'image' && (
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                    )}
                    {c.inputType === 'custom_option' && c.customOptions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.customOptions.slice(0, 4).map((opt, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700 rounded">{opt}</span>
                        ))}
                        {c.customOptions.length > 4 && (
                          <span className="text-[9px] text-slate-400 italic">+{c.customOptions.length - 4} more</span>
                        )}
                      </div>
                    )}
                    {/* Execution input slot */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {c.inputType === 'text' && (
                        <input disabled type="text" placeholder="Enter text…"
                          className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 placeholder-slate-300 cursor-not-allowed" />
                      )}
                      {c.inputType === 'number' && (
                        <div className="flex items-center gap-2">
                          <input disabled type="text" placeholder={c.unit ? `0 ${c.unit}` : '0'}
                            className="flex-1 text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 placeholder-slate-300 cursor-not-allowed" />
                          {(!(c.minNA ?? true) || !(c.maxNA ?? true)) && (
                            <span className="text-[9px] font-mono text-blue-300 shrink-0">
                              {!(c.minNA ?? true) ? c.min : '∞'} – {!(c.maxNA ?? true) ? c.max : '∞'}
                            </span>
                          )}
                        </div>
                      )}
                      {c.inputType === 'date' && (
                        <input disabled type="text" placeholder="DD/MM/YYYY"
                          className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 placeholder-slate-300 cursor-not-allowed" />
                      )}
                      {c.inputType === 'yes_no' && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                            <input type="radio" disabled className="w-3 h-3 accent-primary" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                            <input type="radio" disabled className="w-3 h-3 accent-primary" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">No</span>
                          </label>
                        </div>
                      )}
                      {c.inputType === 'custom_option' && (
                        <select disabled className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 cursor-not-allowed">
                          <option>Select an option…</option>
                          {c.customOptions?.map((opt, i) => <option key={i}>{opt}</option>)}
                        </select>
                      )}
                      {c.inputType === 'image' && (
                        <div className="flex items-center gap-2 px-2.5 py-2 border border-dashed border-pink-200 dark:border-pink-800 rounded-lg bg-pink-50/50 dark:bg-pink-900/10 cursor-not-allowed">
                          <span className="material-symbols-outlined text-pink-300 dark:text-pink-600 text-[16px] shrink-0">add_photo_alternate</span>
                          <span className="text-[10px] text-pink-400 dark:text-pink-500 italic">Upload image / file</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditCriteria(c)}
                    className="text-slate-300 hover:text-primary transition-colors shrink-0 mt-0.5"
                    title="Edit criteria"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                  <button
                    onClick={() => removeCriteria(c.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Add / Edit criteria inline form */}
        {showAddForm ? (
          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/30 space-y-2.5">
            {/* Criteria Name */}
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Criteria Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                list="criteria-name-list"
                value={addForm.name}
                onChange={e => { setAddForm(f => ({ ...f, name: e.target.value })); setFormError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAddCriteria()}
                placeholder="e.g. Temperature"
                autoFocus
                className={`w-full mt-1 text-xs bg-slate-50 dark:bg-slate-700 border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none ${formError ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
              />
              <datalist id="criteria-name-list">
                {criteriaNamePool.map(n => <option key={n} value={n} />)}
              </datalist>
              {formError && <p className="text-[10px] text-red-500 mt-0.5">{formError}</p>}
            </div>

            {/* Input Type */}
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Input Type</label>
              <select
                value={addForm.inputType}
                onChange={e => setAddForm(f => ({ ...f, inputType: e.target.value }))}
                className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {INPUT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Unit + Description — hidden for matrix table (handled in modal) */}
            {addForm.inputType !== 'matrix_table' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unit</label>
                  <input
                    type="text"
                    value={addForm.unit}
                    onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="e.g. °C, mL, kg"
                    className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <input
                    type="text"
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional"
                    className="w-full mt-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Number range */}
            {addForm.inputType === 'number' && (
              <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50/60 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider shrink-0">Range</span>
                {/* Min */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">Min</span>
                  {(addForm.minNA ?? true) ? (
                    <button
                      onClick={() => setAddForm(f => ({ ...f, minNA: false }))}
                      className="text-[10px] text-slate-400 italic px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary transition-colors"
                    >No limit</button>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={addForm.min}
                        onChange={e => setAddForm(f => ({ ...f, min: e.target.value }))}
                        placeholder="Value"
                        autoFocus
                        className="w-16 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <button
                        onClick={() => setAddForm(f => ({ ...f, minNA: true, min: '' }))}
                        className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                        title="Reset to No limit"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-slate-300 text-xs">–</span>
                {/* Max */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">Max</span>
                  {(addForm.maxNA ?? true) ? (
                    <button
                      onClick={() => setAddForm(f => ({ ...f, maxNA: false }))}
                      className="text-[10px] text-slate-400 italic px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:text-primary transition-colors"
                    >No limit</button>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={addForm.max}
                        onChange={e => setAddForm(f => ({ ...f, max: e.target.value }))}
                        placeholder="Value"
                        autoFocus
                        className="w-16 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <button
                        onClick={() => setAddForm(f => ({ ...f, maxNA: true, max: '' }))}
                        className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                        title="Reset to No limit"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom options builder */}
            {addForm.inputType === 'custom_option' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Options <span className="text-red-400">*</span>
                </label>
                {addForm.customOptions.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No options yet — add at least one.</p>
                )}
                {addForm.customOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-300 font-mono w-4 text-right shrink-0">{idx + 1}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => setAddForm(f => ({ ...f, customOptions: f.customOptions.map((o, i) => i === idx ? e.target.value : o) }))}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <button
                      onClick={() => setAddForm(f => ({ ...f, customOptions: f.customOptions.filter((_, i) => i !== idx) }))}
                      className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAddForm(f => ({ ...f, customOptions: [...f.customOptions, ''] }))}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">add_circle</span> Add Option
                </button>
              </div>
            )}

            {/* Matrix table hint */}
            {addForm.inputType === 'matrix_table' && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                <span className="material-symbols-outlined text-teal-500 text-[16px] shrink-0">table_chart</span>
                <p className="text-[10px] text-teal-700 dark:text-teal-300 flex-1">
                  Click <strong>Configure →</strong> to define the table rows, cell types, and units in a dedicated editor.
                </p>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-1.5 pt-0.5">
              <button
                onClick={cancelAddForm}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCriteria}
                className="px-3 py-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-1"
              >
                {addForm.inputType === 'matrix_table' ? (
                  <>Configure <span className="material-symbols-outlined text-[13px]">arrow_forward</span></>
                ) : editingCriteriaId !== null ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="self-start inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined text-[13px]">add_circle</span> Add Criteria
          </button>
        )}
      </div>
    </div>

    {showMatrixModal && (
      <MatrixConfigModal
        initialName={editingMatrixCriteria ? editingMatrixCriteria.name : addForm.name}
        initialDescription={editingMatrixCriteria ? editingMatrixCriteria.description ?? '' : addForm.description}
        initialRows={editingMatrixCriteria ? editingMatrixCriteria.matrixRows ?? [] : []}
        initialColumns={editingMatrixCriteria ? editingMatrixCriteria.matrixColumns ?? [] : []}
        onSave={handleMatrixSave}
        onClose={() => { setShowMatrixModal(false); setEditingMatrixCriteria(null) }}
      />
    )}
  </>
  )
}

// ── Apply Existing Procedure Modal ────────────────────────────────────────────

function ApplyProcedureModal({ allProcedures, onApply, onClose }) {
  const [selected, setSelected] = useState(null)
  const preview = allProcedures[selected] ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">content_copy</span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Apply Existing Procedure</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a procedure to preview, then apply it to this stage.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body — split list + preview */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left — procedure list */}
          <div className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            {allProcedures.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8 px-4">No procedures in other stages yet.</p>
            ) : allProcedures.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors ${
                  selected === i
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                  {p.title || <span className="italic text-slate-400">Untitled</span>}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.formulaName}</p>
                <p className="text-[10px] text-slate-400 truncate">{p.stageName}</p>
              </button>
            ))}
          </div>

          {/* Right — preview */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {preview ? (
              <>
                <div className="flex-1 p-5 space-y-4">
                  {/* Context */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary/10 text-primary rounded">{preview.formulaName}</span>
                    <span className="material-symbols-outlined text-slate-300 text-[14px]">chevron_right</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">{preview.stageName}</span>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Procedure Name</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {preview.title || <span className="italic text-slate-400">Untitled</span>}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Description</p>
                    {preview.description
                      ? <div
                          className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed
                            [&_[data-m='mat']]:inline-flex [&_[data-m='mat']]:items-center [&_[data-m='mat']]:gap-0.5 [&_[data-m='mat']]:px-1.5 [&_[data-m='mat']]:py-0.5 [&_[data-m='mat']]:rounded [&_[data-m='mat']]:bg-violet-100 [&_[data-m='mat']]:text-violet-700 [&_[data-m='mat']]:font-semibold [&_[data-m='mat']]:text-[11px]
                            [&_[data-m='ins']]:inline-flex [&_[data-m='ins']]:items-center [&_[data-m='ins']]:gap-0.5 [&_[data-m='ins']]:px-1.5 [&_[data-m='ins']]:py-0.5 [&_[data-m='ins']]:rounded [&_[data-m='ins']]:bg-sky-100 [&_[data-m='ins']]:text-sky-700 [&_[data-m='ins']]:font-semibold [&_[data-m='ins']]:text-[11px]"
                          dangerouslySetInnerHTML={{ __html: preview.description }}
                        />
                      : <p className="text-xs text-slate-300 italic">No description.</p>
                    }
                  </div>

                  {/* Criteria */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Criteria</p>
                    {preview.criteria.length === 0 ? (
                      <p className="text-xs text-slate-300 italic">No criteria defined.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {preview.criteria.map((c, ci) => {
                          const typeInfo = INPUT_TYPES.find(t => t.value === c.inputType) ?? INPUT_TYPES[0]
                          return (
                            <div key={ci} className="flex items-start gap-2 px-2.5 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name || '—'}</span>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeInfo.cls}`}>
                                    {typeInfo.label}
                                  </span>
                                  {c.unit && <span className="text-[10px] font-mono text-slate-400">{c.unit}</span>}
                                </div>
                                {c.description && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply footer */}
                <div className="shrink-0 px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">A copy will be added to the current stage.</p>
                  <button
                    onClick={() => onApply(preview)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span> Apply to Stage
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-8">
                <span className="material-symbols-outlined text-slate-200 text-[36px]">preview</span>
                <p className="text-xs text-slate-400">Select a procedure on the left to preview it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stage Section (one per stage in a formula) ────────────────────────────────

function StageSection({ index, stage, procedures, allProcedures, onProceduresChange, materials }) {
  const [isOpen, setIsOpen] = useState(true)
  const [dragIdx, setDragIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const change = (next) => onProceduresChange(next)

  const addProcedure = () =>
    change([...procedures, { id: nextProcedureId++, title: '', description: '', criteria: [] }])

  const deleteProcedure = (id) => change(procedures.filter(p => p.id !== id))

  const duplicateProcedure = (id) => {
    const src = procedures.find(p => p.id === id)
    const idx = procedures.findIndex(p => p.id === id)
    const copy = { ...src, id: nextProcedureId++, title: src.title ? `${src.title} (copy)` : '', criteria: src.criteria.map(c => ({ ...c, id: nextCriteriaId++ })) }
    const next = [...procedures]
    next.splice(idx + 1, 0, copy)
    change(next)
  }

  const updateProcedure = (updated) => change(procedures.map(p => p.id === updated.id ? updated : p))

  const applyProcedure = (source) => {
    change([...procedures, {
      id: nextProcedureId++,
      title: source.title,
      description: source.description,
      criteria: source.criteria.map(c => ({ ...c, id: nextCriteriaId++ })),
    }])
    setShowApplyModal(false)
  }

  const handleDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return
    const next = [...procedures]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(toIdx, 0, moved)
    change(next)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Stage header — clickable to collapse */}
      <div
        className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
          {index}
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{stage.name}</span>
        {!isOpen && procedures.length > 0 && (
          <span className="text-[10px] text-slate-400">{procedures.length} procedure{procedures.length !== 1 ? 's' : ''}</span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded">
          Stage
        </span>
        <span
          className="material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </div>

      {/* Procedure list */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {procedures.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No procedures yet — add one below.</p>
          ) : procedures.map((proc, idx) => (
            <ProcedureCard
              key={proc.id}
              procedure={proc}
              index={idx + 1}
              onUpdate={updateProcedure}
              onDelete={() => deleteProcedure(proc.id)}
              onDuplicate={() => duplicateProcedure(proc.id)}
              isDragging={dragIdx === idx}
              isDragOver={dragOverIdx === idx}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={() => setDragOverIdx(idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
              materials={materials}
            />
          ))}

          {/* Footer actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={addProcedure}
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Procedure
            </button>
            <button
              onClick={e => { e.stopPropagation(); setShowApplyModal(true) }}
              disabled={allProcedures.length === 0}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span> Apply Existing
            </button>
          </div>
        </div>
      )}

      {showApplyModal && (
        <ApplyProcedureModal
          allProcedures={allProcedures}
          onApply={applyProcedure}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  )
}

// ── Formula Group ─────────────────────────────────────────────────────────────

function FormulaGroup({ formula, allStages, stepContent, onContentChange, getAllProcedures, materials }) {
  const [isOpen, setIsOpen] = useState(true)

  const includedStages = allStages.filter(s =>
    formula.includedStageIds.size === 0 || formula.includedStageIds.has(s.id)
  )

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div
        className="px-5 py-3 flex items-center justify-between cursor-pointer select-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">science</span>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formula.name}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {includedStages.length} stage{includedStages.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span
          className="material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </div>

      {isOpen && (
        <div className="p-5 space-y-4">
          {includedStages.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <span className="material-symbols-outlined text-slate-200 text-[36px]">layers</span>
              <p className="text-xs font-medium text-slate-400">No stages included in this formula.</p>
              <p className="text-[11px] text-slate-400">
                Go to <span className="font-semibold">Materials &amp; Formulation</span> and include stages for this formula.
              </p>
            </div>
          ) : includedStages.map((stage, idx) => {
            const key = `${formula.id}-${stage.id}`
            return (
              <StageSection
                key={key}
                index={idx + 1}
                stage={stage}
                procedures={stepContent[key] ?? []}
                allProcedures={getAllProcedures(key)}
                onProceduresChange={procs => onContentChange(key, procs)}
                materials={materials}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ProcedureProtocol({ stages, formulas }) {
  const [stepContent,     setStepContent]     = useState({})
  const [isDirty,         setIsDirty]         = useState(false)

  // Read from system config material database (MaterialMasterPage persists to localStorage)
  const materialNames = (() => {
    try {
      const stored = localStorage.getItem('eln_material_master')
      const db = stored ? JSON.parse(stored) : null
      if (db && db.length > 0) return [...new Set(db.map(m => m.materialName).filter(Boolean))]
    } catch { /* ignore */ }
    // Fallback: materials added to formulation stages
    return [...new Set(stages.flatMap(s => (s.materials ?? []).map(m => m.name).filter(Boolean)))]
  })()
  const [alertDismissed,  setAlertDismissed]  = useState(false)
  const [isFullScreen,    setIsFullScreen]    = useState(false)
  const [lastSavedAt,     setLastSavedAt]     = useState(null)

  const handleContentChange = (key, procedures) => {
    setStepContent(prev => ({ ...prev, [key]: procedures }))
    setIsDirty(true)
    setAlertDismissed(false)
  }

  const handleSave = () => {
    setIsDirty(false)
    setAlertDismissed(false)
    setLastSavedAt(new Date())
  }

  const getAllProcedures = (excludeKey) =>
    formulas.flatMap(f =>
      stages
        .filter(s => f.includedStageIds.size === 0 || f.includedStageIds.has(s.id))
        .flatMap(s => {
          const key = `${f.id}-${s.id}`
          if (key === excludeKey) return []
          return (stepContent[key] ?? []).map(p => ({
            ...p,
            stageName: s.name,
            formulaName: f.name,
          }))
        })
    )

  const header = (
    <div className={`flex items-center justify-between ${isFullScreen ? 'px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0' : ''}`}>
      <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">format_list_numbered</span>
        Procedure &amp; Protocol
        {isDirty && !alertDismissed && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 ml-1">
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>warning</span>
            Unsaved changes
            <button onClick={() => setAlertDismissed(true)} className="opacity-40 hover:opacity-100 transition-opacity leading-none">
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
            </button>
          </span>
        )}
        {lastSavedAt && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 ml-1">
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
            Latest saved at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">save</span> Save
        </button>
        {isFullScreen ? (
          <button
            onClick={() => setIsFullScreen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
            title="Exit full screen"
          >
            <span className="material-symbols-outlined text-[20px]">close_fullscreen</span>
          </button>
        ) : (
          <button
            onClick={() => setIsFullScreen(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
            title="Open in full screen"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_full</span>
          </button>
        )}
      </div>
    </div>
  )

  const content = stages.length === 0 ? (
    <div className="py-16 flex flex-col items-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center px-8">
      <span className="material-symbols-outlined text-slate-200 text-[40px]">format_list_numbered</span>
      <p className="text-sm font-medium text-slate-400">No stages defined yet</p>
      <p className="text-xs text-slate-400 max-w-xs">
        Add stages in <span className="font-semibold">Materials &amp; Formulation</span> above — each stage will generate a procedure section here for every formula it belongs to.
      </p>
    </div>
  ) : formulas.map(formula => (
    <FormulaGroup
      key={formula.id}
      formula={formula}
      allStages={stages}
      stepContent={stepContent}
      onContentChange={handleContentChange}
      getAllProcedures={getAllProcedures}
      materials={materialNames}
    />
  ))

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
        {header}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {header}
      {content}
    </div>
  )
}
