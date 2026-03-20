import { useState } from 'react'

const MANAGER_OPTIONS    = ['Ahmad Rasyid', 'Elena Smith', 'Hendra Wijaya', 'Lisa Tanaka']
const CONTRIBUTOR_OPTIONS = ['Siti Rahayu', 'Marcus Lee', 'Priya Nair', 'Nurul Hidayah']

const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const FIELD_COLORS = [
  'bg-primary/10 text-primary',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, colorClass }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${colorClass}`}>
      {initials(name)}
    </div>
  )
}

function PersonRow({ name, colorClass, onRemove }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar name={name} colorClass={colorClass} />
      <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-0.5 rounded hover:bg-red-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
        </button>
      )}
    </div>
  )
}

export default function ExperimentCollaboratorBar({ isEditing = false }) {
  const [manager, setManager]           = useState(null)
  const [contributors, setContributors] = useState(['crdadmin crdadmin', 'pharma pharma'])

  const fields = [
    { label: 'Project Name',     value: 'project 3 - pinkan', icon: 'folder_open'  },
    { label: 'Product Name',     value: 'Hydro Coco',          icon: 'inventory_2'  },
    { label: 'Experiment Name',  value: 'testing 1',           icon: 'science'      },
    { label: 'Retained Sample',  value: '—',                   icon: 'colorize'     },
    { label: 'Location',         value: '—',                   icon: 'location_on'  },
  ]

  const availableContributors = CONTRIBUTOR_OPTIONS.filter((n) => !contributors.includes(n))

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

      {/* ── Row 1: Experiment fields ── */}
      <div className="flex items-stretch divide-x divide-slate-100">
        {fields.map((field, i) => (
          <div key={field.label} className="flex-1 px-4 py-3 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${FIELD_COLORS[i]}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{field.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{field.label}</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                defaultValue={field.value === '—' ? '' : field.value}
                placeholder={field.value === '—' ? 'Not set' : ''}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-300"
              />
            ) : (
              <span className={`text-xs font-medium truncate ${field.value === '—' ? 'text-slate-300 italic' : 'text-slate-800'}`}>
                {field.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Row 2: Collaborators ── */}
      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 flex items-start gap-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 shrink-0 pt-0.5">Collaborators</span>

        {/* Manager */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Manager</p>
          {manager ? (
            <PersonRow
              name={manager}
              colorClass={AVATAR_COLORS[0]}
              onRemove={isEditing ? () => setManager(null) : undefined}
            />
          ) : (
            isEditing ? null : <span className="text-xs text-slate-300 italic">Unassigned</span>
          )}
          {isEditing && (
            <select
              value=""
              onChange={(e) => { if (e.target.value) setManager(e.target.value) }}
              className="mt-1.5 w-full text-xs text-slate-500 bg-white border border-dashed border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="">{manager ? 'Change manager…' : 'Assign manager…'}</option>
              {MANAGER_OPTIONS.filter((n) => n !== manager).map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          )}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-slate-200 shrink-0" />

        {/* Contributors */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Contributors</p>
          {contributors.length === 0 && !isEditing && (
            <span className="text-xs text-slate-300 italic">None assigned</span>
          )}
          <div className="space-y-0">
            {contributors.map((name, i) => (
              <PersonRow
                key={name}
                name={name}
                colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                onRemove={isEditing ? () => setContributors((prev) => prev.filter((c) => c !== name)) : undefined}
              />
            ))}
          </div>
          {isEditing && availableContributors.length > 0 && (
            <select
              value=""
              onChange={(e) => { if (e.target.value) setContributors((prev) => [...prev, e.target.value]) }}
              className="mt-1.5 w-full text-xs text-slate-500 bg-white border border-dashed border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="">Add contributor…</option>
              {availableContributors.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          )}
        </div>
      </div>

    </div>
  )
}
