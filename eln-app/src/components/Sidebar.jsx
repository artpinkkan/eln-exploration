import { useState } from 'react'

const SYS_CONFIG_ITEMS = [
  'Material',
  'Material Batch',
  'Instrument',
  'Instrument Code',
  'Product',
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [sysConfigOpen, setSysConfigOpen] = useState(true)

  return (
    <aside
      className={`${isOpen ? 'w-56' : 'w-14'} shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300`}
    >
      {/* Org Header */}
      <div className="px-3 py-4 flex items-center gap-2 border-b border-slate-100 min-h-[68px]">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>science</span>
        </div>
        {isOpen && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 leading-tight truncate">Kalbe Nutritional</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate">Primary Research Unit</p>
          </div>
        )}
        <button
          onClick={() => {
            if (isOpen) setSysConfigOpen(false)
            setIsOpen((v) => !v)
          }}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="shrink-0 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {isOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {/* Project List — always active */}
        <div
          title={!isOpen ? 'Project List' : undefined}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg bg-primary/10 cursor-default"
        >
          <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '18px' }}>folder_open</span>
          {isOpen && (
            <>
              <span className="flex-1 text-sm font-semibold text-primary truncate">Project List</span>
              <span className="w-1 h-4 rounded-full bg-primary shrink-0" />
            </>
          )}
        </div>

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
              {SYS_CONFIG_ITEMS.map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

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
