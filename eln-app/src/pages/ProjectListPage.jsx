import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import CreateProjectModal from '../components/CreateProjectModal'
import ProfileMenu from '../components/ProfileMenu'

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

  // Close filter popup & action dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false)
      }
      if (openActionId !== null) {
        const ref = actionRefs.current[openActionId]
        if (ref && !ref.contains(e.target)) {
          setOpenActionId(null)
        }
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
        p.id === id
          ? { ...p, status: p.status === 'Archived' ? 'Active' : 'Archived' }
          : p
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

    const matchName = !f.name || p.name.toLowerCase().includes(f.name.toLowerCase())
    const matchProduct = !f.product || p.product.toLowerCase().includes(f.product.toLowerCase())
    const matchOwner = !f.owner || p.owner.toLowerCase().includes(f.owner.toLowerCase())
    const matchTags =
      !f.tags ||
      p.tags.some((t) => t.toLowerCase().includes(f.tags.toLowerCase()))
    const matchBudgetMin = !f.budgetMin || p.budgetValue >= Number(f.budgetMin)
    const matchBudgetMax = !f.budgetMax || p.budgetValue <= Number(f.budgetMax)
    const matchDueDate = !f.dueDate || p.dueDateISO >= f.dueDate
    const matchExpMin = !f.expMin || p.exp >= Number(f.expMin)
    const matchExpMax = !f.expMax || p.exp <= Number(f.expMax)
    const matchStatus = f.status === 'All Statuses' || p.status === f.status

    return (
      matchSearch &&
      matchName &&
      matchProduct &&
      matchOwner &&
      matchTags &&
      matchBudgetMin &&
      matchBudgetMax &&
      matchDueDate &&
      matchExpMin &&
      matchExpMax &&
      matchStatus
    )
  })

  return (
    <div className="bg-background-light min-h-screen flex font-body text-on-surface">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-surface-light flex justify-between items-center px-8 border-b border-slate-200 shrink-0">
          <h1 className="font-headline font-bold text-slate-900 text-base tracking-tight">
            Electronic Laboratory Notebook
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <ProfileMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-headline">Project List</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage and monitor active clinical trials and experimental workflows.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 text-sm"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Project
              </button>
            </div>

            {/* Table Container */}
            <div className="bg-surface-light rounded-xl shadow-sm border border-slate-200">
              {/* Search + Advanced Filters */}
              <div className="p-5 border-b border-slate-100 flex items-center gap-3" ref={filterRef}>
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-lg">search</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, product or lead..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/40 placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Advanced Filters
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="absolute left-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">tune</span>
                          Advanced Filters
                        </h3>
                        <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>

                      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Name</label>
                            <input type="text" placeholder="Search name..." value={pendingFilters.name}
                              onChange={(e) => setPendingFilters((f) => ({ ...f, name: e.target.value }))}
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</label>
                            <input type="text" placeholder="e.g. Compound-X" value={pendingFilters.product}
                              onChange={(e) => setPendingFilters((f) => ({ ...f, product: e.target.value }))}
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Owner</label>
                          <input type="text" placeholder="Dr. S. Miller, etc." value={pendingFilters.owner}
                            onChange={(e) => setPendingFilters((f) => ({ ...f, owner: e.target.value }))}
                            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags</label>
                          <input type="text" placeholder="R&D, Formulasi, etc." value={pendingFilters.tags}
                            onChange={(e) => setPendingFilters((f) => ({ ...f, tags: e.target.value }))}
                            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget Range (Rp)</label>
                          <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" value={pendingFilters.budgetMin}
                              onChange={(e) => setPendingFilters((f) => ({ ...f, budgetMin: e.target.value }))}
                              className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                            <span className="text-slate-400 shrink-0">–</span>
                            <input type="number" placeholder="Max" value={pendingFilters.budgetMax}
                              onChange={(e) => setPendingFilters((f) => ({ ...f, budgetMax: e.target.value }))}
                              className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date (from)</label>
                          <input type="date" value={pendingFilters.dueDate}
                            onChange={(e) => setPendingFilters((f) => ({ ...f, dueDate: e.target.value }))}
                            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exp. Level</label>
                            <div className="flex items-center gap-1">
                              <input type="number" placeholder="Min" value={pendingFilters.expMin}
                                onChange={(e) => setPendingFilters((f) => ({ ...f, expMin: e.target.value }))}
                                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                              <span className="text-slate-400 shrink-0">–</span>
                              <input type="number" placeholder="Max" value={pendingFilters.expMax}
                                onChange={(e) => setPendingFilters((f) => ({ ...f, expMax: e.target.value }))}
                                className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                            <select value={pendingFilters.status}
                              onChange={(e) => setPendingFilters((f) => ({ ...f, status: e.target.value }))}
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary">
                              <option>All Statuses</option>
                              <option>Active</option>
                              <option>Archived</option>
                              <option>Pending</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                        <button onClick={resetFilters} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">Reset</button>
                        <button onClick={applyFilters} className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 shadow-sm">Apply Filters</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/40">
                  {Object.entries(appliedFilters).map(([key, val]) => {
                    if (key === 'status' && val === 'All Statuses') return null
                    if (key !== 'status' && !val) return null
                    const labels = {
                      name: 'Name', product: 'Product', owner: 'Owner', tags: 'Tags',
                      budgetMin: 'Budget ≥', budgetMax: 'Budget ≤',
                      dueDate: 'Due from', expMin: 'Exp ≥', expMax: 'Exp ≤', status: 'Status',
                    }
                    return (
                      <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                        {labels[key]}: {val}
                        <button onClick={() => {
                          const updated = { ...appliedFilters, [key]: key === 'status' ? 'All Statuses' : '' }
                          setAppliedFilters(updated)
                          setPendingFilters(updated)
                        }}>
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    )
                  })}
                  <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-800 underline">Clear all</button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 border-b border-slate-100 w-12" />
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Product</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Owner</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Tags</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Budget</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Due Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Exp.</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center text-slate-400 text-sm">
                          No projects match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((project) => (
                        <tr
                          key={project.id}
                          onDoubleClick={() => {
                            setFlashId(project.id)
                            setTimeout(() => navigate('/experiment', { state: { projectName: project.name } }), 220)
                          }}
                          className={`transition-all duration-150 group cursor-pointer select-none ${
                            flashId === project.id
                              ? 'bg-primary/10 scale-[1.002] shadow-sm'
                              : 'hover:bg-slate-50/50'
                          }`}
                          title="Double-click to open project"
                        >
                          {/* Action button */}
                          <td
                            className="px-6 py-5 text-left"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="relative"
                              ref={(el) => (actionRefs.current[project.id] = el)}
                            >
                              <button
                                onClick={() =>
                                  setOpenActionId((id) => (id === project.id ? null : project.id))
                                }
                                className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">more_vert</span>
                              </button>

                              {openActionId === project.id && (
                                <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                  {project.status !== 'Archived' ? (
                                    <button
                                      onClick={() => toggleStatus(project.id)}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-base">archive</span>
                                      Archive
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => toggleStatus(project.id)}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-base">unarchive</span>
                                      Restore
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {project.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{project.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
                              {project.product}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                                {project.owner.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-xs font-medium text-slate-700">{project.owner}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                              {project.tags.length > 0 ? (
                                project.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-semibold rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-xs text-slate-700">
                            {formatBudget(project.budgetValue)}
                          </td>
                          <td className="px-6 py-5 text-xs text-slate-500">{project.dueDate}</td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-xs font-bold text-primary">
                              {String(project.exp).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                STATUS_STYLES[project.status] || STATUS_STYLES.Active
                              }`}
                            >
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
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
                <span className="text-xs text-slate-500">
                  Showing <span className="font-bold text-slate-900">1–{filtered.length}</span> of{' '}
                  <span className="font-bold text-slate-900">{filtered.length}</span> projects
                </span>
                <div className="flex gap-1">
                  <button
                    disabled
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                    1
                  </button>
                  <button
                    disabled
                    className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Tip: Double-click a project row to open its Recipe &amp; Protocol view.
            </p>
          </div>
        </main>
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
