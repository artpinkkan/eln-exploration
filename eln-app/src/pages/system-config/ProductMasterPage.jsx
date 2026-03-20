import { useState } from 'react'
import MasterTableShell from '../../components/MasterTableShell'
import ProductFormModal from './ProductFormModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'

/* ── Status badge ── */
const STATUS_STYLES = {
  'Active':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-100   text-slate-500   border-slate-200',
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
  const icon = status === 'Active' ? 'check_circle' : 'cancel'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{icon}</span>
      {status}
    </span>
  )
}

/* ── Table columns ── */
const COLUMNS = [
  { key: 'productName', label: 'Product Name'                  },
  { key: 'createdAt',   label: 'Created At',   width: '180px' },
  { key: 'status',      label: 'Status',       width: '130px' },
]

/* ── Filter config ── */
const FILTER_CONFIG = [
  { key: 'productName', label: 'Product Name', type: 'text' },
  { key: 'createdAt',   label: 'Created At',   type: 'text' },
  { key: 'status', label: 'Status', type: 'multiselect', options: ['Active', 'Inactive'] },
]

/* ── Timestamp helper ── */
function nowTimestamp() {
  const d = new Date()
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`
}

/* ── Initial mock data ── */
const INITIAL_DATA = [
  { id: 1,  productName: 'Product UAT',          createdAt: '16-03-2026 10:46', status: 'Active'   },
  { id: 2,  productName: 'Neuro-Regen Formula',  createdAt: '10-03-2026 09:12', status: 'Active'   },
  { id: 3,  productName: 'Hemostat-V Compound',  createdAt: '05-03-2026 14:30', status: 'Active'   },
  { id: 4,  productName: 'Ocular Strain Blend',  createdAt: '28-02-2026 11:00', status: 'Active'   },
  { id: 5,  productName: 'Cardiac Valve Extract',createdAt: '20-02-2026 08:45', status: 'Inactive' },
  { id: 6,  productName: 'Plasma-G Solution',    createdAt: '15-02-2026 16:20', status: 'Active'   },
  { id: 7,  productName: 'Vis-20 Supplement',    createdAt: '10-02-2026 13:00', status: 'Active'   },
  { id: 8,  productName: 'Compound-X Base',      createdAt: '01-02-2026 10:30', status: 'Inactive' },
]

/* ── Cell renderer ── */
function renderCell(row, key) {
  switch (key) {
    case 'productName':
      return (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>inventory_2</span>
          </div>
          <span className="text-xs font-medium text-slate-800">{row.productName}</span>
        </div>
      )
    case 'createdAt':
      return (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '12px' }}>schedule</span>
          {row.createdAt}
        </span>
      )
    case 'status':
      return <StatusBadge status={row.status} />
    default:
      return <span className="text-xs text-slate-600">{row[key] ?? '—'}</span>
  }
}

export default function ProductMasterPage() {
  const [data, setData]                   = useState(INITIAL_DATA)
  const [nextId, setNextId]               = useState(INITIAL_DATA.length + 1)
  const [formOpen, setFormOpen]           = useState(false)
  const [editRow, setEditRow]             = useState(null)
  const [deleteRow, setDeleteRow]         = useState(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null)

  function handleAdd() { setEditRow(null); setFormOpen(true) }
  function handleEdit(row) { setEditRow(row); setFormOpen(true) }

  function handleSave(formData) {
    if (editRow) {
      setData((prev) => prev.map((r) => r.id === editRow.id ? { ...r, ...formData } : r))
    } else {
      setData((prev) => [...prev, { ...formData, id: nextId, createdAt: nowTimestamp() }])
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
        title="Product"
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
        <ProductFormModal
          initialData={editRow}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditRow(null) }}
        />
      )}

      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteRow.productName}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {bulkDeleteIds && (
        <ConfirmDeleteModal
          title={`Delete ${bulkDeleteIds.length} Product${bulkDeleteIds.length > 1 ? 's' : ''}`}
          message={`Are you sure you want to delete ${bulkDeleteIds.length} selected product${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeleteIds(null)}
        />
      )}
    </>
  )
}
