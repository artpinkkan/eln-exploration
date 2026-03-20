import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateProjectModal from '../components/CreateProjectModal'

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-2023-042',
    name: 'Neuro-Regen Alpha',
    product: 'Compound-X',
    owner: 'Dr. S. Miller',
    tags: ['R&D'],
    budgetValue: 1200000,
    dueDate: 'Oct 12, 2024',
    dueDateISO: '2024-10-12',
    exp: 24,
    status: 'Active',
  },
  {
    id: 'PRJ-2023-089',
    name: 'Hemostat-V Stability',
    product: 'Plasma-G',
    owner: 'J. Wilson',
    tags: ['Tag CBA'],
    budgetValue: 450000,
    dueDate: 'Dec 20, 2023',
    dueDateISO: '2023-12-20',
    exp: 8,
    status: 'Archived',
  },
  {
    id: 'PRJ-2024-001',
    name: 'Ocular Strain Study',
    product: 'Vis-20',
    owner: 'E. Rodriguez',
    tags: ['Formulasi', 'R&D'],
    budgetValue: 2800000,
    dueDate: 'Aug 15, 2025',
    dueDateISO: '2025-08-15',
    exp: 62,
    status: 'Active',
  },
  {
    id: 'PRJ-2023-112',
    name: 'Cardiac Valve Durability',
    product: 'Valve-R4',
    owner: 'T. Chen',
    tags: ['Packaging'],
    budgetValue: 820000,
    dueDate: 'Jan 05, 2024',
    dueDateISO: '2024-01-05',
    exp: 15,
    status: 'Active',
  },
]

const STATUS_STYLES = {
  Active: 'bg-primary/10 text-primary border-primary/20',
  Archived: 'bg-red-50 text-red-600 border-red-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
}

