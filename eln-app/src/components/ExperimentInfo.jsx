export default function ExperimentInfo() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          Experiment Info
        </h2>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Name</label>
          <input
            type="text"
            defaultValue="project 3 - pinkan"
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
          <input
            type="text"
            defaultValue="Hydro Coco"
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Experiment Name</label>
          <input
            type="text"
            defaultValue="testing 1"
            className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Retained Sample</label>
            <input
              type="text"
              placeholder="Enter Retained Sample"
              className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
            <input
              type="text"
              placeholder="Enter Location"
              className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
