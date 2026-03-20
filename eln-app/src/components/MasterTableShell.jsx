import { useState } from 'react'

/**
 * MasterTableShell — reusable shell for all System Configuration master tables.
 *
 * Props:
 *   title        {string}  — page / table title
 *   icon         {string}  — material-symbols icon name
 *   columns      {Array}   — [{ key, label, width? }]
 *   data         {Array}   — rows; each must have an `id` field
 *   renderCell   {fn}      — (row, colKey) => ReactNode
 *   filterConfig {Array}   — [{ key, label, type: 'text'|'multiselect', options?: [] }]
 *   onAdd        {fn}
 *   onImport     {fn}
 *   onEdit       {fn}      — (row) => void
 *   onDelete     {fn}      — (row) => void
 *   onBulkDelete {fn}      — (ids: number[]) => void
 */
export default function MasterTableShell({
  title,
  icon = 'table',
  columns = [],
  data = [],
  renderCell,
  filterConfig = [],
  onAdd,
  onImport,
  onEdit,
  onDelete,
  onBulkDelete,
}) {
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [selected, setSelected]       = useState(new Set())
  const [filterOpen, setFilterOpen]   = useState(false)
  const [activeFilters, setActiveFilters] = useState({})   // { [key]: string | string[] }
  const [pendingFilters, setPendingFilters] = useState({}) // draft while panel is open

  const PAGE_SIZE = 10

  /* ─────────────────────────────────────────────
     Filter logic
  ───────────────────────────────────────────── */
  const activeCount = Object.values(activeFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== ''
  ).length

  const filtered = data.filter((row) => {
    // global search
    if (search) {
      const hit = columns.some((col) => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(search.toLowerCase())
      })
      if (!hit) return false
    }
    // per-column filters
    for (const [key, val] of Object.entries(activeFilters)) {
      if (!val || (Array.isArray(val) && val.length === 0)) continue
      const cell = String(row[key] ?? '').toLowerCase()
      if (Array.isArray(val)) {
        if (!val.map((v) => v.toLowerCase()).includes(cell)) return false
      } else {
        if (!cell.includes(val.toLowerCase())) return false
      }
    }
    return true
  })

  /* ─────────────────────────────────────────────
     Pagination
  ───────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const from       = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const to         = Math.min(safePage * PAGE_SIZE, filtered.length)

  /* ─────────────────────────────────────────────
     Selection
  ───────────────────────────────────────────── */
  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected.has(r.id))
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) paged.forEach((r) => next.delete(r.id))
      else                    paged.forEach((r) => next.add(r.id))
      return next
    })
  }
  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ─────────────────────────────────────────────
     Filter panel helpers
  ───────────────────────────────────────────── */
  function openFilterPanel() {
    setPendingFilters({ ...activeFilters })
    setFilterOpen(true)
  }
  function applyFilters() {
    setActiveFilters({ ...pendingFilters })
    setPage(1)
    setFilterOpen(false)
  }
  function resetFilters() {
    setPendingFilters({})
    setActiveFilters({})
    setPage(1)
    setFilterOpen(false)
  }
  function removeActiveFilter(key) {
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPage(1)
  }

  function setPending(key, value) {
    setPendingFilters((prev) => ({ ...prev, [key]: value }))
  }
  function toggleMultiOption(key, option) {
    setPendingFilters((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : []
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option]
      return { ...prev, [key]: next }
    })
  }

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header ── */}
      <div className="px-8 pt-6 pb-5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">System Configuration › {title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
              Import
            </button>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar: search + filter button ── */}
      <div className="px-8 py-3 bg-white shrink-0 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 placeholder-slate-400"
          />
        </div>

        {/* Filter button with active badge */}
        <button
          onClick={(e) => { e.stopPropagation(); filterOpen ? setFilterOpen(false) : openFilterPanel() }}
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
            filterOpen || activeCount > 0
              ? 'border-primary text-primary bg-primary/5'
              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
          Advanced Filter
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Advanced Filter Panel ── */}
      {filterOpen && (
        <div
          className="px-8 py-4 bg-slate-50 border-b border-slate-200 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }}>filter_list</span>
                Filter by Column
              </p>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
              {filterConfig.map((fc) => (
                <div key={fc.key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fc.label}</label>

                  {fc.type === 'multiselect' ? (
                    <div className="flex flex-wrap gap-1.5">
                      {fc.options.map((opt) => {
                        const current = Array.isArray(pendingFilters[fc.key]) ? pendingFilters[fc.key] : []
                        const active  = current.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleMultiOption(fc.key, opt)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                              active
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Filter by ${fc.label.toLowerCase()}…`}
                      value={pendingFilters[fc.key] ?? ''}
                      onChange={(e) => setPending(fc.key, e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 placeholder-slate-400"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active filter chips ── */}
      {activeCount > 0 && !filterOpen && (
        <div className="px-8 py-2 bg-white border-b border-slate-100 shrink-0 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Active filters:</span>
          {Object.entries(activeFilters).map(([key, val]) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null
            const fc    = filterConfig.find((f) => f.key === key)
            const label = fc?.label ?? key
            const display = Array.isArray(val) ? val.join(', ') : val
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
              >
                <span className="font-semibold">{label}:</span> {display}
                <button
                  onClick={() => removeActiveFilter(key)}
                  className="ml-0.5 hover:text-primary/60 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                </button>
              </span>
            )
          })}
          <button
            onClick={resetFilters}
            className="text-[10px] text-slate-400 hover:text-red-500 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="px-8 py-2.5 bg-amber-50 border-b border-amber-200 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '16px' }}>check_box</span>
            <p className="text-xs font-semibold text-amber-800">
              {selected.size} row{selected.size > 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              Deselect all
            </button>
            <button
              onClick={() => onBulkDelete?.(Array.from(selected))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
              Delete {selected.size} row{selected.size > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto custom-scrollbar px-8 py-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    className="accent-primary w-3.5 h-3.5 rounded cursor-pointer"
                  />
                </th>
                <th className="w-20 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Actions
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    style={col.width ? { width: col.width } : {}}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-sm text-slate-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 last:border-0 transition-colors ${
                      selected.has(row.id) ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    } hover:bg-primary/5`}
                  >
                    <td className="w-10 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-primary w-3.5 h-3.5 rounded cursor-pointer"
                      />
                    </td>
                    {/* Action buttons */}
                    <td className="w-20 px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit?.(row)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                        <button
                          onClick={() => onDelete?.(row)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                    {/* Data cells */}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-2 text-xs">
                        {renderCell ? renderCell(row, col.key) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* ── Pagination footer ── */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Showing <span className="font-semibold text-slate-600">{from}</span> to{' '}
              <span className="font-semibold text-slate-600">{to}</span> of{' '}
              <span className="font-semibold text-slate-600">{filtered.length}</span> entries
              {filtered.length !== data.length && (
                <span className="text-slate-400"> (filtered from {data.length} total)</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                      p === safePage
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              {totalPages > 5 && <span className="text-xs text-slate-400 px-1">…</span>}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