function formatBudget(value) {
  if (!value && value !== 0) return '—'
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`
  return `Rp ${value}`
}

const EMPTY_FILTERS = {
  name: '',
  product: '',
  owner: '',
  tags: '',
  budgetMin: '',
  budgetMax: '',
  dueDate: '',
  expMin: '',
  expMax: '',
  status: 'All Statuses',
}

export default function ProjectListPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [openActionId, setOpenActionId] = useState(null)
  const [flashId, setFlashId] = useState(null)

  const filterRef = useRef(null)
  const actionRefs = useRef({})

  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false)
      }
      if (openActionId !== null) {
        const ref = actionRefs.current[openActionId]
        if (ref && !ref.contains(e.target)) setOpenActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openActionId])

  function handleCreate(project) {
    setProjects((prev) => [project, ...prev])
  }

  function toggleStatus(id) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'Archived' ? 'Active' : 'Archived' } : p
      )
    )
    setOpenActionId(null)
  }

  function applyFilters() {
    setAppliedFilters({ ...pendingFilters })
    setShowFilters(false)
  }

  function resetFilters() {
    setPendingFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setShowFilters(false)
  }

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([k, v]) => k === 'status' ? v !== 'All Statuses' : v !== ''
  ).length

  const filtered = projects.filter((p) => {
    const f = appliedFilters
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.product.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase())

    return (
      matchSearch &&
      (!f.name || p.name.toLowerCase().includes(f.name.toLowerCase())) &&
      (!f.product || p.product.toLowerCase().includes(f.product.toLowerCase())) &&
      (!f.owner || p.owner.toLowerCase().includes(f.owner.toLowerCase())) &&
      (!f.tags || p.tags.some((t) => t.toLowerCase().includes(f.tags.toLowerCase()))) &&
      (!f.budgetMin || p.budgetValue >= Number(f.budgetMin)) &&
      (!f.budgetMax || p.budgetValue <= Number(f.budgetMax)) &&
      (!f.dueDate || p.dueDateISO >= f.dueDate) &&
      (!f.expMin || p.exp >= Number(f.expMin)) &&
      (!f.expMax || p.exp <= Number(f.expMax)) &&
      (f.status === 'All Statuses' || p.status === f.status)
    )
  })

  const activeCount = projects.filter((p) => p.status === 'Active').length
  const archivedCount = projects.filter((p) => p.status === 'Archived').length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header (sticky) ── */}
      <div className="px-8 pt-6 pb-0 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>folder_open</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Project List</h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage and monitor active clinical trials and experimental workflows</p>
            </div>
          </div>

          {/* Summary pills + Add button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>folder_open</span>
              <span className="text-xs font-semibold text-slate-700">{activeCount}</span>
              <span className="text-[11px] text-slate-400">active</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>archive</span>
              <span className="text-xs font-semibold text-slate-700">{archivedCount}</span>
              <span className="text-[11px] text-slate-400">archived</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add Project
            </button>
          </div>
        </div>

        {/* Search + filter toolbar — lives in sticky header so dropdown isn't clipped */}
        <div className="flex items-center gap-3 py-3 border-t border-slate-200 -mx-8 px-8" ref={filterRef}>
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
            <input
              type="text"
              placeholder="Search by name, product or lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 placeholder-slate-400"
            />
          </div>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
              Advanced Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">tune</span>
                    Advanced Filters
                  </h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
                <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Name</label>
                      <input type="text" placeholder="Search name..." value={pendingFilters.name}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, name: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</label>
                      <input type="text" placeholder="e.g. Compound-X" value={pendingFilters.product}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, product: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Owner</label>
                    <input type="text" placeholder="Dr. S. Miller, etc." value={pendingFilters.owner}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, owner: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags</label>
                    <input type="text" placeholder="R&D, Formulasi, etc." value={pendingFilters.tags}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, tags: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Range (Rp)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={pendingFilters.budgetMin}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, budgetMin: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                      <span className="text-slate-400 shrink-0">–</span>
                      <input type="number" placeholder="Max" value={pendingFilters.budgetMax}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, budgetMax: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date (from)</label>
                    <input type="date" value={pendingFilters.dueDate}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, dueDate: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exp. Level</label>
                      <div className="flex items-center gap-1">
                        <input type="number" placeholder="Min" value={pendingFilters.expMin}
                          onChange={(e) => setPendingFilters((f) => ({ ...f, expMin: e.target.value }))}
                          className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                        <span className="text-slate-400 shrink-0">–</span>
                        <input type="number" placeholder="Max" value={pendingFilters.expMax}
                          onChange={(e) => setPendingFilters((f) => ({ ...f, expMax: e.target.value }))}
                          className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                      <select value={pendingFilters.status}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, status: e.target.value }))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary">
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Archived</option>
                        <option>Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/30">
                  <button onClick={resetFilters} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">Reset</button>
                  <button onClick={applyFilters} className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-sm">Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-4">

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/40">
                {Object.entries(appliedFilters).map(([key, val]) => {
                  if (key === 'status' && val === 'All Statuses') return null
                  if (key !== 'status' && !val) return null
                  const labels = {
                    name: 'Name', product: 'Product', owner: 'Owner', tags: 'Tags',
                    budgetMin: 'Budget ≥', budgetMax: 'Budget ≤',
                    dueDate: 'Due from', expMin: 'Exp ≥', expMax: 'Exp ≤', status: 'Status',
                  }
                  return (
                    <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20">
                      {labels[key]}: {val}
                      <button onClick={() => {
                        const updated = { ...appliedFilters, [key]: key === 'status' ? 'All Statuses' : '' }
                        setAppliedFilters(updated); setPendingFilters(updated)
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                      </button>
                    </span>
                  )
                })}
                <button onClick={resetFilters} className="text-[10px] text-slate-500 hover:text-slate-800 underline">Clear all</button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-12 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest" />
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Budget</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Exp.</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center text-sm text-slate-400">
                        No projects match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((project, idx) => (
                      <tr
                        key={project.id}
                        onDoubleClick={() => {
                          setFlashId(project.id)
                          setTimeout(() => navigate('/experiment', { state: { projectName: project.name } }), 220)
                        }}
                        className={`border-b border-slate-100 last:border-0 transition-all duration-150 group cursor-pointer select-none ${
                          flashId === project.id
                            ? 'bg-primary/10'
                            : idx % 2 === 0 ? 'bg-white hover:bg-primary/5' : 'bg-slate-50/40 hover:bg-primary/5'
                        }`}
                        title="Double-click to open project"
                      >
                        {/* Action */}
                        <td
                          className="px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative" ref={(el) => (actionRefs.current[project.id] = el)}>
                            <button
                              onClick={() => setOpenActionId((id) => (id === project.id ? null : project.id))}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>more_vert</span>
                            </button>
                            {openActionId === project.id && (
                              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                {project.status !== 'Archived' ? (
                                  <button
                                    onClick={() => toggleStatus(project.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>archive</span>
                                    Archive
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => toggleStatus(project.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>unarchive</span>
                                    Restore
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{project.name}</span>
                            <span className="text-[10px] text-slate-400">{project.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
                            {project.product}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                              {project.owner.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-xs text-slate-700">{project.owner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {project.tags.length > 0 ? (
                              project.tags.map((tag) => (
                                <span key={tag} className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-semibold rounded-full">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-700">
                          {formatBudget(project.budgetValue)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{project.dueDate}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold text-primary">{String(project.exp).padStart(2, '0')}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[project.status] || STATUS_STYLES.Active}`}>
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
              <span className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-900">1–{filtered.length}</span> of{' '}
                <span className="font-bold text-slate-900">{filtered.length}</span> projects
              </span>
              <div className="flex gap-1">
                <button disabled className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
                <button disabled className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            Tip: Double-click a project row to open its Recipe &amp; Protocol view.
          </p>
        </div>
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
