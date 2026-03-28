import { useState, useRef } from 'react'
import RichTextEditor from './RichTextEditor'

const INITIAL_HTML = [
  '<h3>Background</h3>',
  '<p style="color:#64748b">Click here to start writing the experiment background...</p>',
  '<h3>Study Design</h3>',
  '<p style="color:#64748b">Define the parameters and constraints of your study...</p>',
  '<h3>Objective</h3>',
  '<p style="color:#64748b">State the primary and secondary goals of this formulation...</p>',
].join('')

export default function StudyBackground({ isEditing = false, initialHtml = INITIAL_HTML, onHtmlChange }) {
  const inlineRef  = useRef(null)
  const modalRef   = useRef(null)

  const [collapsed,    setCollapsed]    = useState(false)
  const [showExpanded, setShowExpanded] = useState(false)
  const [isDirty,        setIsDirty]        = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [lastSavedAt,    setLastSavedAt]    = useState(null)

  function handleChange() {
    setIsDirty(true)
    setAlertDismissed(false)
    onHtmlChange?.(inlineRef.current?.innerHTML ?? '')
  }

  function handleSave() {
    setIsDirty(false)
    setAlertDismissed(false)
    setLastSavedAt(new Date())
  }

  function openExpanded() {
    setShowExpanded(true)
    requestAnimationFrame(() => {
      if (modalRef.current)
        modalRef.current.innerHTML = inlineRef.current?.innerHTML ?? INITIAL_HTML
    })
  }

  function applyExpanded() {
    if (inlineRef.current)
      inlineRef.current.innerHTML = modalRef.current?.innerHTML ?? ''
    handleSave()
    setShowExpanded(false)
  }

  const savedLabel = lastSavedAt && (
    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 ml-1">
      <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>check_circle</span>
      Latest saved at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )

  const unsavedChip = isDirty && !alertDismissed && (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 ml-1">
      <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>warning</span>
      Unsaved changes
      <button onClick={() => setAlertDismissed(true)} className="opacity-40 hover:opacity-100 transition-opacity leading-none">
        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
      </button>
    </span>
  )

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">

        {/* ── Header ── */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center rounded-t-xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>description</span>
            Study Background
            {savedLabel}
            {unsavedChip}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>save</span>
              Save
            </button>
            <button
              title="Open in full-screen editor"
              onClick={openExpanded}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>open_in_full</span>
            </button>
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
            defaultHtml={initialHtml}
            minHeight="260px"
            onChange={handleChange}
          />
        )}
      </div>

      {/* ── Full-screen editor ── */}
      {showExpanded && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>description</span>
              Study Background
              {savedLabel}
              {unsavedChip}
            </h2>
            <div className="flex items-center gap-2">
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
                Save
              </button>
              <button
                onClick={() => setShowExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="Exit full screen"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close_fullscreen</span>
              </button>
            </div>
          </div>

          {/* Editor (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <RichTextEditor
              ref={modalRef}
              isEditing={isEditing}
              defaultHtml=""
              minHeight="calc(100vh - 65px)"
              stickyToolbar
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </>
  )
}
