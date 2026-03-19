export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-30">
      <button className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform">
        <span className="material-symbols-outlined text-2xl">list_alt</span>
      </button>
      <button className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform">
        <span className="material-symbols-outlined">history</span>
      </button>
      <div className="relative group">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-white dark:ring-slate-900">
          <span className="material-symbols-outlined text-2xl">forum</span>
        </button>
        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
          4
        </div>
      </div>
    </div>
  )
}
