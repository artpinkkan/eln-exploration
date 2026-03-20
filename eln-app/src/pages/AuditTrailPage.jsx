import { useState, useMemo } from 'react'

/* ── Mock data ─────────────────────────────── */
const INITIAL_DATA = [
  { id:  1, action: 'Experiment Updated',  changedAt: '20-03-2026 15:41', table: 'experiments', recordName: 'testing 1',            recordId: 'EXP-2026-001', changedBy: 'pinkan pinkan',    module: 'Experiment'      },
  { id:  2, action: 'Experiment Updated',  changedAt: '20-03-2026 10:22', table: 'experiments', recordName: 'Hydro Coco Batch A',    recordId: 'EXP-2026-002', changedBy: 'pinkan pinkan',    module: 'Experiment'      },
  { id:  3, action: 'Experiment Updated',  changedAt: '19-03-2026 16:05', table: 'experiments', recordName: 'Plasma-G Trial 3',      recordId: 'EXP-2026-003', changedBy: 'davin davin',      module: 'Experiment'      },
  { id:  4, action: 'Experiment Created',  changedAt: '19-03-2026 09:30', table: 'experiments', recordName: 'Plasma-G Trial 3',      recordId: 'EXP-2026-003', changedBy: 'davin davin',      module: 'Experiment'      },
  { id:  5, action: 'Experiment Updated',  changedAt: '18-03-2026 14:15', table: 'experiments', recordName: 'Neuro-Regen Alpha',     recordId: 'EXP-2026-004', changedBy: 'pinkan pinkan',    module: 'Experiment'      },
  { id:  6, action: 'Experiment Submitted',changedAt: '18-03-2026 09:00', table: 'experiments', recordName: 'Neuro-Regen Alpha',     recordId: 'EXP-2026-004', changedBy: 'pinkan pinkan',    module: 'Experiment'      },
  { id:  7, action: 'Experiment Created',  changedAt: '17-03-2026 11:00', table: 'experiments', recordName: 'Vis-20 Study B',        recordId: 'EXP-2026-005', changedBy: 'pinkan pinkan',    module: 'Experiment'      },
  { id:  8, action: 'Experiment Updated',  changedAt: '17-03-2026 08:45', table: 'experiments', recordName: 'Vis-20 Study B',        recordId: 'EXP-2026-005', changedBy: 'davin davin',      module: 'Experiment'      },
  { id:  9, action: 'Material Created',    changedAt: '16-03-2026 13:20', table: 'materials',   recordName: 'Sodium Chloride 99%',   recordId: 'MAT-0042',     changedBy: 'crdadmin crdadmin',module: 'Material'        },
  { id: 10, action: 'Material Updated',    changedAt: '15-03-2026 10:05', table: 'materials',   recordName: 'Ethanol 96%',           recordId: 'MAT-0018',     changedBy: 'crdadmin crdadmin',module: 'Material'        },
  { id: 11, action: 'Product Created',     changedAt: '14-03-2026 09:12', table: 'products',    recordName: 'Neuro-Regen Formula',   recordId: 'PRD-0002',     changedBy: 'pinkan pinkan',    module: 'Product'         },
  { id: 12, action: 'Product Updated',     changedAt: '13-03-2026 16:40', table: 'products',    recordName: 'Plasma-G Solution',     recordId: 'PRD-0006',     changedBy: 'davin davin',      module: 'Product'         },
  { id: 13, action: 'Experiment Deleted',  changedAt: '12-03-2026 11:30', table: 'experiments', recordName: 'Draft Experiment X',    recordId: 'EXP-2026-000', changedBy: 'crdadmin crdadmin',module: 'Experiment'      },
  { id: 14, action: 'User Updated',        changedAt: '12-03-2026 09:00', table: 'users',       recordName: 'pharma pharma',         recordId: 'USR-003',      changedBy: 'crdadmin crdadmin',module: 'User Management' },
  { id: 15, action: 'Material Batch Created', changedAt: '11-03-2026 14:00', table: 'material_batches', recordName: 'NaCl Batch #7', recordId: 'MBT-0012',    changedBy: 'davin davin',      module: 'Material'        },
  { id: 16, action: 'Instrument Updated',  changedAt: '10-03-2026 10:30', table: 'instruments', recordName: 'HPLC Unit A',          recordId: 'INS-0005',     changedBy: 'crdadmin crdadmin',module: 'Instrument'      },
]

