import { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import ExperimentCollaboratorBar from '../components/ExperimentCollaboratorBar'
import StudyBackground from '../components/StudyBackground'
import MaterialsFormulation from '../components/MaterialsFormulation'
import ProductSpecification from '../components/ProductSpecification'
import ProcedureProtocol from '../components/ProcedureProtocol'
import FloatingActions from '../components/FloatingActions'
import SaveAsFormulaModal from '../components/SaveAsFormulaModal'

export default function RecipeProtocolPage() {
  const [isEditing,          setIsEditing]          = useState(false)
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false)
  const [showSaveMenu,       setShowSaveMenu]       = useState(false)

  const saveMenuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target)) {
        setShowSaveMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function finishEditing() {
    setIsEditing(false)
    setShowSaveMenu(false)
  }

  return (
    <>
      {/* ── Sticky header (breadcrumb + tabs) ── */}
      <Header />

      {/* ── Sticky controls bar (outside scroll, so it never moves) ── */}
      <div className="bg-white border-b border-slate-200 shrink-0">

        {/* Row 1: Mode banner + Take Control / Finish Editing */}
        {isEditing ? (
          <div className="flex items-center justify-between px-8 py-2 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>edit</span>
              <p className="text-xs font-semibold text-primary">
                Editing session active — you have control of this document.
              </p>
            </div>
            <button
              onClick={finishEditing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
              Finish Editing
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-8 py-2 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>lock</span>
              <p className="text-xs text-slate-500">
                Read Only — start an editing session to make changes.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
              Take Control
            </button>
          </div>
        )}

        {/* Row 2: Action buttons (always visible, enabled only in Editing) */}
        <div className="flex items-center justify-between px-8 py-2">
          {/* Left: badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">Last sync: 20-03-2026 15:41</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              In Progress
            </span>
            {isEditing ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>edit</span>
                Editing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>lock</span>
                Read Only
              </span>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2">
            {/* Export — always active */}
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
              Export
            </button>

            {/* Apply Template */}
            <button
              disabled={!isEditing}
              className={`px-3 py-1.5 border rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors ${
                isEditing
                  ? 'bg-white border-primary/30 text-primary hover:bg-primary/5'
                  : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
              title={!isEditing ? 'Take Control to apply a template' : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>file_copy</span>
              Apply Template
            </button>

            {/* Save split-button */}
            <div className="relative flex" ref={saveMenuRef}>
              <button
                disabled={!isEditing}
                onClick={() => isEditing && setShowSaveMenu(false)}
                className={`px-3 py-1.5 border rounded-l-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors border-r-0 ${
                  isEditing
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title={!isEditing ? 'Take Control to save' : undefined}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                Save
              </button>
              <button
                disabled={!isEditing}
                onClick={() => isEditing && setShowSaveMenu((v) => !v)}
                className={`px-1.5 py-1.5 border rounded-r-lg text-xs shadow-sm transition-colors flex items-center ${
                  isEditing
                    ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {showSaveMenu ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showSaveMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => setShowSaveMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">save</span>
                    Save Changes
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    onClick={() => { setShowSaveMenu(false); setShowSaveAsTemplate(true) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">clinical_notes</span>
                    Save as Template
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={!isEditing}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                isEditing
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={!isEditing ? 'Take Control to submit' : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span>
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div>
          <div id="section-experiment-info" className="mb-8">
            <ExperimentCollaboratorBar isEditing={isEditing} />
          </div>
          <div className={`space-y-8 ${isEditing ? '' : 'opacity-70 pointer-events-none select-none'}`}>
            <div id="section-study-background"><StudyBackground isEditing={isEditing} /></div>
            <div id="section-product-specification"><ProductSpecification /></div>
            <div id="section-materials"><MaterialsFormulation /></div>
            <div id="section-procedure"><ProcedureProtocol /></div>
          </div>
        </div>
      </div>

      <FloatingActions />

      {showSaveAsTemplate && (
        <SaveAsFormulaModal onClose={() => setShowSaveAsTemplate(false)} />
      )}
    </>
  )
}
