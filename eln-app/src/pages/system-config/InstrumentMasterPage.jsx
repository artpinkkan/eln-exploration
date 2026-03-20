import { useState } from 'react'
import MasterTableShell from '../../components/MasterTableShell'
import InstrumentFormModal from './InstrumentFormModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'

/* ── Status badge ── */
const STATUS_STYLES = {
  'Active':     'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Not Active': 'bg-slate-100   text-slate-500   border-slate-200',
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
  { key: 'instrumentName', label: 'Instrument Name'              },
  { key: 'brandType',      label: 'Brand / Type',  width: '220px' },
  { key: 'createdAt',      label: 'Created At',    width: '140px' },
  { key: 'status',         label: 'Status',        width: '130px' },
]

/* ── Advanced filter config ── */
const FILTER_CONFIG = [
  { key: 'instrumentName', label: 'Instrument Name', type: 'text' },
  { key: 'brandType',      label: 'Brand / Type',    type: 'text' },
  { key: 'createdAt',      label: 'Created At',      type: 'text' },
  {
    key: 'status', label: 'Status', type: 'multiselect',
    options: ['Active', 'Not Active'],
  },
]

/* ── Initial mock data ── */
const today = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`
}

const INITIAL_DATA = [
  { id: 1,  instrumentName: 'Analytical Balance AX224',         brandType: 'Shimadzu / Analytical Balance',        createdAt: '01-01-2024', status: 'Active'     },
  { id: 2,  instrumentName: 'UV-Vis Spectrophotometer UV-1900i', brandType: 'Shimadzu / UV-Vis Spectrophotometer',  createdAt: '03-02-2024', status: 'Active'     },
  { id: 3,  instrumentName: 'HPLC Prominence LC-20A',           brandType: 'Shimadzu / HPLC System',               createdAt: '15-02-2024', status: 'Active'     },
  { id: 4,  instrumentName: 'pH Meter FiveEasy F20',            brandType: 'Mettler Toledo / pH Meter',            createdAt: '20-03-2024', status: 'Active'     },
  { id: 5,  instrumentName: 'Centrifuge Mikro 220R',            brandType: 'Hettich / Refrigerated Centrifuge',    createdAt: '05-04-2024', status: 'Active'     },
  { id: 6,  instrumentName: 'Magnetic Stirrer IKA RCT Basic',   brandType: 'IKA / Magnetic Stirrer',               createdAt: '10-04-2024', status: 'Not Active' },
  { id: 7,  instrumentName: 'Vortex Mixer Genius 3',            brandType: 'IKA / Vortex Mixer',                   createdAt: '22-05-2024', status: 'Active'     },
  { id: 8,  instrumentName: 'Water Bath WB-11',                 brandType: 'Memmert / Water Bath',                 createdAt: '01-06-2024', status: 'Not Active' },
  { id: 9,  instrumentName: 'Freeze Dryer Alpha 2-4 LD Plus',   brandType: 'Martin Christ / Freeze Dryer',         createdAt: '14-07-2024', status: 'Active'     },
  { id: 10, instrumentName: 'Viscometer Brookfield DV2T',       brandType: 'Brookfield / Digital Viscometer',      createdAt: '30-08-2024', status: 'Active'     },
  { id: 11, instrumentName: 'Karl Fischer Titrator V20S',       brandType: 'Mettler Toledo / KF Titrator',         createdAt: '12-09-2024', status: 'Not Active' },
  { id: 12, instrumentName: 'Particle Size Analyzer LS 13 320', brandType: 'Beckman Coulter / Laser Diffraction',  createdAt: '25-10-2024', status: 'Active'     },
]

/* ── Cell renderer ── */
function renderCell(row, key) {
  switch (key) {
    case 'instrumentName':
      return <span className="text-xs font-medium text-slate-800">{row.instrumentName}</span>
    case 'status':
      return <StatusBadge status={row.status} />
    case 'createdAt':
      return (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '12px' }}>calendar_today</span>
          {row.createdAt}
        </span>
      )
    default:
      return <span className="text-xs text-slate-600">{row[key] ?? '—'}</span>
  }
}

export default function InstrumentMasterPage() {
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
      setData((prev) => [...prev, { ...formData, id: nextId, createdAt: today() }])
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
        title="Instrument"
        icon="biotech"
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
        <InstrumentFormModal
          initialData={editRow}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditRow(null) }}
        />
      )}

      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Instrument"
          message={`Are you sure you want to delete "${deleteRow.instrumentName}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {bulkDeleteIds && (
        <ConfirmDeleteModal
          title={`Delete ${bulkDeleteIds.length} Instrument${bulkDeleteIds.length > 1 ? 's' : ''}`}
          message={`Are you sure you want to delete ${bulkDeleteIds.length} selected instrument${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeleteIds(null)}
        />
      )}
    </>
  )
}
