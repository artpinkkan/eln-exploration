import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CreateExperimentModal from '../components/CreateExperimentModal'
import EditExperimentModal from '../components/EditExperimentModal'

const WORKFLOW_STEPS = [
  { icon: 'description', label: 'Recipe & Protocol' },
  { icon: 'checklist',   label: 'Resources'         },
  { icon: 'biotech',     label: 'Execution'         },
  { icon: 'trending_up', label: 'Data Analysis'     },
  { icon: 'summarize',   label: 'Report'            },
]

const WORKFLOW_STATUS_OPTIONS = ['All', 'In Progress', 'Completed', 'Halted', 'Draft']

const EXPERIMENTS_INIT = [
  {
    id: 'EXP-001',
    name: 'Neural Growth Assay #A02',
    subtitle: 'Scaffold Hydrogen v2.1',
    owner: 'Dr. Aris Thorne',
    contributorNames: ['Elena Smith', 'Julian Vance', 'Dr. Sarah Kim'],
    operatorNames: ['Marcus Lee'],
    created: 'Oct 12, 2023',
    createdISO: '2023-10-12',
    completedSteps: 2,
  },
  {
    id: 'EXP-002',
    name: 'Metabolic Rate Control Test',
    subtitle: 'Control Group-A-14',
    owner: 'Elena Smith',
    contributorNames: ['Marcus Lee', 'Priya Nair'],
    operatorNames: ['Dr. Wei Chen', 'Tom Eriksson'],
    created: 'Oct 08, 2023',
    createdISO: '2023-10-08',
    completedSteps: 5,
  },
  {
    id: 'EXP-003',
    name: 'Scaffold Elasticity Peak',
    subtitle: 'Stress Profile: High',
    owner: 'Julian Vance',
    contributorNames: ['Dr. Wei Chen', 'Tom Eriksson', 'Dr. Sarah Kim', 'Marcus Lee'],
    operatorNames: ['Priya Nair'],
    created: 'Oct 05, 2023',
    createdISO: '2023-10-05',
    completedSteps: 2,
    haltedAt: 2,
  },
  {
    id: 'EXP-004',
    name: 'Oxygen Perfusion Baseline',
    subtitle: 'Initial Calibration',
    owner: 'Dr. Aris Thorne',
    contributorNames: [],
    operatorNames: [],
    created: 'Sep 28, 2023',
    createdISO: '2023-09-28',
    completedSteps: 0,
  },
]

function getWorkflowLabel(exp) {
  if (exp.haltedAt !== undefined) return 'Halted'
  if (exp.completedSteps === 5)   return 'Completed'
  if (exp.completedSteps === 0)   return 'Draft'
  return 'In Progress'
}

function WorkflowStatus({ completedSteps, haltedAt }) {
  return (
    <div className="flex items-center gap-1">
      {WORKFLOW_STEPS.map((step, i) => {
        const isDone    = i < completedSteps && haltedAt === undefined
        const isHalted  = i === haltedAt
        const isActive  = i === completedSteps && haltedAt === undefined && completedSteps < 5
        const isAllDone = completedSteps === 5

        let cls = 'bg-slate-100 text-slate-300'
        if (isAllDone || isDone)                      cls = 'bg-emerald-500 text-white'
        if (isActive)                                  cls = 'bg-orange-400 text-white'
        if (isHalted)                                  cls = 'bg-red-500 text-white'
        if (haltedAt !== undefined && i < haltedAt)   cls = 'bg-emerald-500 text-white'

        return (
          <div key={step.icon} title={step.label}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${cls}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{step.icon}</span>
          </div>
        )
      })}
    </div>
  )
}

const EMPTY_FILTERS = {
  name: '',
  workflowStatus: 'All',
  owner: '',
  contributorsMin: '',
  contributorsMax: '',
  createdFrom: '',
  createdTo: '',
}

