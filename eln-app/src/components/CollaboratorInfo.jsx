const CONTRIBUTORS = ['crdadmin crdadmin', 'pharma pharma']

export default function CollaboratorInfo() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">group</span>
          Collaborator Info
        </h2>
      </div>
      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assign Managers</label>
          <select className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary py-2.5">
            <option>Assign Managers</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contributors</label>
          <div className="flex flex-wrap gap-2 p-2 min-h-[42px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            {CONTRIBUTORS.map((name) => (
              <div
                key={name}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium"
              >
                {name}
                <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-500">close</span>
              </div>
            ))}
            <input
              type="text"
              placeholder="Select contributors"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 min-w-[120px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
