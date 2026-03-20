import { useState } from 'react'
import MasterTableShell from '../../components/MasterTableShell'
import MaterialBatchFormModal from './MaterialBatchFormModal'
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

/* ── Stock display ── */
function StockCell({ qty, unit }) {
  const isEmpty = qty === '' || qty === null || qty === undefined
  if (isEmpty) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border bg-red-50 text-red-500 border-red-200">
        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>warning</span>
        Out of Stock
      </span>
    )
  }
  return (
    <span className="text-xs text-slate-700 font-medium">
      {Number(qty).toLocaleString()} <span className="text-slate-400">{unit}</span>
    </span>
  )
}

/* ── Table columns ── */
const COLUMNS = [
  { key: 'materialCode', label: 'Material Code', width: '140px' },
  { key: 'type',         label: 'Type',          width: '120px' },
  { key: 'batchQcNo',   label: 'Batch QC No',   width: '140px' },
  { key: 'materialName', label: 'Material Name'              },
  { key: 'availableStock', label: 'Available Stock', width: '160px' },
]

/* ── Advanced filter config ── */
const FILTER_CONFIG = [
  { key: 'materialCode', label: 'Material Code',  type: 'text' },
  {
    key: 'type', label: 'Type', type: 'multiselect',
    options: ['MATERIAL', 'SAMPLE', 'REAGENT'],
  },
  { key: 'batchQcNo',   label: 'Batch QC No',   type: 'text' },
  { key: 'materialName', label: 'Material Name', type: 'text' },
]

/* ── Initial mock data ── */
const INITIAL_DATA = [
  { id: 1,  materialCode: 'MAT-ETH-282', type: 'MATERIAL', batchQcNo: '868949', materialName: '70% Air Kelapa',           stockQty: '100',     stockUnit: 'L'   },
  { id: 2,  materialCode: 'MAT-ETH-282', type: 'MATERIAL', batchQcNo: '386912', materialName: '70% Air Kelapa',           stockQty: '',        stockUnit: 'L'   },
  { id: 3,  materialCode: 'MAT-SOD-001', type: 'MATERIAL', batchQcNo: '128943', materialName: 'Material A',               stockQty: '630.991', stockUnit: 'mg'  },
  { id: 4,  materialCode: 'REA-POT-012', type: 'REAGENT',  batchQcNo: '552109', materialName: 'Potassium Bromide',        stockQty: '15.400',  stockUnit: 'g'   },
  { id: 5,  materialCode: 'SMP-PRO-045', type: 'SAMPLE',   batchQcNo: '774301', materialName: 'Protein Isolate Batch C',  stockQty: '250',     stockUnit: 'g'   },
  { id: 6,  materialCode: 'REA-HCL-010', type: 'REAGENT',  batchQcNo: '661208', materialName: 'Hydrochloric Acid 1.0M',  stockQty: '5',       stockUnit: 'L'   },
  { id: 7,  materialCode: 'MAT-ACE-034', type: 'MATERIAL', batchQcNo: '445519', materialName: 'Acetonitrile HPLC',        stockQty: '',        stockUnit: 'L'   },
  { id: 8,  materialCode: 'SMP-LIP-012', type: 'SAMPLE',   batchQcNo: '992340', materialName: 'Lipid Extract Alpha',      stockQty: '50',      stockUnit: 'mg'  },
  { id: 9,  materialCode: 'REA-NaOH-07', type: 'REAGENT',  batchQcNo: '337712', materialName: 'Sodium Hydroxide 1N',     stockQty: '2',       stockUnit: 'L'   },
  { id: 10, materialCode: 'MAT-MeOH-22', type: 'MATERIAL', batchQcNo: '103847', materialName: 'Methanol Anhydrous',       stockQty: '500',     stockUnit: 'mL'  },
  { id: 11, materialCode: 'SMP-CAR-088', type: 'SAMPLE',   batchQcNo: '228861', materialName: 'Carbohydrate Mix D-Type',  stockQty: '',        stockUnit: 'g'   },
  { id: 12, materialCode: 'MAT-SOD-893', type: 'MATERIAL', batchQcNo: '519204', materialName: 'Sodium Chloride AR',       stockQty: '1',       stockUnit: 'kg'  },
]

/* ── Cell renderer — needs availableStock virtual key ── */
function renderCell(row, key) {
  switch (key) {
    case 'type':
      return <TypeBadge type={row.type} />
    case 'materialCode':
      return <span className="text-xs font-mono text-slate-600">{row.materialCode}</span>
    case 'batchQcNo':
      return <span className="text-xs font-mono font-medium text-slate-700">{row.batchQcNo}</span>
    case 'materialName':
      return <span className="text-xs font-medium text-slate-800">{row.materialName}</span>
    case 'availableStock':
      return <StockCell qty={row.stockQty} unit={row.stockUnit} />
    default:
      return <span className="text-xs text-slate-600">{row[key] ?? '—'}</span>
  }
}

/* ── Filter needs rows with an availableStock field for search; we keep stockQty/stockUnit separate ── */

export default function MaterialBatchMasterPage() {
  const [data, setData]               = useState(INITIAL_DATA)
  const [nextId, setNextId]           = useState(INITIAL_DATA.length + 1)
  const [formOpen, setFormOpen]       = useState(false)
  const [editRow, setEditRow]         = useState(null)
  const [deleteRow, setDeleteRow]     = useState(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null)

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
      setData((prev) => prev.map((r) => r.id === editRow.id ? { ...r, ...formData } : r))
    } else {
      setData((prev) => [...prev, { ...formData, id: nextId }])
      setNextId((n) => n + 1)
    }
    setFormOpen(false)
    setEditRow(null)
  }

  function handleDeleteConfirm() {
    setData((prev) => prev.filter((r) => r.id !== deleteRow.id))
    setDeleteRow(null)
  }

  function handleBulkDeleteConfirm() {
    const idSet = new Set(bulkDeleteIds)
    setData((prev) => prev.filter((r) => !idSet.has(r.id)))
    setBulkDeleteIds(null)
  }

  return (
    <>
      <MasterTableShell
        title="Material Batch"
        icon="inventory_2"
        columns={COLUMNS}
        data={data}
        renderCell={renderCell}
        filterConfig={FILTER_CONFIG}
        onAdd={handleAdd}
        onImport={() => {}}
        onEdit={handleEdit}
        onDelete={(row) => setDeleteRow(row)}
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
      />

      {formOpen && (
        <MaterialBatchFormModal
          initialData={editRow}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditRow(null) }}
        />
      )}

      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Material Batch"
          message={`Are you sure you want to delete batch "${deleteRow.batchQcNo}" (${deleteRow.materialName})? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {bulkDeleteIds && (
        <ConfirmDeleteModal
          title={`Delete ${bulkDeleteIds.length} Batch${bulkDeleteIds.length > 1 ? 'es' : ''}`}
          message={`Are you sure you want to delete ${bulkDeleteIds.length} selected batch${bulkDeleteIds.length > 1 ? 'es' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeleteIds(null)}
        />
      )}
    </>
  )
}
