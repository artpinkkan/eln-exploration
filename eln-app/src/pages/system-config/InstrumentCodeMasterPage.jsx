import { useState } from 'react'
import MasterTableShell from '../../components/MasterTableShell'
import InstrumentCodeFormModal from './InstrumentCodeFormModal'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'

/* ─────────────────────────────────────────────
   Calibration status helpers
───────────────────────────────────────────── */
function getCalibrationStatus(dateStr) {
  if (!dateStr) return 'none'
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)   return 'expired'
  if (diffDays <= 30) return 'warning'
  return 'compliant'
}

const CALIBRATION_BADGE = {
  compliant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:   'bg-amber-50   text-amber-700   border-amber-200',
  expired:   'bg-red-50     text-red-600     border-red-200',
  none:      'bg-slate-50   text-slate-400   border-slate-200',
}
const CALIBRATION_ICON = {
  compliant: 'check_circle',
  warning:   'schedule',
  expired:   'cancel',
  none:      'remove',
}

function CalibrationBadge({ dateStr }) {
  if (!dateStr) return <span className="text-xs text-slate-300">—</span>

  const status  = getCalibrationStatus(dateStr)
  const cls     = CALIBRATION_BADGE[status]
  const icon    = CALIBRATION_ICON[status]

  // format dd-mm-yyyy
  const [y, m, d] = dateStr.split('-')
  const formatted = `${d}-${m}-${y}`

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold ${cls}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{icon}</span>
      {formatted}
    </span>
  )
}

function DateCell({ dateStr }) {
  if (!dateStr) return <span className="text-xs text-slate-300">—</span>
  const [y, m, d] = dateStr.split('-')
  return <span className="text-xs text-slate-600">{`${d}-${m}-${y}`}</span>
}

/* ─────────────────────────────────────────────
   Table config
───────────────────────────────────────────── */
const COLUMNS = [
  { key: 'instrumentCode',      label: 'Instrument Code',      width: '150px' },
  { key: 'instrumentName',      label: 'Instrument Name'                       },
  { key: 'brand',               label: 'Brand',                width: '160px' },
  { key: 'calibrationDueDate',  label: 'Calibration Due Date', width: '180px' },
  { key: 'requalificationDate', label: 'Requalification Date', width: '180px' },
]

const FILTER_CONFIG = [
  { key: 'instrumentCode', label: 'Instrument Code',  type: 'text' },
  { key: 'instrumentName', label: 'Instrument Name',  type: 'text' },
  { key: 'brand',          label: 'Brand',            type: 'text' },
  {
    key: '_calibStatus', label: 'Calibration Status', type: 'multiselect',
    options: ['Compliant', 'Warning', 'Expired'],
  },
]

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
const INITIAL_DATA = [
  { id: 1,  instrumentCode: 'VOR001',  instrumentName: 'Vortexer',                              brand: 'Kalbe',              calibrationDueDate: '2027-01-29', requalificationDate: ''           },
  { id: 2,  instrumentCode: 'HPLC-2',  instrumentName: 'HPLC System',                           brand: 'Waters',             calibrationDueDate: '2026-12-29', requalificationDate: '2029-06-15' },
  { id: 3,  instrumentCode: 'HPLCT',   instrumentName: 'High Performance Liquid Chromatograph', brand: 'KALSE',              calibrationDueDate: '2025-12-24', requalificationDate: ''           },
  { id: 4,  instrumentCode: 'INST014', instrumentName: 'Biosafety Cabinet',                     brand: 'Thermo Scientific',  calibrationDueDate: '2026-02-12', requalificationDate: '2029-05-20' },
  { id: 5,  instrumentCode: 'CEN-09',  instrumentName: 'Refrigerated Centrifuge',               brand: 'Eppendorf',          calibrationDueDate: '2027-11-06', requalificationDate: ''           },
  { id: 6,  instrumentCode: 'BAL001',  instrumentName: 'Analytical Balance AX224',              brand: 'Shimadzu',           calibrationDueDate: '2027-03-15', requalificationDate: '2030-03-15' },
  { id: 7,  instrumentCode: 'UV-001',  instrumentName: 'UV-Vis Spectrophotometer UV-1900i',     brand: 'Shimadzu',           calibrationDueDate: '2026-11-20', requalificationDate: '2029-11-20' },
  { id: 8,  instrumentCode: 'PH-002',  instrumentName: 'pH Meter FiveEasy F20',                 brand: 'Mettler Toledo',     calibrationDueDate: '2025-10-05', requalificationDate: ''           },
  { id: 9,  instrumentCode: 'STR-003', instrumentName: 'Magnetic Stirrer IKA RCT Basic',        brand: 'IKA',                calibrationDueDate: '2027-06-30', requalificationDate: '2030-06-30' },
  { id: 10, instrumentCode: 'FRZ-004', instrumentName: 'Freeze Dryer Alpha 2-4 LD Plus',        brand: 'Martin Christ',      calibrationDueDate: '2027-08-14', requalificationDate: ''           },
  { id: 11, instrumentCode: 'VIS-005', instrumentName: 'Viscometer Brookfield DV2T',            brand: 'Brookfield',         calibrationDueDate: '2026-09-22', requalificationDate: '2029-09-22' },
  { id: 12, instrumentCode: 'KF-006',  instrumentName: 'Karl Fischer Titrator V20S',            brand: 'Mettler Toledo',     calibrationDueDate: '2025-09-01', requalificationDate: ''           },
]

