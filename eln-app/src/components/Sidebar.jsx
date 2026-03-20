import { useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { icon: 'dashboard', routes: ['/projects', '/app'] },
  { icon: 'inventory_2', routes: [] },
  { icon: 'history', routes: [] },
  { icon: 'settings', routes: [] },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-16 border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex flex-col items-center py-6 gap-6 sticky top-0 h-screen shrink-0">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined">science</span>
      </div>
      <nav className="flex flex-col gap-4">
        {NAV_ITEMS.map(({ icon, routes }) => {
          const active = routes.includes(pathname)
          return (
            <button
              key={icon}
              className={`p-2 rounded-lg transition-colors ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-slate-400 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
