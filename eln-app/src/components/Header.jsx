import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Recipe and Protocol', icon: 'description', active: true },
  { label: 'Resource Availability', icon: 'inventory', active: false },
  { label: 'Execution', icon: 'play_circle', active: false },
  { label: 'Data Analysis', icon: 'bar_chart', active: false },
]

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const projectName = location.state?.projectName ?? 'Neuro-Regen Alpha'
  const experimentName = location.state?.experimentName ?? 'Recipe & Protocol'

  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 pt-4 px-8 sticky top-0 z-20">
      <div className="flex items-center mb-4">
        <nav className="flex text-xs text-slate-400 gap-2 items-center uppercase tracking-wide">
          <button
            onClick={() => navigate('/projects')}
            className="hover:text-primary transition-colors"
          >
            Project List
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <button
            onClick={() => navigate('/experiment', { state: { projectName } })}
            className="hover:text-primary transition-colors"
          >
            {projectName}
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">{experimentName}</span>
        </nav>
      </div>
      <div className="flex gap-8 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap text-xs ${
              tab.active
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}