/* add a virtual _calibStatus field for filter matching */
function withCalibStatus(rows) {
  return rows.map((r) => {
    const s = getCalibrationStatus(r.calibrationDueDate)
    return {
      ...r,
      _calibStatus: s === 'compliant' ? 'Compliant'
                  : s === 'warning'   ? 'Warning'
                  : s === 'expired'   ? 'Expired'
                  : '',
    }
  })
}

/* ─────────────────────────────────────────────
   Cell renderer
───────────────────────────────────────────── */
function renderCell(row, key) {
  switch (key) {
    case 'instrumentCode':
      return <span className="text-xs font-mono font-bold text-slate-700">{row.instrumentCode}</span>
    case 'instrumentName':
      return <span className="text-xs font-medium text-slate-800">{row.instrumentName}</span>
    case 'brand':
      return <span className="text-xs text-slate-600">{row.brand}</span>
    case 'calibrationDueDate':
      return <CalibrationBadge dateStr={row.calibrationDueDate} />
    case 'requalificationDate':
      return <DateCell dateStr={row.requalificationDate} />
    default:
      return <span className="text-xs text-slate-600">{row[key] ?? '—'}</span>
  }
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function InstrumentCodeMasterPage() {
  const [data, setData]               = useState(INITIAL_DATA)
  const [nextId, setNextId]           = useState(INITIAL_DATA.length + 1)
  const [formOpen, setFormOpen]       = useState(false)
  const [editRow, setEditRow]         = useState(null)
  const [deleteRow, setDeleteRow]     = useState(null)
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null)

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
        title="Instrument Code"
        icon="qr_code_2"
        columns={COLUMNS}
        data={withCalibStatus(data)}
        renderCell={renderCell}
        filterConfig={FILTER_CONFIG}
        onAdd={() => { setEditRow(null); setFormOpen(true) }}
        onImport={() => {}}
        onEdit={(row) => { setEditRow(data.find((r) => r.id === row.id)); setFormOpen(true) }}
        onDelete={(row) => setDeleteRow(data.find((r) => r.id === row.id))}
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
      />

      {formOpen && (
        <InstrumentCodeFormModal
          initialData={editRow}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditRow(null) }}
        />
      )}

      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Instrument Code"
          message={`Are you sure you want to delete "${deleteRow.instrumentCode} — ${deleteRow.instrumentName}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {bulkDeleteIds && (
        <ConfirmDeleteModal
          title={`Delete ${bulkDeleteIds.length} Instrument Code${bulkDeleteIds.length > 1 ? 's' : ''}`}
          message={`Are you sure you want to delete ${bulkDeleteIds.length} selected record${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setBulkDeleteIds(null)}
        />
      )}
    </>
  )
}