/* ── Action badge ──────────────────────────── */
const ACTION_STYLES = {
  Created:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Updated:   'bg-amber-50   text-amber-700   border-amber-200',
  Submitted: 'bg-blue-50    text-blue-700    border-blue-200',
  Deleted:   'bg-red-50     text-red-700     border-red-200',
}
const ACTION_ICONS = {
  Created:   'add_circle',
  Updated:   'edit',
  Submitted: 'send',
  Deleted:   'delete',
}

function actionType(action) {
  for (const key of Object.keys(ACTION_STYLES)) {
    if (action.endsWith(key)) return key
  }
  return 'Updated'
}

function ActionBadge({ action }) {
  const type  = actionType(action)
  const style = ACTION_STYLES[type]
  const icon  = ACTION_ICONS[type]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${style}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{icon}</span>
      {action}
    </span>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
        {initials}
      </div>
      <span className="text-xs text-slate-700">{name}</span>
    </div>
  )
}

const MODULE_COLORS = {
  'Experiment':      'bg-primary/10 text-primary border-primary/20',
  'Material':        'bg-sky-100 text-sky-700 border-sky-200',
  'Product':         'bg-violet-100 text-violet-700 border-violet-200',
  'Instrument':      'bg-amber-100 text-amber-700 border-amber-200',
  'User Management': 'bg-slate-100 text-slate-600 border-slate-200',
}

const ALL_TABLES  = [...new Set(INITIAL_DATA.map((r) => r.table))]
const ALL_MODULES = [...new Set(INITIAL_DATA.map((r) => r.module))]
const PAGE_SIZES  = [10, 20, 50]
const COLUMNS = ['Action', 'Changed At', 'Table', 'Record Name', 'Record ID', 'Changed By', 'Module']

export default function AuditTrailPage() {
  const [search,      setSearch]      = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [moduleFilter,setModuleFilter]= useState('')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [pageSize,    setPageSize]    = useState(10)
  const [page,        setPage]        = useState(1)
  const [sortKey,     setSortKey]     = useState('changedAt')
  const [sortDir,     setSortDir]     = useState('desc')

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let rows = [...INITIAL_DATA]
    if (search)       rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    if (tableFilter)  rows = rows.filter((r) => r.table === tableFilter)
    if (moduleFilter) rows = rows.filter((r) => r.module === moduleFilter)
    // sort
    rows.sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return rows
  }, [search, tableFilter, moduleFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '13px' }}>unfold_more</span>
    return <span className="material-symbols-outlined text-primary" style={{ fontSize: '13px' }}>{sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
  }

  const colKeyMap = {
    'Action': 'action', 'Changed At': 'changedAt', 'Table': 'table',
    'Record Name': 'recordName', 'Record ID': 'recordId',
    'Changed By': 'changedBy', 'Module': 'module',
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Page header ── */}
      <div className="px-8 pt-6 pb-5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>manage_search</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Audit Trail</h1>
              <p className="text-xs text-slate-400 mt-0.5">Track all system changes and user activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-8 py-3 bg-white shrink-0 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search records…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 placeholder-slate-400"
          />
        </div>

        {/* Table filter */}
        <select
          value={tableFilter}
          onChange={(e) => { setTableFilter(e.target.value); setPage(1) }}
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Tables</option>
          {ALL_TABLES.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Module filter */}
        <select
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1) }}
          className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Modules</option>
          {ALL_MODULES.map((m) => <option key={m}>{m}</option>)}
        </select>

        {/* Active filter chips */}
        {tableFilter && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium border border-primary/20">
            Table: {tableFilter}
            <button onClick={() => { setTableFilter(''); setPage(1) }}>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
            </button>
          </span>
        )}
        {moduleFilter && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium border border-primary/20">
            Module: {moduleFilter}
            <button onClick={() => { setModuleFilter(''); setPage(1) }}>
              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
            </button>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PAGE_SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {COLUMNS.map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(colKeyMap[col])}
                        className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col}
                          <SortIcon colKey={colKeyMap[col]} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-12 text-center">
                        <span className="material-symbols-outlined text-slate-200 block mb-2" style={{ fontSize: '40px' }}>search_off</span>
                        <p className="text-xs text-slate-400">No audit records match your filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Action */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <ActionBadge action={row.action} />
                        </td>
                        {/* Changed At */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '12px' }}>schedule</span>
                            {row.changedAt}
                          </span>
                        </td>
                        {/* Table */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{row.table}</span>
                        </td>
                        {/* Record Name */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-slate-800">{row.recordName}</span>
                        </td>
                        {/* Record ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-slate-400">{row.recordId}</span>
                        </td>
                        {/* Changed By */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Avatar name={row.changedBy} />
                        </td>
                        {/* Module */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${MODULE_COLORS[row.module] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {row.module}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-400">
                Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} records
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${page === p ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
