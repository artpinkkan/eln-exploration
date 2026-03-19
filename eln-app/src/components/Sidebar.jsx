export default function Sidebar() {
  return (
    <aside className="w-16 border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex flex-col items-center py-6 gap-6 sticky top-0 h-screen shrink-0">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined">science</span>
      </div>
      <nav className="flex flex-col gap-4">
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
        </button>
        <button className="p-2 text-primary bg-primary/10 rounded-lg">
          <span className="material-symbols-outlined">inventory_2</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </nav>
    </aside>
  )
}
