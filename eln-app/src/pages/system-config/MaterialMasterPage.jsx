import { useState, useEffect } from 'react'
import MasterTableShell from '../../components/MasterTableShell'
import MaterialFormModal from './MaterialFormModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'

/* ── Type badge ── */
const TYPE_STYLES = {
  MATERIAL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SAMPLE:   'bg-sky-100    text-sky-700    border-sky-200',
  REAGENT:  'bg-orange-100 text-orange-700 border-orange-200',
}

function TypeBadge({ type }) {
  const cls = TYPE_STYLES[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${cls}`}>
      {type}
    </span>
  )
}

/* ── Table columns ── */
const COLUMNS = [
  { key: 'type',         label: 'Type',          width: '120px' },
  { key: 'materialCode', label: 'Material Code',  width: '150px' },
  { key: 'materialName', label: 'Material Name'              },
  { key: 'uomName',      label: 'UOM Name',       width: '160px' },
  { key: 'density',      label: 'Density',        width: '130px' },
]

/* ── Advanced filter config ── */
const FILTER_CONFIG = [
  {
    key: 'type', label: 'Type', type: 'multiselect',
    options: ['MATERIAL', 'SAMPLE', 'REAGENT'],
  },
  { key: 'materialCode', label: 'Material Code', type: 'text' },
  { key: 'materialName', label: 'Material Name', type: 'text' },
  {
    key: 'uomName', label: 'UOM Name', type: 'multiselect',
    options: ['Milliliter (mL)', 'Liter (L)', 'Gram (g)', 'Kilogram (kg)', 'Milligram (mg)', 'Microliter (µL)', 'Microgram (µg)', 'Mole (mol)', 'Millimole (mmol)'],
  },
  { key: 'density', label: 'Density', type: 'text' },
]

/* ── Initial data ── */
const INITIAL_DATA = [
  { id: 1,  type: 'MATERIAL', materialCode: 'MAT-ETH-282', materialName: 'Ethanol Absolute 99.9%',    materialSub: 'Quality Control/Reagent Grade', uomName: 'Milliliter (mL)', density: '0.789 g/cm³' },
  { id: 2,  type: 'SAMPLE',   materialCode: 'SMP-PRO-045', materialName: 'Protein Isolate Batch C',   materialSub: 'Quality Control/Standard',      uomName: 'Gram (g)',        density: '1.352 g/cm³' },
  { id: 3,  type: 'REAGENT',  materialCode: 'REA-HCL-010', materialName: 'Hydrochloric Acid 1.0M',    materialSub: 'Standard/Volumetric Solution',  uomName: 'Liter (L)',       density: '1.018 g/cm³' },
  { id: 4,  type: 'MATERIAL', materialCode: 'MAT-SOD-893', materialName: 'Sodium Chloride AR',        materialSub: 'Analytical Reagent Grade',      uomName: 'Kilogram (kg)',   density: '2.160 g/cm³' },
  { id: 5,  type: 'SAMPLE',   materialCode: 'SMP-LIP-012', materialName: 'Lipid Extract Alpha',       materialSub: 'Bio-derived Lipid Profile',     uomName: 'Milligram (mg)',  density: '0.910 g/cm³' },
  { id: 6,  type: 'REAGENT',  materialCode: 'REA-H2O-001', materialName: 'Purified Water HPLC Grade', materialSub: 'HPLC/LC-MS Grade',              uomName: 'Milliliter (mL)', density: '0.998 g/cm³' },
  { id: 7,  type: 'MATERIAL', materialCode: 'MAT-ACE-034', materialName: 'Acetonitrile HPLC',         materialSub: 'HPLC/LC-MS Solvent',            uomName: 'Liter (L)',       density: '0.786 g/cm³' },
  { id: 8,  type: 'REAGENT',  materialCode: 'REA-NaOH-07', materialName: 'Sodium Hydroxide 1N',       materialSub: 'Standard Solution Volumetric',  uomName: 'Liter (L)',       density: '1.040 g/cm³' },
  { id: 9,  type: 'SAMPLE',   materialCode: 'SMP-CAR-088', materialName: 'Carbohydrate Mix D-Type',   materialSub: 'Dietary Reference Standard',    uomName: 'Gram (g)',        density: '1.590 g/cm³' },
  { id: 10, type: 'MATERIAL', materialCode: 'MAT-MeOH-22', materialName: 'Methanol Anhydrous',        materialSub: 'Anhydrous/Dry Solvent Grade',   uomName: 'Milliliter (mL)', density: '0.791 g/cm³' },
  { id: 11, type: 'REAGENT',  materialCode: 'REA-H3PO-03', materialName: 'Phosphoric Acid 85%',       materialSub: 'ACS Reagent Grade',             uomName: 'Milliliter (mL)', density: '1.685 g/cm³' },
  { id: 12, type: 'SAMPLE',   materialCode: 'SMP-VIT-019', materialName: 'Vitamin C Standard',        materialSub: 'USP Reference Standard',        uomName: 'Milligram (mg)',  density: '1.650 g/cm³' },
]

/* ── Cell renderer ── */
function renderCell(row, key) {
  switch (key) {
    case 'type':
      return <TypeBadge type={row.type} />
    case 'materialName':
      return (
        <div>
          <p className="text-xs font-medium text-slate-800">{row.materialName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.materialSub}</p>
        </div>
      )
    case 'density':
      return <span className="text-xs text-slate-600 font-mono">{row.density}</span>
    default:
      return <span className="text-xs text-slate-700">{row[key] ?? '—'}</span>
  }
}

const STORAGE_KEY = 'eln_material_master'

export default function MaterialMasterPage() {
  const [data, setData]             = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : INITIAL_DATA
    } catch { return INITIAL_DATA }
  })
  const [nextId, setNextId]         = useState(INITIAL_DATA.length + 1)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  /* modal state */
  const [formOpen, setFormOpen]       = useState(false)
  const [editRow, setEditRow]         = useState(null)
  const [deleteRow, setDeleteRow]     = useState(null)   // single row delete
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null) // array of ids for bulk delete

  /* ── Handlers ── */
  function handleAdd() {
    setEditRow(null)
    setFormOpen(true)
  }

  function handleEdit(row) {
    setEditRow(row)
    setFormOpen(true)
  }

  function handleSave(formData) {
    if (editRow) {
      /* Update existing */
      setData((prev) => prev.map((r) => r.id === editRow.id ? { ...r, ...formData } : r))
    } else {
      /* Create new */
      setData((prev) => [...prev, { ...formData, id: nextId }])
      setNextId((n) => n + 1)
    }
    setFormOpen(false)
    setEditRow(null)
  }

  function handleDeleteRequest(row) {
    setDeleteRow(row)
  }

  function handleDeleteConfirm() {
    setData((prev) => prev.filter((r) => r.id !== deleteRow.id))
    setDeleteRow(null)
  }

  function handleBulkDeleteRequest(ids) {
    setBulkDeleteIds(ids)
  }

  function handleBulkDeleteConfirm() {
    const idSet = new Set(bulkDeleteIds)
    setData((prev) => prev.filter((r) => !idSet.has(r.id)))
    setBulkDeleteIds(null)
  }

  return (
    <>
      <MasterTableShell
        title="Material"
        icon="science"
        columns={COLUMNS}
        data={data}
        renderCell={renderCell}
        filterConfig={FILTER_CONFIG}
        onAdd={handleAdd}
        onImport={() => {}}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onBulkDelete={handleBulkDeleteRequest}
      />

      {formOpen && (
        <MaterialFormModal
          initialData={editRow}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditRow(null) }}
        />
      )}

      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Material"
          message={`Are you sure you want to delete "${deleteRow.materialName}" (${deleteRow.materialCode})? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {bulkDeleteIds && (
        <ConfirmDeleteModal
          title={`Delete ${bulkDeleteIds.length} Material${bulkDeleteIds.length > 1 ? 's' : ''}`}
          message={`Are you sure you want to delete ${bulkDeleteIds.length} selected record${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeleteIds(null)}
        />
      )}
    </>
  )
}
