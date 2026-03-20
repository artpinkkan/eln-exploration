import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TENANTS } from '../pages/user-management/data'

const SYS_CONFIG_ITEMS = [
  { label: 'Material',        path: '/config/material' },
  { label: 'Material Batch',  path: '/config/material-batch' },
  { label: 'Instrument',      path: '/config/instrument' },
  { label: 'Instrument Code', path: '/config/instrument-code' },
  { label: 'Product',         path: '/config/product' },
]

const ACTIVE_TENANTS = TENANTS.filter((t) => t.status === 'Active')

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [sysConfigOpen, setSysConfigOpen] = useState(true)
  const [activeTenant, setActiveTenant] = useState(ACTIVE_TENANTS[1]) // default: KALBE
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false)
  const tenantMenuRef = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    function handleClick(e) {
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(e.target)) {
        setTenantMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <aside
      className={`${isOpen ? 'w-56' : 'w-14'} shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300`}
    >
      {/* Org Header / Tenant Switcher */}
      <div className="px-3 py-4 border-b border-slate-100 min-h-[68px] relative" ref={tenantMenuRef}>
        <div className="flex items-center gap-2">
          {/* Tenant avatar */}
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-black">{activeTenant.tenantCode.slice(0, 2)}</span>
          </div>

          {isOpen && (
            <button
              onClick={() => setTenantMenuOpen((v) => !v)}
              className="min-w-0 flex-1 flex items-center gap-1 text-left group"
              title="Switch tenant"
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 leading-tight truncate">{activeTenant.tenantName}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate">{activeTenant.tenantCode} · Primary Research Unit</p>
              </div>
              <span
                className={`material-symbols-outlined text-slate-400 shrink-0 transition-transform duration-200 ${tenantMenuOpen ? 'rotate-180' : ''}`}
                style={{ fontSize: '16px' }}
              >
                expand_more
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (isOpen) setSysConfigOpen(false)
              setIsOpen((v) => !v)
              setTenantMenuOpen(false)
            }}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="shrink-0 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {isOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Tenant dropdown */}
        {tenantMenuOpen && isOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch Tenant</p>
            </div>
            <div className="py-1">
              {ACTIVE_TENANTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTenant(t); setTenantMenuOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${
                    activeTenant.id === t.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    activeTenant.id === t.id ? 'bg-primary' : 'bg-slate-100'
                  }`}>
                    <span className={`text-[10px] font-black ${activeTenant.id === t.id ? 'text-white' : 'text-slate-500'}`}>
                      {t.tenantCode.slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${activeTenant.id === t.id ? 'text-primary' : 'text-slate-700'}`}>
                      {t.tenantName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{t.tenantCode}</p>
                  </div>
                  {activeTenant.id === t.id && (
                    <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '14px' }}>check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {/* Project List */}
        <button
          title={!isOpen ? 'Project List' : undefined}
          onClick={() => navigate('/projects')}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-colors ${
            location.pathname === '/projects'
              ? 'bg-primary/10 cursor-default'
              : 'hover:bg-slate-50'
          }`}
        >
          <span
            className={`material-symbols-outlined shrink-0 ${location.pathname === '/projects' ? 'text-primary' : 'text-slate-400'}`}
            style={{ fontSize: '18px' }}
          >folder_open</span>
          {isOpen && (
            <>
              <span className={`flex-1 text-sm font-semibold truncate text-left ${location.pathname === '/projects' ? 'text-primary' : 'text-slate-500'}`}>
                Project List
              </span>
              {location.pathname === '/projects' && (
                <span className="w-1 h-4 rounded-full bg-primary shrink-0" />
              )}
            </>
          )}
        </button>

        {/* System Configuration */}
        <div>
          <button
            onClick={() => isOpen && setSysConfigOpen((v) => !v)}
            title={!isOpen ? 'System Configuration' : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 shrink-0" style={{ fontSize: '18px' }}>settings</span>
            {isOpen && (
              <>
                <span className="flex-1 text-left truncate">System Configuration</span>
                <span
                  className="material-symbols-outlined text-slate-300 shrink-0 transition-transform duration-200"
                  style={{ fontSize: '16px', transform: sysConfigOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  chevron_right
                </span>
              </>
            )}
          </button>

          {isOpen && sysConfigOpen && (
            <div className="mt-0.5 ml-9 space-y-0.5">
              {SYS_CONFIG_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* User Management */}
        <button
          title={!isOpen ? 'User Management' : undefined}
          onClick={() => navigate('/user-management')}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === '/user-management'
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span
            className={`material-symbols-outlined shrink-0 ${location.pathname === '/user-management' ? 'text-primary' : 'text-slate-400'}`}
            style={{ fontSize: '18px' }}
          >
            manage_accounts
          </span>
          {isOpen && <span className="truncate">User Management</span>}
        </button>

        {/* Audit Trail */}
        <button
          title={!isOpen ? 'Audit Trail' : undefined}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-400 shrink-0" style={{ fontSize: '18px' }}>manage_search</span>
          {isOpen && <span className="truncate">Audit Trail</span>}
        </button>
      </nav>
    </aside>
  )
}
