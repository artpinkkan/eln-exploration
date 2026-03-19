import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { label: 'Recipe and Protocol', icon: 'description', active: true },
  { label: 'Resource Availability', icon: 'inventory', active: false },
  { label: 'Execution', icon: 'play_circle', active: false },
  { label: 'Data Analysis', icon: 'bar_chart', active: false },
]

function ProfileDropdown({ onClose }) {
  const navigate = useNavigate()

  function handleLogout() {
    onClose()
    navigate('/')
  }

  return (
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Log Out
        </button>
      </div>
    </div>
  )
}

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const profileRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

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
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold hover:ring-2 hover:ring-primary/40 transition-all"
            >
              PP
            </button>
            {dropdownOpen && (
              <ProfileDropdown onClose={() => setDropdownOpen(false)} />
            )}
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
