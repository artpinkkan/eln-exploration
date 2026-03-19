const STEPS = [
  {
    id: 1,
    title: 'Charge Water',
    description: 'Charge Purified Water into mixing vessel at ambient temperature.',
    criteria: [{ parameter: 'Temperature', min: '20', max: '25', unit: '°C' }],
  },
  {
    id: 2,
    title: 'Main Mix',
    description: 'Start agitation at 200 RPM and add Glycerin.',
    criteria: [{ parameter: 'Speed', min: '180', max: '220', unit: 'RPM' }],
  },
]

function ProcedureStep({ step }) {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 p-5 flex gap-4 border-r border-slate-100 dark:border-slate-800">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
            {step.id}
          </div>
          <span className="material-symbols-outlined text-slate-300 text-lg cursor-grab">drag_indicator</span>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              defaultValue={step.title}
              className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 w-full"
            />
            <button className="text-slate-400">
              <span className="material-symbols-outlined text-sm">more_horiz</span>
            </button>
          </div>
          <textarea
            rows={2}
            defaultValue={step.description}
            className="w-full text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      <div className="w-full md:w-[400px] bg-slate-50/50 dark:bg-slate-900/30 p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Criteria</p>
        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 px-1">
          <span>Parameter</span>
          <span>Min</span>
          <span>Max</span>
          <span>Unit</span>
        </div>
        <div className="space-y-2">
          {step.criteria.map((c, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <input
                type="text"
                defaultValue={c.parameter}
                className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded p-1.5 focus:ring-primary"
              />
              <input
                type="text"
                defaultValue={c.min}
                className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded p-1.5 focus:ring-primary"
              />
              <input
                type="text"
                defaultValue={c.max}
                className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded p-1.5 focus:ring-primary"
              />
              <select className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded p-1.5 focus:ring-primary">
                <option>{c.unit}</option>
              </select>
            </div>
          ))}
        </div>
        <button className="mt-3 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Criteria
        </button>
      </div>
    </div>
  )
}

export default function ProcedureProtocol() {
  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">format_list_numbered</span>
          Procedure &amp; Protocol
        </h2>
        <button className="p-1 text-slate-400 hover:text-primary">
          <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
        </button>
      </div>
      {STEPS.map((step) => (
        <ProcedureStep key={step.id} step={step} />
      ))}
      <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
        <span className="material-symbols-outlined">add</span> Add Procedure Step
      </button>
    </div>
  )
}
