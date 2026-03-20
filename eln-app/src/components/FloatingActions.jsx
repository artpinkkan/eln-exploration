import { useState } from 'react'

const TOC_SECTIONS = [
  { id: 'section-experiment-info',      label: 'Experiment Info' },
  { id: 'section-study-background',     label: 'Study Background' },
  { id: 'section-product-specification',label: 'Product Specification' },
  { id: 'section-materials',            label: 'Materials' },
  { id: 'section-procedure',            label: 'Protocols' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function FloatingActions() {
  const [showToc, setShowToc] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-30">
      {/* TOC panel */}
      {showToc && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-56 overflow-hidden mb-1">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>list_alt</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Table of Contents</span>
          </div>
          <ul className="py-1">
            {TOC_SECTIONS.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => { scrollTo(s.id); setShowToc(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table of Contents button */}
      <button
        onClick={() => setShowToc((v) => !v)}
        className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center border hover:scale-105 transition-transform ${
          showToc
            ? 'bg-primary text-white border-primary'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }`}
        title="Table of Contents"
      >
        <span className="material-symbols-outlined text-2xl">list_alt</span>
      </button>

      {/* History */}
      <button className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform">
        <span className="material-symbols-outlined">history</span>
      </button>

      {/* Chat */}
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
