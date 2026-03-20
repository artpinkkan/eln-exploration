import { useState, useRef, useCallback } from 'react'
import RichTextEditor from './RichTextEditor'

const INITIAL_HTML = [
  '<h3>Background</h3>',
  '<p style="color:#64748b">Click here to start writing the experiment background...</p>',
  '<h3>Study Design</h3>',
  '<p style="color:#64748b">Define the parameters and constraints of your study...</p>',
  '<h3>Objective</h3>',
  '<p style="color:#64748b">State the primary and secondary goals of this formulation...</p>',
].join('')

export default function StudyBackground({ isEditing = false }) {
  const inlineRef  = useRef(null)
  const modalRef   = useRef(null)

  const [collapsed,     setCollapsed]     = useState(false)
  const [showExpanded,  setShowExpanded]  = useState(false)
  const [saveStatus,    setSaveStatus]    = useState(null) // null | 'saving' | 'saved'
  const saveTimerRef = useRef(null)

  const handleChange = useCallback(() => {
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved')
    }, 800)
  }, [])

  function openExpanded() {
    setShowExpanded(true)
    // Seed modal editor with current inline content after it mounts
    requestAnimationFrame(() => {
      if (modalRef.current)
        modalRef.current.innerHTML = inlineRef.current?.innerHTML ?? INITIAL_HTML
    })
  }

  function applyExpanded() {
    if (inlineRef.current)
      inlineRef.current.innerHTML = modalRef.current?.innerHTML ?? ''
    setShowExpanded(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">

        {/* ── Header ── */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center rounded-t-xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>description</span>
            Study Background
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 ml-1">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '11px' }}>autorenew</span>
                Saving…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 ml-1">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                Automatically saved
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {/* Expand into modal */}
            <button
              title="Open in full-screen editor"
              onClick={openExpanded}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>open_in_full</span>
            </button>
            {/* Collapse */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {collapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Inline editor ── */}
        {!collapsed && (
          <RichTextEditor
            ref={inlineRef}
            isEditing={isEditing}
            defaultHtml={INITIAL_HTML}
            minHeight="260px"
            onChange={handleChange}
          />
        )}
      </div>

      {/* ── Expanded modal ── */}
      {showExpanded && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl" style={{ maxHeight: '92vh' }}>

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>description</span>
                Study Background
                <span className="text-[10px] font-normal text-slate-400 ml-1">— full-screen editor</span>
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '11px' }}>autorenew</span>
                    Saving…
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
                    Automatically saved
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowExpanded(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Modal editor (scrollable) */}
            <div className="flex-1 overflow-y-auto">
              <RichTextEditor
                ref={modalRef}
                isEditing={isEditing}
                defaultHtml=""
                minHeight="480px"
                stickyToolbar
                onChange={handleChange}
              />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0 rounded-b-2xl">
              <button
                onClick={() => setShowExpanded(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyExpanded}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
