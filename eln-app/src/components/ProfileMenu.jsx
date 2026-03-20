import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold hover:ring-2 hover:ring-primary/40 transition-all"
      >
        PP
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Pinkan P.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">pinkan@precision.eln</p>
          </div>
          <div className="py-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[18px] text-slate-400">manage_accounts</span>
              Profile Settings
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
