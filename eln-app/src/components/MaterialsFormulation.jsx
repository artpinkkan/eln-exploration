import { useState, Fragment } from 'react'

const MASTER_MATERIALS = [
  { code: 'MAT-001', name: 'Purified Water, USP Grade', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-002', name: 'Ethanol 96%', type: 'REAGENT', qc: 'Passed' },
  { code: 'MAT-003', name: 'Isopropanol', type: 'REAGENT', qc: 'Passed' },
  { code: 'MAT-042', name: 'Glycerin USP, Vegetable Source', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-055', name: 'Sodium Chloride, USP', type: 'MATERIAL', qc: 'Passed' },
  { code: 'MAT-061', name: 'Microcrystalline Cellulose', type: 'SAMPLE', qc: 'Pending' },
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
const STICKY_DRAG = 'sticky left-0 z-10'
const STICKY_STAGE = 'sticky left-10 z-10'
const STICKY_MATERIAL = 'sticky left-[232px] z-10'
// Solid backgrounds required so scrolling rows don't bleed through frozen cells
const BG_HEADER = 'bg-slate-50 dark:bg-slate-900'
const BG_STAGE = 'bg-slate-50 dark:bg-slate-900'
const BG_MATERIAL = 'bg-white dark:bg-slate-950'
// Thicker right border on last frozen column as a visual freeze indicator
const FREEZE_BORDER = 'border-r-2 border-r-slate-200 dark:border-r-slate-700'

export default function MaterialsFormulation() {
  const [numeratorUom, setNumeratorUom] = useState('g')
  const [useIndividualScales, setUseIndividualScales] = useState(false)
  const [denominatorUom, setDenominatorUom] = useState('Ampoule')
  const [scale, setScale] = useState(100)
  const [formulas, setFormulas] = useState([{ id: 1, name: 'Formula 1' }])
  const [stages, setStages] = useState([])
  const [isDirty, setIsDirty] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // ── Helpers ───────────────────────────────────────────────────────────────

  const mutate = (fn) => { setStages(fn); setIsDirty(true) }

  const emptyFormulaValues = () =>
    Object.fromEntries(formulas.map(f => [f.id, { qty: '', uom: 'g' }]))

  // ── Formula column actions ────────────────────────────────────────────────

  const addFormula = () => {
    const newFormula = { id: nextFormulaId++, name: `Formula ${formulas.length + 1}` }
    setFormulas(prev => [...prev, newFormula])
    setStages(prev => prev.map(s => ({
      ...s,
      materials: s.materials.map(m => ({
        ...m,
        formulaValues: { ...m.formulaValues, [newFormula.id]: { qty: '', uom: 'g' } },
      })),
    })))
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

  const addStage = () =>
    mutate(prev => [...prev, { id: nextStageId++, name: 'New Stage', materials: [] }])

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

  const handleSave = () => setIsDirty(false)
  const handleReset = () => { setStages([]); setIsDirty(false) }

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
    total: allMaterials.reduce((sum, m) => {
      const fv = m.formulaValues?.[f.id]
      if (!fv?.qty) return sum
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
    isDirty && {
      id: 'unsaved-changes',
      type: 'warning',
      message: 'Unsaved formulation changes — save to enable procedure editing.',
      actions: [
        { label: 'Save', onClick: handleSave },
        { label: 'Reset', onClick: handleReset, secondary: true },
      ],
    },
    isDirty && {
      id: 'template-copy-blocked',
      type: 'info',
      message: 'Save or reset your formulation changes before copying formulas from templates.',
    },
  ].filter(Boolean).filter(a => !dismissedAlerts.has(a.id))

  // ── Render ────────────────────────────────────────────────────────────────

  const totalCols = 3 + formulas.length + 1

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header — "+ Formula" removed; use the + icon at the table's right edge instead */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
        <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">biotech</span>
          Materials &amp; Formulation
        </h2>
        {isDirty && (
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">save</span> Save
          </button>
        )}
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

      <div className="p-6 space-y-6">
        {/* UOM Config Row */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg space-y-3">
          <div className={`grid grid-cols-1 gap-4 ${useIndividualScales ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Numerator UOM</label>
              <select
                value={numeratorUom}
                onChange={(e) => setNumeratorUom(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9"
              >
                <option>g</option>
                <option>kg</option>
                <option>L</option>
                <option>µg</option>
                <option>µL</option>
                <option>mg</option>
                <option>mL</option>
                <option>ng</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Denominator UOM</label>
              <select
                value={denominatorUom}
                onChange={(e) => setDenominatorUom(e.target.value)}
                className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9"
              >
                <option>Ampoule</option>
                <option>Bottle</option>
                <option>Cell</option>
                <option>Piece</option>
                <option>Sachet</option>
                <option>Syringe</option>
                <option>Tablet</option>
              </select>
            </div>
            {!useIndividualScales && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scale</label>
                <input
                  type="number"
                  value={scale}
                  min={1}
                  onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                  className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scale UOM</label>
              <input
                type="text"
                value={denominatorUom}
                readOnly
                className="w-full text-sm bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded h-9 cursor-not-allowed opacity-60"
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useIndividualScales}
              onChange={(e) => setUseIndividualScales(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Use individual scales per-formula</span>
          </label>
        </div>

        {/* Stage Table — overflow-x-auto enables scroll; cols 1-3 are position:sticky */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left">
                {/* col 1 — drag (frozen) */}
                <th className={`p-3 border-b border-r border-slate-200 dark:border-slate-800 w-10 text-center text-slate-400 ${STICKY_DRAG} ${BG_HEADER}`}>
                  <span className="material-symbols-outlined text-lg">drag_handle</span>
                </th>
                {/* col 2 — stage (frozen) */}
                <th className={`p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500 w-48 ${STICKY_STAGE} ${BG_HEADER}`}>
                  Stage
                </th>
                {/* col 3 — material (frozen, last frozen → thicker right border) */}
                <th className={`p-3 border-b font-bold uppercase text-[10px] tracking-widest text-slate-500 w-56 ${STICKY_MATERIAL} ${BG_HEADER} ${FREEZE_BORDER}`}>
                  Material
                </th>
                {/* Formula columns — scrollable */}
                {formulas.map(f => (
                  <th key={f.id} className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span>{f.name}</span>
                      <div className="flex items-center">
                        {formulas.length > 1 && (
                          <button
                            onClick={() => removeFormula(f.id)}
                            className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Remove formula"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
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
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            {/* drag — frozen */}
                            <td className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center align-top ${STICKY_DRAG} ${BG_STAGE}`}>
                              <span className="material-symbols-outlined text-slate-300 text-lg cursor-grab">drag_indicator</span>
                            </td>
                            {/* stage — frozen */}
                            <td className={`p-3 border-r border-slate-200 dark:border-slate-800 align-top ${STICKY_STAGE} ${BG_STAGE}`}>
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
                            <td colSpan={formulas.length + 2} className={`p-4 text-slate-400 text-xs italic ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
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
                              <tr key={mat.id} className="border-b border-slate-100 dark:border-slate-800">
                                {matIdx === 0 && (
                                  <>
                                    {/* drag — frozen, rowSpan covers all material rows + add-material row */}
                                    <td
                                      rowSpan={spanCount}
                                      className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center align-top ${STICKY_DRAG} ${BG_STAGE}`}
                                    >
                                      <span className="material-symbols-outlined text-slate-300 text-lg cursor-grab">drag_indicator</span>
                                    </td>
                                    {/* stage — frozen, rowSpan */}
                                    <td
                                      rowSpan={spanCount}
                                      className={`p-3 border-r border-slate-200 dark:border-slate-800 align-top ${STICKY_STAGE} ${BG_STAGE}`}
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
                                <td className={`p-3 align-top ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
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
                                {/* Formula cells — scrollable */}
                                {formulas.map(f => {
                                  const fv = mat.formulaValues?.[f.id] ?? { qty: '', uom: 'g' }
                                  const conversion = convertToNumerator(fv.qty, fv.uom, numeratorUom)
                                  const sameUom = fv.uom === numeratorUom

                                  return (
                                    <td key={f.id} className="p-3 border-r border-slate-200 dark:border-slate-800 align-top">
                                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded overflow-hidden bg-white dark:bg-slate-800">
                                        <input
                                          type="number"
                                          value={fv.qty}
                                          onChange={(e) => updateFormulaValue(stage.id, mat.id, f.id, 'qty', e.target.value)}
                                          placeholder="0"
                                          className="w-2/3 border-none bg-transparent text-xs py-1.5 px-2 focus:ring-0"
                                        />
                                        <select
                                          value={fv.uom}
                                          onChange={(e) => updateFormulaValue(stage.id, mat.id, f.id, 'uom', e.target.value)}
                                          className="w-1/3 border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[10px] py-1.5 focus:ring-0 text-slate-500"
                                        >
                                          {UOM_OPTIONS.map(u => <option key={u}>{u}</option>)}
                                        </select>
                                      </div>
                                      {fv.qty && !sameUom && (
                                        conversion?.incompatible ? (
                                          <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">error</span>
                                            Cannot convert {fv.uom} → {numeratorUom}
                                          </p>
                                        ) : conversion?.value != null ? (
                                          <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">sync_alt</span>
                                            ≈ {conversion.value} {numeratorUom}
                                          </p>
                                        ) : null
                                      )}
                                    </td>
                                  )
                                })}
                                {/* empty add-formula col cell */}
                                <td className="p-3" />
                              </tr>
                            ))}
                            {/* Add Material row — drag+stage covered by rowSpan; material cell is sticky */}
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                              <td className={`px-3 py-2 ${STICKY_MATERIAL} ${BG_MATERIAL} ${FREEZE_BORDER}`}>
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
                  {/* Add Stage row */}
                  <tr>
                    <td colSpan={totalCols} className="px-3 py-2.5">
                      <button
                        onClick={addStage}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-bold uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Stage
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
            <tfoot>
              <tr className={`font-bold ${BG_HEADER}`}>
                {/* Spans drag + stage + material — sticky at left-0 with freeze border */}
                <td
                  colSpan={3}
                  className={`p-3 text-right border-t uppercase text-[10px] tracking-widest text-slate-500 ${STICKY_DRAG} ${BG_HEADER} ${FREEZE_BORDER}`}
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
              <table className="w-full text-xs text-left">
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
                      const conv = convertToNumerator(fv?.qty, fv?.uom, numeratorUom)
                      const sameUom = fv?.uom === numeratorUom

                      // Raw amount in numeratorUom
                      let rawAmt = null
                      if (fv?.qty) {
                        if (sameUom) rawAmt = parseFloat(fv.qty)
                        else if (conv?.value) rawAmt = conv.value
                      }

                      // Quantity = rawAmt × scale
                      let qtyDisplay
                      if (rawAmt == null) {
                        qtyDisplay = <span className="text-slate-400">—</span>
                      } else if (conv?.incompatible) {
                        qtyDisplay = (
                          <span className="text-red-500 flex items-center gap-1 justify-end">
                            <span className="material-symbols-outlined text-[11px]">error</span>Incompatible
                          </span>
                        )
                      } else {
                        const scaled = parseFloat((rawAmt * scale).toPrecision(6))
                        qtyDisplay = `${scaled} ${numeratorUom}`
                      }

                      return (
                        <tr key={`${m.id}-${f.id}`}>
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
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${m.material?.qc === 'Passed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                              {m.material?.qc ?? '—'}
                            </span>
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
      </div>
    </div>
  )
}
