import { useState, useRef, Fragment } from 'react'

const MASTER_MATERIALS = [
  { code: 'MAT-001', name: 'Purified Water, USP Grade', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-002', name: 'Ethanol 96%', type: 'REAGENT', qc: 'Passed' },
  { code: 'MAT-003', name: 'Isopropanol', type: 'REAGENT', qc: 'Passed' },
  { code: 'MAT-042', name: 'Glycerin USP, Vegetable Source', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-055', name: 'Sodium Chloride, USP', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-061', name: 'Microcrystalline Cellulose', type: 'SAMPLE', qc: 'Pending' },
]

// Mock Material Batches master data (from System Configuration)
const MATERIAL_BATCHES = [
  { id: 'B001', batchNo: 'BTH-2025-001', materialCode: 'MAT-001', qcStatus: 'Passed', expiryDate: '2026-12-31' },
  { id: 'B002', batchNo: 'BTH-2025-002', materialCode: 'MAT-001', qcStatus: 'Passed', expiryDate: '2026-06-30' },
  { id: 'B003', batchNo: 'BTH-2024-011', materialCode: 'MAT-002', qcStatus: 'Passed', expiryDate: '2025-09-15' },
  { id: 'B004', batchNo: 'BTH-2024-012', materialCode: 'MAT-002', qcStatus: 'Pending', expiryDate: '2025-11-20' },
  { id: 'B005', batchNo: 'BTH-2025-007', materialCode: 'MAT-003', qcStatus: 'Passed', expiryDate: '2026-03-01' },
  { id: 'B006', batchNo: 'BTH-2025-008', materialCode: 'MAT-042', qcStatus: 'Passed', expiryDate: '2026-08-10' },
  { id: 'B007', batchNo: 'BTH-2024-019', materialCode: 'MAT-055', qcStatus: 'Passed', expiryDate: '2025-07-22' },
  { id: 'B008', batchNo: 'BTH-2025-003', materialCode: 'MAT-061', qcStatus: 'Pending', expiryDate: '2026-01-05' },
]

const TYPE_STYLES = {
  MATERIAL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SAMPLE: 'bg-sky-100    text-sky-700    border-sky-200',
  REAGENT: 'bg-orange-100 text-orange-700 border-orange-200',
}

function TypeBadge({ type }) {
  const cls = TYPE_STYLES[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${cls}`}>
      {type}
    </span>
  )
}

const UOM_OPTIONS = ['g', 'kg', 'L', 'µg', 'µL', 'mg', 'mL', 'ng']

const UNIT_TO_BASE = { ng: 1e-9, µg: 1e-6, mg: 1e-3, g: 1, kg: 1000, µL: 1e-6, mL: 1e-3, L: 1 }
const UNIT_DIM = { ng: 'mass', µg: 'mass', mg: 'mass', g: 'mass', kg: 'mass', µL: 'volume', mL: 'volume', L: 'volume' }

function convertToNumerator(qty, fromUom, toUom) {
  const num = parseFloat(qty)
  if (!qty || isNaN(num) || fromUom === toUom) return null
  if (UNIT_DIM[fromUom] !== UNIT_DIM[toUom]) return { incompatible: true }
  const converted = (num * UNIT_TO_BASE[fromUom]) / UNIT_TO_BASE[toUom]
  return { value: parseFloat(converted.toPrecision(6)) }
}

let nextStageId = 1
let nextMatId = 1
let nextFormulaId = 2

const ALERT_STYLES = {
  warning: { bar: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300', icon: 'warning', iconClass: 'text-amber-500' },
  error: { bar: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300', icon: 'error', iconClass: 'text-red-500' },
  info: { bar: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300', icon: 'info', iconClass: 'text-blue-500' },
}

// Sticky left offsets — must match column widths exactly
// col 1 drag:     w-10 = 40px  → left-0
// col 2 stage:    w-48 = 192px → left-10 (40px)
// col 3 material: w-56 = 224px → left-[232px] (40+192)
// Sticky left offsets — synchronized with exact pixel widths below to ensure perfect alignment during scroll
const STICKY_DRAG = 'sticky left-0 z-10'
const STICKY_STAGE = 'sticky left-[44px] z-10'
const STICKY_MATERIAL = 'sticky left-[244px] z-10'
// Solid backgrounds required so scrolling rows don't bleed through frozen cells
const BG_HEADER = 'bg-slate-50 dark:bg-slate-900'
const BG_STAGE = 'bg-slate-50 dark:bg-slate-900'
const BG_MATERIAL = 'bg-white dark:bg-slate-950'
// Divider on last frozen column as a visual freeze indicator
const FREEZE_BORDER = 'border-r border-r-slate-300 dark:border-r-slate-600 [box-shadow:1px_0_0_0_#cbd5e1] dark:[box-shadow:1px_0_0_0_#475569]'

export default function MaterialsFormulation({ stages, setStages, formulas, setFormulas }) {
  const [isSectionOpen, setIsSectionOpen] = useState(true)
  const [numeratorUom, setNumeratorUom] = useState('g')
  const [useIndividualScales, setUseIndividualScales] = useState(false)
  const [denominatorUom, setDenominatorUom] = useState('Ampoule')
  const [scale, setScale] = useState(100)
  // Track which formula's rename input is currently focused (for inline duplicate alert)
  const [renamingFormulaId, setRenamingFormulaId] = useState(null)
  const [openFormulaSettings, setOpenFormulaSettings] = useState(null)
  // key: `${stageId}-${matId}-${formulaId}`
  const [openCellSettings, setOpenCellSettings] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [dragStageId, setDragStageId] = useState(null)
  const [dragOverStageId, setDragOverStageId] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState([
    {
      id: 9001,
      name: 'Hand Sanitizer Gel (WHO)',
      savedAt: '3/10/2026, 09:15 AM',
      stageCount: 2,
      materialCount: 4,
      numeratorUom: 'mL',
      denominatorUom: 'Bottle',
      scale: 1000,
      useIndividualScales: false,
      formulas: [{ id: 901, name: 'Formula 1', scale: 1000, includedStageIds: new Set([901, 902]) }],
      stages: [
        {
          id: 901, name: 'Aqueous Phase',
          materials: [
            { id: 9001, materialCode: 'MAT-001', formulaValues: { 901: { qty: '725', uom: 'mL', included: true, batchId: null } } },
            { id: 9002, materialCode: 'MAT-042', formulaValues: { 901: { qty: '14.5', uom: 'mL', included: true, batchId: null } } },
          ],
        },
        {
          id: 902, name: 'Active Phase',
          materials: [
            { id: 9003, materialCode: 'MAT-002', formulaValues: { 901: { qty: '833', uom: 'mL', included: true, batchId: null } } },
            { id: 9004, materialCode: 'MAT-003', formulaValues: { 901: { qty: '41.7', uom: 'mL', included: true, batchId: null } } },
          ],
        },
      ],
    },
    {
      id: 9002,
      name: 'Isotonic Saline 0.9%',
      savedAt: '3/15/2026, 02:30 PM',
      stageCount: 1,
      materialCount: 2,
      numeratorUom: 'g',
      denominatorUom: 'Ampoule',
      scale: 100,
      useIndividualScales: false,
      formulas: [{ id: 902, name: 'Formula 1', scale: 100, includedStageIds: new Set([903]) }],
      stages: [
        {
          id: 903, name: 'Dissolution',
          materials: [
            { id: 9005, materialCode: 'MAT-055', formulaValues: { 902: { qty: '0.9', uom: 'g', included: true, batchId: null } } },
            { id: 9006, materialCode: 'MAT-001', formulaValues: { 902: { qty: '99.1', uom: 'mL', included: true, batchId: null } } },
          ],
        },
      ],
    },
    {
      id: 9003,
      name: 'Tablet Core Blend',
      savedAt: '3/22/2026, 11:00 AM',
      stageCount: 2,
      materialCount: 3,
      numeratorUom: 'g',
      denominatorUom: 'Tablet',
      scale: 500,
      useIndividualScales: false,
      formulas: [{ id: 903, name: 'Formula 1', scale: 500, includedStageIds: new Set([904, 905]) }],
      stages: [
        {
          id: 904, name: 'Wet Granulation',
          materials: [
            { id: 9007, materialCode: 'MAT-061', formulaValues: { 903: { qty: '450', uom: 'g', included: true, batchId: null } } },
            { id: 9008, materialCode: 'MAT-001', formulaValues: { 903: { qty: '80', uom: 'mL', included: true, batchId: null } } },
          ],
        },
        {
          id: 905, name: 'Lubrication',
          materials: [
            { id: 9009, materialCode: 'MAT-055', formulaValues: { 903: { qty: '5', uom: 'g', included: true, batchId: null } } },
          ],
        },
      ],
    },
  ])
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showApplyTemplate, setShowApplyTemplate] = useState(false)
  const [templateNameInput, setTemplateNameInput] = useState('')
  const [applyConfirmId, setApplyConfirmId] = useState(null)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // ── Helpers ───────────────────────────────────────────────────────────────

  const mutate = (fn) => { setStages(fn); setIsDirty(true) }

  const emptyFormulaValues = () =>
    Object.fromEntries(formulas.map(f => [f.id, { qty: '', uom: 'g', included: true, batchId: null }]))

  // ── Formula column actions ────────────────────────────────────────────────

  const addFormula = () => {
    const newFormula = {
      id: nextFormulaId++,
      name: `Formula ${formulas.length + 1}`,
      scale: 100,
      includedStageIds: new Set(stages.map(s => s.id)),
    }
    setFormulas(prev => [...prev, newFormula])
    setStages(prev => prev.map(s => ({
      ...s,
      materials: s.materials.map(m => ({
        ...m,
        formulaValues: { ...m.formulaValues, [newFormula.id]: { qty: '', uom: 'g', included: true, batchId: null } },
      })),
    })))
    setIsDirty(true)
  }

  const renameFormula = (formulaId, newName) => {
    setFormulas(prev => prev.map(f => f.id === formulaId ? { ...f, name: newName } : f))
    setIsDirty(true)
  }

  const setFormulaScale = (formulaId, value) => {
    setFormulas(prev => prev.map(f => f.id === formulaId ? { ...f, scale: parseFloat(value) || 1 } : f))
    setIsDirty(true)
  }

  const toggleFormulaStage = (formulaId, stageId) => {
    setFormulas(prev => prev.map(f => {
      if (f.id !== formulaId) return f
      const next = new Set(f.includedStageIds)
      if (next.has(stageId)) next.delete(stageId)
      else next.add(stageId)
      return { ...f, includedStageIds: next }
    }))
    setIsDirty(true)
  }

  const removeFormula = (formulaId) => {
    if (formulas.length === 1) return
    setFormulas(prev => prev.filter(f => f.id !== formulaId))
    setStages(prev => prev.map(s => ({
      ...s,
      materials: s.materials.map(m => {
        const { [formulaId]: _removed, ...rest } = m.formulaValues
        return { ...m, formulaValues: rest }
      }),
    })))
    setIsDirty(true)
  }

  // ── Stage / material actions ──────────────────────────────────────────────

  const addStage = () => {
    const newStageId = nextStageId++
    // Include newly added stage in ALL existing formulas
    setFormulas(prev => prev.map(f => ({
      ...f,
      includedStageIds: new Set([...f.includedStageIds, newStageId]),
    })))
    mutate(prev => [...prev, { id: newStageId, name: 'New Stage', materials: [] }])
  }

  const updateStageName = (stageId, name) =>
    mutate(prev => prev.map(s => s.id === stageId ? { ...s, name } : s))

  const removeStage = (stageId) =>
    mutate(prev => prev.filter(s => s.id !== stageId))

  const addMaterial = (stageId) =>
    mutate(prev => prev.map(s =>
      s.id === stageId
        ? { ...s, materials: [...s.materials, { id: nextMatId++, materialCode: MASTER_MATERIALS[0].code, formulaValues: emptyFormulaValues() }] }
        : s
    ))

  const updateMaterial = (stageId, matId, field, value) =>
    mutate(prev => prev.map(s =>
      s.id === stageId
        ? { ...s, materials: s.materials.map(m => m.id === matId ? { ...m, [field]: value } : m) }
        : s
    ))

  const updateFormulaValue = (stageId, matId, formulaId, field, value) =>
    mutate(prev => prev.map(s =>
      s.id === stageId
        ? {
          ...s,
          materials: s.materials.map(m =>
            m.id === matId
              ? { ...m, formulaValues: { ...m.formulaValues, [formulaId]: { ...m.formulaValues[formulaId], [field]: value } } }
              : m
          ),
        }
        : s
    ))

  const removeMaterial = (stageId, matId) =>
    mutate(prev => prev.map(s =>
      s.id === stageId
        ? { ...s, materials: s.materials.filter(m => m.id !== matId) }
        : s
    ))

  const handleSave = () => {
    setIsDirty(false)
    setDismissedAlerts(new Set())
    setLastSavedAt(new Date())
  }
  const handleReset = () => {
    setStages([])
    setIsDirty(false)
    setDismissedAlerts(new Set())
    setLastSavedAt(null)
  }

  // ── Stage drag-to-reorder ─────────────────────────────────────────────────

  const handleStageDragStart = (e, stageId) => {
    setDragStageId(stageId)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleStageDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (stageId !== dragStageId) setDragOverStageId(stageId)
  }
  const handleStageDrop = (e, targetStageId) => {
    e.preventDefault()
    if (!dragStageId || dragStageId === targetStageId) return
    mutate(prev => {
      const from = prev.findIndex(s => s.id === dragStageId)
      const to = prev.findIndex(s => s.id === targetStageId)
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDragStageId(null)
    setDragOverStageId(null)
  }
  const handleStageDragEnd = () => {
    setDragStageId(null)
    setDragOverStageId(null)
  }

  // ── Formula templates ─────────────────────────────────────────────────────

  const handleSaveTemplate = () => {
    const name = templateNameInput.trim()
    if (!name) return
    setSavedTemplates(prev => [...prev, {
      id: Date.now(),
      name,
      savedAt: new Date().toLocaleString(),
      stageCount: stages.length,
      materialCount: stages.reduce((n, s) => n + s.materials.length, 0),
      stages: stages.map(s => ({ ...s, materials: s.materials.map(m => ({ ...m, formulaValues: { ...m.formulaValues } })) })),
      formulas: formulas.map(f => ({ ...f, includedStageIds: new Set(f.includedStageIds) })),
      numeratorUom,
      denominatorUom,
      scale,
      useIndividualScales,
    }])
    setTemplateNameInput('')
    setShowSaveTemplate(false)
  }

  const handleApplyTemplate = (template) => {
    if (template.stages.length > 0) {
      nextStageId = Math.max(nextStageId, ...template.stages.map(s => s.id)) + 1
      const matIds = template.stages.flatMap(s => s.materials.map(m => m.id))
      if (matIds.length > 0) nextMatId = Math.max(nextMatId, ...matIds) + 1
    }
    if (template.formulas.length > 0) nextFormulaId = Math.max(nextFormulaId, ...template.formulas.map(f => f.id)) + 1
    setStages(template.stages.map(s => ({ ...s, materials: s.materials.map(m => ({ ...m, formulaValues: { ...m.formulaValues } })) })))
    setFormulas(template.formulas.map(f => ({ ...f, includedStageIds: new Set(f.includedStageIds) })))
    setNumeratorUom(template.numeratorUom)
    setDenominatorUom(template.denominatorUom)
    setScale(template.scale)
    setUseIndividualScales(template.useIndividualScales)
    setIsDirty(true)
    setApplyConfirmId(null)
    setShowApplyTemplate(false)
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const allMaterials = stages.flatMap(s =>
    s.materials.map(m => ({
      ...m,
      material: MASTER_MATERIALS.find(mm => mm.code === m.materialCode),
    }))
  )

  const hasIncompatibleUom = allMaterials.some(m =>
    formulas.some(f => {
      const fv = m.formulaValues?.[f.id]
      return fv?.qty && fv.uom !== numeratorUom && UNIT_DIM[fv.uom] !== UNIT_DIM[numeratorUom]
    })
  )

  const totalPerFormula = formulas.map(f => ({
    id: f.id,
    total: stages
      .filter(s => f.includedStageIds.size === 0 || f.includedStageIds.has(s.id))
      .flatMap(s => s.materials.map(m => ({
        ...m,
        material: MASTER_MATERIALS.find(mm => mm.code === m.materialCode),
      })))
      .reduce((sum, m) => {
        const fv = m.formulaValues?.[f.id]
        if (!fv?.qty || fv.included === false) return sum   // skip excluded cells
        if (fv.uom === numeratorUom) return sum + (parseFloat(fv.qty) || 0)
        const conv = convertToNumerator(fv.qty, fv.uom, numeratorUom)
        return conv?.value != null ? sum + conv.value : sum
      }, 0),
  }))

  // ── Alerts ────────────────────────────────────────────────────────────────

  const dismissAlert = (id) =>
    setDismissedAlerts(prev => new Set([...prev, id]))

  const allAlerts = [
    !numeratorUom && {
      id: 'no-numerator',
      type: 'error',
      message: 'Please set Numerator UOM before entering formula quantities.',
    },
    hasIncompatibleUom && {
      id: 'incompatible-uom',
      type: 'error',
      message: `One or more materials use a unit dimension that cannot be converted to "${numeratorUom}". Please correct the UOM selections.`,
    },
  ].filter(Boolean).filter(a => !dismissedAlerts.has(a.id))

  // ── Render ────────────────────────────────────────────────────────────────

  const totalCols = 3 + formulas.length + 1

  return (
    <div className={`bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
      isFullScreen ? 'fixed inset-0 z-50 rounded-none flex flex-col' : 'rounded-xl'
    }`}>
      {/* Header */}
      <div
        className={`p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 select-none ${
          isFullScreen ? 'shrink-0' : 'sticky top-0 z-20 cursor-pointer'
        }`}
        onClick={() => !isFullScreen && setIsSectionOpen(prev => !prev)}
      >
        <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">biotech</span>
          Materials &amp; Formulation
          {isDirty && !dismissedAlerts.has('unsaved-changes') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 ml-1">
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>warning</span>
              Unsaved changes
              <button onClick={e => { e.stopPropagation(); dismissAlert('unsaved-changes') }} className="opacity-40 hover:opacity-100 transition-opacity leading-none">
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
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {isFullScreen ? (
            <>
              <button
                onClick={() => setIsFullScreen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleSave(); setIsFullScreen(false) }}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded"
                title="Exit full screen"
              >
                <span className="material-symbols-outlined text-[20px]">close_fullscreen</span>
              </button>
            </>
          ) : (
            <>
              {isSectionOpen && (
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span> Save
                </button>
              )}
              <button
                onClick={() => setIsFullScreen(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded"
                title="Open in full screen"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_full</span>
              </button>
              <button
                onClick={() => setIsSectionOpen(prev => !prev)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded"
                title={isSectionOpen ? 'Collapse' : 'Expand'}
              >
                <span
                  className="material-symbols-outlined text-[20px] transition-transform duration-200"
                  style={{ transform: isSectionOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                >
                  expand_more
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert panel */}
      {allAlerts.length > 0 && (
        <div className="px-6 pt-4 space-y-2">
          {allAlerts.map(alert => {
            const style = ALERT_STYLES[alert.type]
            return (
              <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-xs ${style.bar}`}>
                <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${style.iconClass}`}>
                  {style.icon}
                </span>
                <span className="flex-1 leading-relaxed">{alert.message}</span>
                {alert.actions?.map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`shrink-0 px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${action.secondary
                      ? 'border-current opacity-60 hover:opacity-100'
                      : 'bg-current/10 border-current/30 hover:bg-current/20'
                      }`}
                  >
                    {action.label}
                  </button>
                ))}
                <button onClick={() => dismissAlert(alert.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {(isSectionOpen || isFullScreen) && <div className={`p-6 space-y-6 ${isFullScreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {/* UOM Config — compact fraction bar */}
        <div className="bg-slate-50 dark:bg-slate-900/40 px-4 py-3 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            {/* Label */}
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">Formula unit</span>
            {/* Scale */}
            {!useIndividualScales ? (
              <input
                type="number"
                value={scale}
                min={1}
                onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                className="w-20 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 focus:ring-1 focus:ring-primary text-center"
                title="Scale"
              />
            ) : (
              <span className="text-[10px] text-slate-400 italic px-2 py-1 flex items-center border border-dashed border-slate-200 dark:border-slate-700 rounded-md">
                per formula
              </span>
            )}
            {/* × */}
            <span className="text-slate-400 font-semibold text-xs">×</span>
            {/* Numerator UOM */}
            <select
              value={numeratorUom}
              onChange={(e) => setNumeratorUom(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 pl-2 pr-6 min-w-[64px] focus:ring-1 focus:ring-primary text-slate-700 dark:text-slate-200"
              title="Numerator UOM"
            >
              {['g', 'kg', 'L', 'µg', 'µL', 'mg', 'mL', 'ng'].map(u => <option key={u}>{u}</option>)}
            </select>
            {/* / divider */}
            <span className="text-slate-400 font-bold text-xs leading-none">/</span>
            {/* Denominator UOM */}
            <select
              value={denominatorUom}
              onChange={(e) => setDenominatorUom(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 pl-2 pr-6 min-w-[88px] focus:ring-1 focus:ring-primary text-slate-700 dark:text-slate-200"
              title="Denominator UOM"
            >
              {['Ampoule', 'Bottle', 'Cell', 'Piece', 'Sachet', 'Syringe', 'Tablet'].map(u => <option key={u}>{u}</option>)}
            </select>
            {/* Divider */}
            <span className="text-slate-200 dark:text-slate-700 mx-1">|</span>
            {/* Individual scales toggle */}
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <div
                onClick={() => setUseIndividualScales(v => !v)}
                className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${useIndividualScales ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${useIndividualScales ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Individual scales</span>
            </label>
            {/* Divider */}
            <span className="text-slate-200 dark:text-slate-700 mx-1">|</span>
            {/* Formula template actions */}
            <button
              onClick={() => { setTemplateNameInput(''); setShowSaveTemplate(true) }}
              disabled={stages.length === 0}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Save current formula as a template"
            >
              <span className="material-symbols-outlined text-[14px]">bookmark_add</span> Save Formula
            </button>
            <button
              onClick={() => { setApplyConfirmId(null); setShowApplyTemplate(true) }}
              disabled={savedTemplates.length === 0}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Apply a saved formula template"
            >
              <span className="material-symbols-outlined text-[14px]">bookmarks</span> Apply Formula
              {savedTemplates.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">{savedTemplates.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Stage Table — overflow-x-auto enables scroll; cols 1-3 are position:sticky */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="min-w-max w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                {/* col 1 — drag (frozen) */}
                <th className={`p-3 border-b border-r border-slate-200 dark:border-slate-800 w-[44px] min-w-[44px] max-w-[44px] text-center text-slate-400 ${STICKY_DRAG} ${BG_HEADER}`}>
                  <span className="material-symbols-outlined text-lg">drag_handle</span>
                </th>
                {/* col 2 — stage (frozen) */}
                <th className={`p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500 w-[200px] min-w-[200px] max-w-[200px] ${STICKY_STAGE} ${BG_HEADER}`}>
                  Stage
                </th>
                {/* col 3 — material (frozen, last frozen → thicker right border) */}
                <th className={`p-3 border-b font-bold uppercase text-[10px] tracking-widest text-slate-500 w-[240px] min-w-[240px] max-w-[240px] ${STICKY_MATERIAL} ${BG_HEADER} ${FREEZE_BORDER}`}>
                  Material
                </th>
                {/* Formula columns — scrollable */}
                {formulas.map(f => {
                  const isDuplicate = renamingFormulaId === f.id &&
                    formulas.some(other => other.id !== f.id && other.name.trim().toLowerCase() === f.name.trim().toLowerCase())
                  return (
                    <th key={f.id} className="p-3 border-b border-r border-slate-200 dark:border-slate-800 min-w-[200px] align-middle">
                      {/* ── Name row ── */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={f.name}
                          onFocus={() => setRenamingFormulaId(f.id)}
                          onBlur={() => setRenamingFormulaId(null)}
                          onChange={e => renameFormula(f.id, e.target.value)}
                          className={`flex-1 min-w-0 text-[11px] font-bold uppercase tracking-widest bg-transparent border-b focus:outline-none py-0.5 transition-colors ${isDuplicate
                            ? 'border-red-400 text-red-600 focus:border-red-500'
                            : 'border-transparent text-slate-600 dark:text-slate-300 focus:border-primary'
                            }`}
                        />
                        {/* Settings popover trigger */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setOpenFormulaSettings(prev => prev === f.id ? null : f.id)}
                            className={`p-0.5 rounded transition-colors ${openFormulaSettings === f.id
                              ? 'text-primary bg-primary/10'
                              : 'text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            title="Formula settings"
                          >
                            <span className="material-symbols-outlined text-[15px]">tune</span>
                          </button>
                          {/* Popover panel */}
                          {openFormulaSettings === f.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 space-y-3">
                              {/* Scale (only when individual scales on) */}
                              {useIndividualScales && (
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Scale</label>
                                  <input
                                    type="number"
                                    value={f.scale}
                                    min={1}
                                    onChange={e => setFormulaScale(f.id, e.target.value)}
                                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-primary focus:ring-1 font-medium text-slate-700 dark:text-slate-200"
                                  />
                                </div>
                              )}
                              {/* Stage inclusion */}
                              {stages.length > 0 && (
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Include stages</p>
                                  <div className="space-y-1">
                                    {stages.map(s => (
                                      <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                          type="checkbox"
                                          checked={f.includedStageIds.has(s.id)}
                                          onChange={() => toggleFormulaStage(f.id, s.id)}
                                          className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary w-3 h-3"
                                        />
                                        <span className="text-[11px] text-slate-600 dark:text-slate-300 group-hover:text-slate-800 truncate">{s.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {!useIndividualScales && stages.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">Add stages to configure inclusion.</p>
                              )}
                            </div>
                          )}
                        </div>
                        {formulas.length > 1 && (
                          <button
                            onClick={() => removeFormula(f.id)}
                            className="text-slate-300 hover:text-red-500 p-0.5 rounded hover:bg-red-50 transition-colors shrink-0"
                            title="Remove formula"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        )}
                      </div>
                      {/* Duplicate alert */}
                      {isDuplicate && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          Name already used
                        </p>
                      )}
                    </th>
                  )
                })}
                {/* Add formula column */}
                <th className="p-3 border-b border-slate-200 dark:border-slate-800 w-12 text-center">
                  <button
                    onClick={addFormula}
                    className="text-primary hover:text-primary/70 transition-colors"
                    title="Add formula"
                  >
                    <span className="material-symbols-outlined text-[22px]">add_circle</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-5xl">science</span>
                      <p className="text-sm font-semibold text-slate-500">No stages yet</p>
                      <p className="text-xs">Click the button below to start building your formula</p>
                      <button
                        onClick={addStage}
                        className="mt-1 px-4 py-2 bg-primary text-white rounded text-xs font-medium flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">add_circle</span> Add Stage
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {stages.map(stage => {
                    const spanCount = stage.materials.length + 1

                    return (
                      <Fragment key={stage.id}>
                        {stage.materials.length === 0 ? (
                          <tr
                            className={`border-b border-slate-200 dark:border-slate-800 transition-colors ${dragOverStageId === stage.id && dragStageId !== stage.id ? 'bg-primary/5 outline outline-2 -outline-offset-2 outline-primary/30' : ''} ${dragStageId === stage.id ? 'opacity-40' : ''}`}
                            onDragOver={(e) => handleStageDragOver(e, stage.id)}
                            onDrop={(e) => handleStageDrop(e, stage.id)}
                          >
                            {/* drag — frozen */}
                            <td className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center align-top w-[44px] min-w-[44px] max-w-[44px] ${STICKY_DRAG} ${BG_STAGE}`}>
                              <span
                                className="material-symbols-outlined text-slate-300 hover:text-slate-500 text-lg cursor-grab active:cursor-grabbing select-none"
                                draggable
                                onDragStart={(e) => handleStageDragStart(e, stage.id)}
                                onDragEnd={handleStageDragEnd}
                              >drag_indicator</span>
                            </td>
                            {/* stage — frozen */}
                            <td className={`p-3 border-r border-slate-200 dark:border-slate-800 align-top w-[200px] min-w-[200px] max-w-[200px] ${STICKY_STAGE} ${BG_STAGE}`}>
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={stage.name}
                                  onChange={(e) => updateStageName(stage.id, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5 focus:ring-primary font-medium"
                                />
                                <button
                                  onClick={() => removeStage(stage.id)}
                                  className="w-fit flex items-center gap-1 text-red-400 hover:text-red-600 text-[10px] font-bold uppercase hover:bg-red-50 px-2 py-1 rounded"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span> Remove
                                </button>
                              </div>
                            </td>
                            {/* material col — frozen, colSpan covers formula area too since no materials yet */}
                            <td colSpan={formulas.length + 2} className={`p-4 text-slate-400 text-xs italic w-[240px] min-w-[240px] ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
                              No materials added.{' '}
                              <button
                                onClick={() => addMaterial(stage.id)}
                                className="text-primary font-semibold not-italic hover:underline"
                              >
                                Add material
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {stage.materials.map((mat, matIdx) => (
                              <tr
                                key={mat.id}
                                className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${dragOverStageId === stage.id && dragStageId !== stage.id ? 'bg-primary/5' : ''} ${dragStageId === stage.id ? 'opacity-40' : ''}`}
                                onDragOver={(e) => handleStageDragOver(e, stage.id)}
                                onDrop={(e) => handleStageDrop(e, stage.id)}
                              >
                                {matIdx === 0 && (
                                  <>
                                    {/* drag — frozen, rowSpan covers all material rows + add-material row */}
                                    <td
                                      rowSpan={spanCount}
                                      className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center align-top w-[44px] min-w-[44px] max-w-[44px] ${STICKY_DRAG} ${BG_STAGE}`}
                                    >
                                      <span
                                        className="material-symbols-outlined text-slate-300 hover:text-slate-500 text-lg cursor-grab active:cursor-grabbing select-none"
                                        draggable
                                        onDragStart={(e) => handleStageDragStart(e, stage.id)}
                                        onDragEnd={handleStageDragEnd}
                                      >drag_indicator</span>
                                    </td>
                                    {/* stage — frozen, rowSpan */}
                                    <td
                                      rowSpan={spanCount}
                                      className={`p-3 border-r border-slate-200 dark:border-slate-800 align-top w-[200px] min-w-[200px] max-w-[200px] ${STICKY_STAGE} ${BG_STAGE}`}
                                    >
                                      <div className="flex flex-col gap-2">
                                        <input
                                          type="text"
                                          value={stage.name}
                                          onChange={(e) => updateStageName(stage.id, e.target.value)}
                                          className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5 focus:ring-primary font-medium"
                                        />
                                        <button
                                          onClick={() => removeStage(stage.id)}
                                          className="w-fit flex items-center gap-1 text-red-400 hover:text-red-600 text-[10px] font-bold uppercase hover:bg-red-50 px-2 py-1 rounded"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">delete</span> Remove
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                                {/* material — frozen (col 3) */}
                                <td className={`p-3 align-top w-[240px] min-w-[240px] max-w-[240px] ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={mat.materialCode}
                                      onChange={(e) => updateMaterial(stage.id, mat.id, 'materialCode', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5"
                                    >
                                      {MASTER_MATERIALS.map(m => (
                                        <option key={m.code} value={m.code}>{m.code} – {m.name}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => removeMaterial(stage.id, mat.id)}
                                      className="text-slate-400 hover:text-red-500 shrink-0"
                                    >
                                      <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                  </div>
                                </td>
                                {formulas.map(f => {
                                  const fv = mat.formulaValues?.[f.id] ?? { qty: '', uom: 'g', included: true, batchId: null }
                                  const isIncluded = fv.included !== false
                                  const isStageIncluded = f.includedStageIds.size === 0 || f.includedStageIds.has(stage.id)
                                  const conversion = convertToNumerator(fv.qty, fv.uom, numeratorUom)
                                  const sameUom = fv.uom === numeratorUom
                                  const matBatches = MATERIAL_BATCHES.filter(b => b.materialCode === mat.materialCode)
                                  const selectedBatch = MATERIAL_BATCHES.find(b => b.id === fv.batchId)
                                  const cellKey = `${stage.id}-${mat.id}-${f.id}`
                                  const isCellOpen = openCellSettings === cellKey

                                  // ── Stage-excluded cell — rendered as a muted placeholder ──
                                  if (!isStageIncluded) {
                                    return (
                                      <td
                                        key={f.id}
                                        className="p-2.5 border-r border-slate-200 dark:border-slate-800 align-middle"
                                        style={{
                                          background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(148,163,184,0.12) 4px, rgba(148,163,184,0.12) 8px)',
                                        }}
                                      >
                                        <div className="flex items-center justify-center gap-1 py-1">
                                          <span className="material-symbols-outlined text-[13px] text-slate-300">block</span>
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Stage excluded</span>
                                        </div>
                                      </td>
                                    )
                                  }

                                  return (
                                    <td
                                      key={f.id}
                                      className="p-2.5 border-r border-slate-200 dark:border-slate-800 align-top"
                                    >
                                      {/* Qty + UOM + settings button row */}
                                      <div className="flex items-center gap-1">
                                        <div className={`flex flex-1 items-center border rounded overflow-hidden transition-opacity ${isIncluded
                                          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                          : 'opacity-40 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                                          }`}>
                                          <input
                                            type="number"
                                            value={fv.qty}
                                            onChange={e => updateFormulaValue(stage.id, mat.id, f.id, 'qty', e.target.value)}
                                            placeholder="0"
                                            disabled={!isIncluded}
                                            className="w-2/3 border-none bg-transparent text-xs py-1.5 px-2 focus:ring-0 disabled:cursor-not-allowed"
                                          />
                                          <select
                                            value={fv.uom}
                                            onChange={e => updateFormulaValue(stage.id, mat.id, f.id, 'uom', e.target.value)}
                                            disabled={!isIncluded}
                                            className="w-1/3 border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[10px] py-1.5 focus:ring-0 text-slate-500 disabled:cursor-not-allowed"
                                          >
                                            {UOM_OPTIONS.map(u => <option key={u}>{u}</option>)}
                                          </select>
                                        </div>
                                        {/* Single settings button */}
                                        <div className="relative shrink-0">
                                          <button
                                            onClick={() => setOpenCellSettings(isCellOpen ? null : cellKey)}
                                            title="Cell settings"
                                            className={`p-0.5 rounded transition-colors ${isCellOpen ? 'text-primary bg-primary/10'
                                              : !isIncluded ? 'text-slate-300 hover:text-slate-500'
                                                : selectedBatch ? 'text-sky-400 hover:text-sky-600'
                                                  : 'text-slate-300 hover:text-slate-500'
                                              }`}
                                          >
                                            <span className="material-symbols-outlined text-[15px]">settings</span>
                                          </button>
                                          {/* Popover */}
                                          {isCellOpen && (
                                            <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 space-y-3">
                                              {/* Include / Exclude */}
                                              <div>
                                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">In total calculation</p>
                                                <button
                                                  onClick={() => updateFormulaValue(stage.id, mat.id, f.id, 'included', !isIncluded)}
                                                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border text-xs font-medium transition-colors ${isIncluded
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                                    }`}
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">{isIncluded ? 'check_circle' : 'cancel'}</span>
                                                  {isIncluded ? 'Included' : 'Excluded'}
                                                </button>
                                              </div>
                                              {/* Batch */}
                                              <div>
                                                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Material batch</p>
                                                <select
                                                  value={fv.batchId ?? ''}
                                                  onChange={e => updateFormulaValue(stage.id, mat.id, f.id, 'batchId', e.target.value || null)}
                                                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 focus:ring-1 focus:ring-primary"
                                                >
                                                  <option value="">— No batch assigned —</option>
                                                  {matBatches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.batchNo}</option>
                                                  ))}
                                                </select>
                                                {selectedBatch && (
                                                  <div className="mt-1.5 flex items-center gap-1.5">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${selectedBatch.qcStatus === 'Passed'
                                                      ? 'bg-green-50 text-green-700 border-green-200'
                                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                      }`}>QC: {selectedBatch.qcStatus}</span>
                                                    <span className="text-[9px] text-slate-400">exp {selectedBatch.expiryDate}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {/* Status strip */}
                                      <div className="mt-1 flex items-center gap-1.5 flex-wrap min-h-[14px]">
                                        {!isIncluded && <span className="text-[9px] text-slate-400 italic">excluded</span>}
                                        {selectedBatch && isIncluded && (
                                          <span className="text-[9px] text-sky-500 font-medium truncate">{selectedBatch.batchNo}</span>
                                        )}
                                        {fv.qty && !sameUom && isIncluded && (
                                          conversion?.incompatible
                                            ? <span className="text-[9px] text-red-500">⚠ unit mismatch</span>
                                            : conversion?.value != null
                                              ? <span className="text-[9px] text-emerald-600">≈ {conversion.value} {numeratorUom}</span>
                                              : null
                                        )}
                                      </div>
                                    </td>
                                  )
                                })}
                                {/* empty add-formula col cell */}
                                <td className="p-3" />
                              </tr>
                            ))}
                            {/* Add Material row — drag+stage covered by rowSpan; material cell is sticky */}
                            <tr
                              className={`border-b border-slate-200 dark:border-slate-800 transition-colors ${dragOverStageId === stage.id && dragStageId !== stage.id ? 'bg-primary/5' : ''} ${dragStageId === stage.id ? 'opacity-40' : ''}`}
                              onDragOver={(e) => handleStageDragOver(e, stage.id)}
                              onDrop={(e) => handleStageDrop(e, stage.id)}
                            >
                              <td className={`px-3 py-2 w-[240px] min-w-[240px] max-w-[240px] ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
                                <button
                                  onClick={() => addMaterial(stage.id)}
                                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-bold uppercase tracking-wider"
                                >
                                  <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Material
                                </button>
                              </td>
                              <td colSpan={formulas.length + 1} className="p-2" />
                            </tr>
                          </>
                        )}
                      </Fragment>
                    )
                  })}
                  {/* Add Stage row — pinned to frozen columns, never scrolls */}
                  <tr>
                    <td className={`p-0 w-[44px] min-w-[44px] max-w-[44px] ${STICKY_DRAG} ${BG_MATERIAL}`} />
                    <td colSpan={2} className={`px-3 py-2.5 w-[440px] min-w-[440px] max-w-[440px] ${STICKY_STAGE} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={addStage}
                          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-bold uppercase tracking-wider"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Stage
                        </button>
                        {stages.length > 0 && (
                          <button
                            onClick={() => setShowResetConfirm(true)}
                            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[11px] font-bold uppercase tracking-wider"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete_sweep</span> Reset All
                          </button>
                        )}
                      </div>
                    </td>
                    <td colSpan={formulas.length + 1} />
                  </tr>
                </>
              )}
            </tbody>
            <tfoot>
              <tr className={`font-bold ${BG_HEADER}`}>
                {/* Spans drag + stage + material — sticky at left-0 with freeze border */}
                <td
                  colSpan={3}
                  className={`p-3 text-right border-t uppercase text-[10px] tracking-widest text-slate-500 w-[484px] min-w-[484px] max-w-[484px] ${STICKY_DRAG} ${BG_HEADER} ${FREEZE_BORDER}`}
                >
                  Theoretical Total
                </td>
                {totalPerFormula.map(({ id, total }) => (
                  <td key={id} className="p-3 border-r border-t border-slate-200 dark:border-slate-800 text-primary text-xs">
                    {total > 0 ? `${parseFloat(total.toPrecision(6))} ${numeratorUom}` : '—'}
                  </td>
                ))}
                <td className="border-t border-slate-200 dark:border-slate-800" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formula Materials Summary */}
        {allMaterials.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <span className="material-symbols-outlined text-primary text-[18px]">inventory</span>
                Formula Materials Summary
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Converted to {numeratorUom} / {denominatorUom}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-max w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Type</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Material Code</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Material Name</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Formula</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Stage</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Batch QC No</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700 text-right">Quantity ({numeratorUom})</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Status from Stock</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Production Date</th>
                    <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Storage Condition</th>
                    <th className="px-4 py-2">Storage Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allMaterials.flatMap((m) => {
                    const stageName = stages.find(s => s.materials.some(sm => sm.id === m.id))?.name ?? '—'

                    return formulas.map(f => {
                      const fv = m.formulaValues?.[f.id]
                      const isIncluded = fv?.included !== false
                      const conv = convertToNumerator(fv?.qty, fv?.uom, numeratorUom)
                      const sameUom = fv?.uom === numeratorUom
                      // Resolve selected batch
                      const selectedBatch = MATERIAL_BATCHES.find(b => b.id === fv?.batchId)

                      // Raw amount in numeratorUom
                      let rawAmt = null
                      if (fv?.qty && isIncluded) {
                        if (sameUom) rawAmt = parseFloat(fv.qty)
                        else if (conv?.value) rawAmt = conv.value
                      }

                      // Quantity = rawAmt × (per-formula scale or global scale)
                      const effectiveScale = useIndividualScales ? (f.scale ?? 1) : scale
                      let qtyDisplay
                      if (!isIncluded) {
                        qtyDisplay = <span className="text-slate-300 italic text-[10px]">Excluded</span>
                      } else if (rawAmt == null) {
                        qtyDisplay = <span className="text-slate-400">—</span>
                      } else if (conv?.incompatible) {
                        qtyDisplay = (
                          <span className="text-red-500 flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-[11px]">error</span>Incompatible
                          </span>
                        )
                      } else {
                        const scaled = parseFloat((rawAmt * effectiveScale).toPrecision(6))
                        qtyDisplay = `${scaled} ${numeratorUom}`
                      }

                      // Batch QC badge
                      let batchCell
                      if (selectedBatch) {
                        const qcPassed = selectedBatch.qcStatus === 'Passed'
                        batchCell = (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">{selectedBatch.batchNo}</span>
                            <span className={`inline-flex w-fit px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${qcPassed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>{selectedBatch.qcStatus}</span>
                          </div>
                        )
                      } else {
                        batchCell = <span className="text-slate-400 text-[10px] italic">Not Assigned</span>
                      }

                      return (
                        <tr key={`${m.id}-${f.id}`} className={!isIncluded ? 'text-slate-400' : ''}>
                          {/* Type */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">
                            {m.material?.type
                              ? <TypeBadge type={m.material.type} />
                              : <span className="text-slate-400">—</span>}
                          </td>
                          {/* Material Code */}
                          <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-700">
                            {m.material?.code}
                          </td>
                          {/* Material Name */}
                          <td className="px-4 py-2 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">
                            {m.material?.name}
                          </td>
                          {/* Formula */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            {f.name}
                          </td>
                          {/* Stage */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            {stageName}
                          </td>
                          {/* Batch QC No */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">
                            {batchCell}
                          </td>
                          {/* Quantity = per-formula amount × scale */}
                          <td className="px-4 py-2 text-right font-medium dark:text-slate-200 border-r border-slate-100 dark:border-slate-700">
                            {qtyDisplay}
                          </td>
                          {/* Status from Stock */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">—</span>
                          </td>
                          {/* Production Date */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">—</span>
                          </td>
                          {/* Storage Condition */}
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">—</span>
                          </td>
                          {/* Storage Location */}
                          <td className="px-4 py-2">
                            <span className="text-slate-400">—</span>
                          </td>
                        </tr>
                      )
                    })
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>}

      {/* Save Formula dialog */}
      {showSaveTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSaveTemplate(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">bookmark_add</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Save Formula</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Saves the current stages, materials, and formula values as a reusable template.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Template name</label>
              <input
                type="text"
                autoFocus
                value={templateNameInput}
                onChange={e => setTemplateNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
                placeholder="e.g. Hydrogel Base v1"
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">{stages.length} stage{stages.length !== 1 ? 's' : ''} · {stages.reduce((n, s) => n + s.materials.length, 0)} material{stages.reduce((n, s) => n + s.materials.length, 0) !== 1 ? 's' : ''} · {formulas.length} formula column{formulas.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateNameInput.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">bookmark_add</span> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Formula dialog */}
      {showApplyTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowApplyTemplate(false); setApplyConfirmId(null) }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md flex flex-col max-h-[80vh]">
            {/* Dialog header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">bookmarks</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Apply Formula</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Select a template to replace the current formulation.</p>
              </div>
              <button onClick={() => { setShowApplyTemplate(false); setApplyConfirmId(null) }} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            {/* Template list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {savedTemplates.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No saved templates yet.</p>
              ) : savedTemplates.map(t => (
                <div key={t.id} className={`rounded-lg border p-3 transition-colors ${applyConfirmId === t.id ? 'border-primary/40 bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.stageCount} stage{t.stageCount !== 1 ? 's' : ''} · {t.materialCount} material{t.materialCount !== 1 ? 's' : ''} · {t.formulas.length} formula{t.formulas.length !== 1 ? 's' : ''}</p>
                      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">{t.savedAt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSavedTemplates(prev => prev.filter(x => x.id !== t.id))}
                        className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors"
                        title="Delete template"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                      <button
                        onClick={() => setApplyConfirmId(prev => prev === t.id ? null : t.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${applyConfirmId === t.id ? 'bg-primary/10 text-primary' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-primary hover:text-primary'}`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  {/* Inline confirm */}
                  {applyConfirmId === t.id && (
                    <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        Current stages will be replaced.
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setApplyConfirmId(null)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApplyTemplate(t)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-primary hover:bg-primary/90 rounded transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset all stages confirmation dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 text-[22px] shrink-0 mt-0.5">delete_sweep</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Reset all stages?</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  All {stages.length} stage{stages.length !== 1 ? 's' : ''} and their materials will be permanently removed. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleReset(); setShowResetConfirm(false) }}
                className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span> Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