export default function ExperimentDashboard() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const projectName = location.state?.projectName ?? 'Neuro-Regen Alpha'

  const [experiments, setExperiments] = useState(
    EXPERIMENTS_INIT.map((e) => ({ ...e, contributors: e.contributorNames.length }))
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExp,      setEditingExp]      = useState(null)
  const [search,          setSearch]          = useState('')
  const [flashId,         setFlashId]         = useState(null)
  const [showFilters,     setShowFilters]     = useState(false)
  const [pendingFilters,  setPendingFilters]  = useState(EMPTY_FILTERS)
  const [appliedFilters,  setAppliedFilters]  = useState(EMPTY_FILTERS)

  const filterRef = useRef(null)
  useEffect(() => {
    function onClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([k, v]) => k === 'workflowStatus' ? v !== 'All' : v !== ''
  ).length

  function applyFilters() {
    setAppliedFilters({ ...pendingFilters })
    setShowFilters(false)
  }
  function resetFilters() {
    setPendingFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setShowFilters(false)
  }

  function handleCreate({ name, contributors, operators }) {
    const newExp = {
      id: `EXP-${String(experiments.length + 1).padStart(3, '0')}`,
      name,
      subtitle: operators.length ? `Operators: ${operators.join(', ')}` : 'New experiment',
      owner: contributors[0] ?? 'Unassigned',
      contributorNames: contributors,
      contributors: contributors.length,
      operatorNames: operators,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      createdISO: new Date().toISOString().slice(0, 10),
      completedSteps: 0,
    }
    setExperiments((prev) => [newExp, ...prev])
  }

  function handleSaveEdit(updated) {
    setExperiments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
  }

  const f = appliedFilters
  const filtered = experiments.filter((e) => {
    const label = getWorkflowLabel(e)
    return (
      (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.owner.toLowerCase().includes(search.toLowerCase())) &&
      (!f.name || e.name.toLowerCase().includes(f.name.toLowerCase())) &&
      (f.workflowStatus === 'All' || label === f.workflowStatus) &&
      (!f.owner || e.owner.toLowerCase().includes(f.owner.toLowerCase())) &&
      (!f.contributorsMin || e.contributors >= Number(f.contributorsMin)) &&
      (!f.contributorsMax || e.contributors <= Number(f.contributorsMax)) &&
      (!f.createdFrom || e.createdISO >= f.createdFrom) &&
      (!f.createdTo   || e.createdISO <= f.createdTo)
    )
  })

  function openExperiment(exp) {
    setFlashId(exp.id)
    setTimeout(() => navigate('/app', { state: { projectName, experimentName: exp.name } }), 200)
  }

  const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky page header ── */}
      <div className="px-8 pt-6 pb-0 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>science</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                <button onClick={() => navigate('/projects')} className="hover:text-primary transition-colors">Project List</button>
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>chevron_right</span>
                <span className="font-semibold text-slate-600">{projectName}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Experiment Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>science</span>
              <span className="text-xs font-semibold text-slate-700">{experiments.length}</span>
              <span className="text-[11px] text-slate-400">experiments</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>play_circle</span>
              <span className="text-xs font-semibold text-slate-700">{experiments.filter((e) => getWorkflowLabel(e) === 'In Progress').length}</span>
              <span className="text-[11px] text-slate-400">in progress</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add Experiment
            </button>
          </div>
        </div>

        {/* Search + filter toolbar in sticky header */}
        <div className="flex items-center gap-3 py-3 border-t border-slate-200 -mx-8 px-8" ref={filterRef}>
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
            <input
              type="text"
              placeholder="Search experiments..."
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
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experiment Name</label>
                    <input type="text" placeholder="Search name..." value={pendingFilters.name}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, name: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workflow Status</label>
                    <select value={pendingFilters.workflowStatus}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, workflowStatus: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary">
                      {WORKFLOW_STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Owner</label>
                    <input type="text" placeholder="e.g. Dr. Aris Thorne" value={pendingFilters.owner}
                      onChange={(e) => setPendingFilters((f) => ({ ...f, owner: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contributors (count)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" min={0} value={pendingFilters.contributorsMin}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, contributorsMin: e.target.value }))}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                      <span className="text-slate-400 shrink-0">–</span>
                      <input type="number" placeholder="Max" min={0} value={pendingFilters.contributorsMax}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, contributorsMax: e.target.value }))}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created Date</label>
                    <div className="flex items-center gap-2">
                      <input type="date" value={pendingFilters.createdFrom}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, createdFrom: e.target.value }))}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
                      <span className="text-slate-400 shrink-0">–</span>
                      <input type="date" value={pendingFilters.createdTo}
                        onChange={(e) => setPendingFilters((f) => ({ ...f, createdTo: e.target.value }))}
                        className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md" />
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
        <div className="px-8 py-4 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Experiments', value: '24', sub: '+3 this week',      icon: 'science'     },
              { label: 'Active Runs',        value: '12', sub: 'Currently running', icon: 'play_circle' },
              { label: 'Contributors',       value: '08', sub: 'Team members',      icon: 'group'       },
            ].map(({ label, value, sub, icon }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>{icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
                  <p className="text-[11px] text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Experiment table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/40">
                {Object.entries(appliedFilters).map(([key, val]) => {
                  if (key === 'workflowStatus' && val === 'All') return null
                  if (key !== 'workflowStatus' && !val) return null
                  const labels = {
                    name: 'Name', workflowStatus: 'Status', owner: 'Owner',
                    contributorsMin: 'Contributors ≥', contributorsMax: 'Contributors ≤',
                    createdFrom: 'Created from', createdTo: 'Created to',
                  }
                  return (
                    <span key={key} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20">
                      {labels[key]}: {val}
                      <button onClick={() => {
                        const updated = { ...appliedFilters, [key]: key === 'workflowStatus' ? 'All' : '' }
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 text-center">#</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experiment Name</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Status</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contributors</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                        No experiments match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((exp, idx) => (
                      <tr
                        key={exp.id}
                        onDoubleClick={() => openExperiment(exp)}
                        className={`border-b border-slate-100 last:border-0 cursor-pointer group transition-all duration-150 ${
                          flashId === exp.id
                            ? 'bg-primary/10'
                            : idx % 2 === 0 ? 'bg-white hover:bg-primary/5' : 'bg-slate-50/40 hover:bg-primary/5'
                        }`}
                        title="Double-click to open experiment"
                      >
                        <td className="px-4 py-2.5 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingExp(exp) }}
                              onDoubleClick={(e) => e.stopPropagation()}
                              title="Edit experiment"
                              className="shrink-0 p-1 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">{exp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{exp.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <WorkflowStatus completedSteps={exp.completedSteps} haltedAt={exp.haltedAt} />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                              {initials(exp.owner)}
                            </div>
                            <span className="text-xs text-slate-700">{exp.owner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {exp.contributors > 0 ? (
                            <div className="flex -space-x-1.5">
                              {Array.from({ length: Math.min(exp.contributors, 3) }).map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                  {i + 1}
                                </div>
                              ))}
                              {exp.contributors > 3 && (
                                <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-[9px] font-bold text-primary">
                                  +{exp.contributors - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{exp.created}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-bold text-slate-700">{experiments.length}</span> experiments
              </span>
              <p className="text-[10px] text-slate-400">
                Tip: Double-click a row to open its Recipe &amp; Protocol detail.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateExperimentModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
      {editingExp && (
        <EditExperimentModal experiment={editingExp} onClose={() => setEditingExp(null)} onSave={handleSaveEdit} />
      )}
    </div>
  )
}
