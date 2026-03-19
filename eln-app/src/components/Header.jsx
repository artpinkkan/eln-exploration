const TABS = [
  { label: 'Recipe and Protocol', icon: 'description', active: true },
  { label: 'Resource Availability', icon: 'inventory', active: false },
  { label: 'Execution', icon: 'play_circle', active: false },
  { label: 'Data Analysis', icon: 'bar_chart', active: false },
]

export default function Header() {
  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 pt-4 px-8 sticky top-0 z-20">
      <div className="flex justify-between items-center mb-4">
        <nav className="flex text-xs text-slate-500 dark:text-slate-400 gap-2 items-center uppercase tracking-wide">
          <span>Projects</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">Experiment Lab</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="material-symbols-outlined text-[16px]">biotech</span>
          <span>Formulation v2.4</span>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
            PP
          </div>
        </div>
      </div>
      <div className="flex gap-8 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap text-sm ${
              tab.active
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}
