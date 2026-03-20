import { useState } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import UserFormModal from './UserFormModal'
import { TENANTS } from './data'

export const ROLE_BADGE = {
  'Scientist':       'bg-sky-100    text-sky-700    border-sky-200',
  'Operator':        'bg-amber-100  text-amber-700  border-amber-200',
  'Lab Coordinator': 'bg-violet-100 text-violet-700 border-violet-200',
  'Manager':         'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const STATUS_BADGE = {
  'Active':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-100   text-slate-500   border-slate-200',
  'Pending':  'bg-amber-100   text-amber-700   border-amber-200',
}
const STATUS_ICON = { Active: 'check_circle', Inactive: 'cancel', Pending: 'schedule' }

function Avatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-primary">{initials}</span>
    </div>
  )
}

const ROLE_FILTERS   = ['Scientist', 'Operator', 'Lab Coordinator', 'Manager']
const STATUS_FILTERS = ['Active', 'Inactive', 'Pending']
const PAGE_SIZE = 10

export default function UsersTab({ users, setUsers }) {
  const [search, setSearch]         = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [pendingFilters, setPendingFilters] = useState({})
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState(new Set())
  const [formOpen, setFormOpen]     = useState(false)
  const [editRow, setEditRow]       = useState(null)
  const [deleteRow, setDeleteRow]   = useState(null)
  const [bulkIds, setBulkIds]       = useState(null)
  const [nextId, setNextId]         = useState(users.length + 20)

  const tenantMap = Object.fromEntries(TENANTS.map((t) => [t.id, t]))

  /* ── filter ── */
  const activeCount = Object.values(activeFilters).filter((v) => Array.isArray(v) ? v.length > 0 : v !== '').length

  const filtered = users.filter((u) => {
    if (search) {
      const s = search.toLowerCase()
      if (!u.name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s)) return false
    }
    if (activeFilters.role?.length   && !activeFilters.role.includes(u.role))   return false
    if (activeFilters.status?.length && !activeFilters.status.includes(u.status)) return false
    if (activeFilters.tenantId?.length) {
      const code = tenantMap[u.tenantId]?.tenantCode
      if (!activeFilters.tenantId.includes(code)) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const allSel     = paged.length > 0 && paged.every((r) => selected.has(r.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      allSel ? paged.forEach((r) => next.delete(r.id)) : paged.forEach((r) => next.add(r.id))
      return next
    })
  }

  function handleSave(formData) {
    if (editRow) {
      setUsers((prev) => prev.map((u) => u.id === editRow.id ? { ...u, ...formData } : u))
    } else {
      setUsers((prev) => [...prev, { ...formData, id: nextId, lastActive: null }])
      setNextId((n) => n + 1)
    }
    setFormOpen(false); setEditRow(null)
  }

  function applyFilters() { setActiveFilters({ ...pendingFilters }); setPage(1); setFilterOpen(false) }
  function resetFilters()  { setActiveFilters({}); setPendingFilters({}); setPage(1); setFilterOpen(false) }
  function togglePendingArr(key, val) {
    setPendingFilters((prev) => {
      const cur = Array.isArray(prev[key]) ? prev[key] : []
      return { ...prev, [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val] }
    })
  }

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const to   = Math.min(safePage * PAGE_SIZE, filtered.length)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* toolbar */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
          <input
            type="text" placeholder="Search by name or email…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 placeholder-slate-400"
          />
        </div>
        <button
          onClick={() => { filterOpen ? setFilterOpen(false) : (setPendingFilters({ ...activeFilters }), setFilterOpen(true)) }}
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${filterOpen || activeCount > 0 ? 'border-primary text-primary bg-primary/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
          Filter
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{activeCount}</span>
          )}
        </button>
        <button
          onClick={() => { setEditRow(null); setFormOpen(true) }}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span>
          Invite User
        </button>
      </div>

      {/* filter panel */}
      {filterOpen && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }}>filter_list</span>
              Filter Users
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {/* Role */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role</p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_FILTERS.map((r) => {
                    const on = (pendingFilters.role ?? []).includes(r)
                    return (
                      <button key={r} type="button" onClick={() => togglePendingArr('role', r)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${on ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'}`}>
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Status */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FILTERS.map((s) => {
                    const on = (pendingFilters.status ?? []).includes(s)
                    return (
                      <button key={s} type="button" onClick={() => togglePendingArr('status', s)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${on ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'}`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Tenant */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tenant</p>
                <div className="flex flex-wrap gap-1.5">
                  {TENANTS.map((t) => {
                    const on = (pendingFilters.tenantId ?? []).includes(t.tenantCode)
                    return (
                      <button key={t.id} type="button" onClick={() => togglePendingArr('tenantId', t.tenantCode)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${on ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'}`}>
                        {t.tenantCode}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button onClick={resetFilters} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">Reset All</button>
              <button onClick={applyFilters} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* active filter chips */}
      {activeCount > 0 && !filterOpen && (
        <div className="px-6 py-2 bg-white border-b border-slate-100 flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Active:</span>
          {Object.entries(activeFilters).map(([key, val]) => {
            if (!val || (Array.isArray(val) && !val.length)) return null
            const label = key === 'role' ? 'Role' : key === 'status' ? 'Status' : 'Tenant'
            return (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                <span className="font-semibold">{label}:</span> {Array.isArray(val) ? val.join(', ') : val}
                <button onClick={() => { setActiveFilters((p) => { const n = { ...p }; delete n[key]; return n }) }}><span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span></button>
              </span>
            )
          })}
          <button onClick={resetFilters} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
        </div>
      )}

      {/* bulk bar */}
      {selected.size > 0 && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '16px' }}>check_box</span>
            <p className="text-xs font-semibold text-amber-800">{selected.size} user{selected.size > 1 ? 's' : ''} selected</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelected(new Set())} className="px-3 py-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors">Deselect all</button>
            <button onClick={() => setBulkIds(Array.from(selected))} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
              Delete {selected.size}
            </button>
          </div>
        </div>
      )}

      {/* table */}
      <div className="flex-1 overflow-auto custom-scrollbar px-6 py-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-4 py-2"><input type="checkbox" checked={allSel} onChange={toggleAll} className="accent-primary w-3.5 h-3.5 cursor-pointer" /></th>
                <th className="w-20 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40">Role</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">Tenant</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-28">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No users found.</td></tr>
              ) : paged.map((u, idx) => {
                const tenant = tenantMap[u.tenantId]
                return (
                  <tr key={u.id} className={`border-b border-slate-100 last:border-0 transition-colors ${selected.has(u.id) ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-primary/5`}>
                    <td className="w-10 px-4 py-2">
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => setSelected((p) => { const n = new Set(p); n.has(u.id) ? n.delete(u.id) : n.add(u.id); return n })} className="accent-primary w-3.5 h-3.5 cursor-pointer" />
                    </td>
                    <td className="w-20 px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditRow(u); setFormOpen(true) }} title="Edit" className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                        <button onClick={() => setDeleteRow(u)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${ROLE_BADGE[u.role] ?? ''}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-2">
                      {tenant ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{tenant.tenantCode}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{tenant.tenantName}</p>
                        </div>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_BADGE[u.status] ?? ''}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>{STATUS_ICON[u.status]}</span>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] text-slate-500">{u.lastActive ? u.lastActive.split('-').reverse().join('-') : <span className="text-slate-300">Never</span>}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">Showing <span className="font-semibold text-slate-600">{from}</span> to <span className="font-semibold text-slate-600">{to}</span> of <span className="font-semibold text-slate-600">{filtered.length}</span> users</p>
            <div className="flex items-center gap-1">
              <button disabled={safePage === 1} onClick={() => setPage((p) => p - 1)} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors ${p === safePage ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>{p}</button>
              ))}
              <button disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)} className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {formOpen && <UserFormModal initialData={editRow} onSave={handleSave} onClose={() => { setFormOpen(false); setEditRow(null) }} />}
      {deleteRow && (
        <ConfirmDeleteModal
          title="Remove User"
          message={`Are you sure you want to remove "${deleteRow.name}" from the system?`}
          onConfirm={() => { setUsers((p) => p.filter((u) => u.id !== deleteRow.id)); setDeleteRow(null) }}
          onCancel={() => setDeleteRow(null)}
        />
      )}
      {bulkIds && (
        <ConfirmDeleteModal
          title={`Remove ${bulkIds.length} Users`}
          message={`Remove ${bulkIds.length} selected users from the system? This cannot be undone.`}
          onConfirm={() => { const s = new Set(bulkIds); setUsers((p) => p.filter((u) => !s.has(u.id))); setBulkIds(null); setSelected(new Set()) }}
          onCancel={() => setBulkIds(null)}
        />
      )}
    </div>
  )
}
