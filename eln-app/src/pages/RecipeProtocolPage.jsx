import { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import ExperimentCollaboratorBar from '../components/ExperimentCollaboratorBar'
import StudyBackground from '../components/StudyBackground'
import MaterialsFormulation from '../components/MaterialsFormulation'
import ProductSpecification from '../components/ProductSpecification'
import ProcedureProtocol from '../components/ProcedureProtocol'
import FloatingActions from '../components/FloatingActions'
import SaveAsFormulaModal from '../components/SaveAsFormulaModal'
import ExportPDFModal from '../components/ExportPDFModal'
import ApplyExperimentTemplateModal from '../components/ApplyExperimentTemplateModal'

export default function RecipeProtocolPage() {
  const [isEditing,          setIsEditing]          = useState(false)
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false)
  const [showExportPDF,      setShowExportPDF]      = useState(false)
  const [stepContent,        setStepContent]        = useState({})
  const [showSaveMenu,       setShowSaveMenu]       = useState(false)
  const [controlsCollapsed,  setControlsCollapsed]  = useState(false)
  const [stages,             setStages]             = useState([])
  const [formulas,           setFormulas]           = useState([{ id: 1, name: 'Formula 1', scale: 100, includedStageIds: new Set() }])
  const [lastSync,           setLastSync]           = useState(null)
  const [showApplyTemplate,  setShowApplyTemplate]  = useState(false)
  // Lifted state from section components — tracked for template save/apply
  const [studyBgHtml,      setStudyBgHtml]      = useState(null)
  const [specRows,         setSpecRows]         = useState([])
  const [collaboratorData, setCollaboratorData] = useState(null)
  const [sectionKey,       setSectionKey]       = useState(0)

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

  function formatSync(date) {
    if (!date) return null
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(date.getDate())}-${pad(date.getMonth()+1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  function handleSaveChanges() {
    const now = new Date()
    setLastSync(now)
    setShowSaveMenu(false)
  }

  function finishEditing() {
    setIsEditing(false)
    setShowSaveMenu(false)
  }

  return (
    <>
      {/* ── Sticky header (breadcrumb + tabs) ── */}
      <Header />

      {/* ── Sticky controls bar (outside scroll, so it never moves) ── */}
      <div className="relative bg-white border-b border-slate-200 shrink-0">

        {!controlsCollapsed && (
          <>
        {/* Row 1: Mode banner + Take Control / Finish Editing */}
        {isEditing ? (
          <div className="flex items-center justify-between px-8 py-1 bg-primary/5 border-b border-primary/20">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '13px' }}>edit</span>
              <p className="text-[11px] font-semibold text-primary">
                Editing session active — you have control of this document.
              </p>
            </div>
            <button
              onClick={finishEditing}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
              Finish Editing
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-8 py-1 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '13px' }}>lock</span>
              <p className="text-[11px] text-slate-500">
                Read Only — start an editing session to make changes.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-primary text-primary text-[11px] font-semibold rounded-md hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>edit</span>
              Take Control
            </button>
          </div>
        )}

        {/* Row 2: Action buttons (always visible, enabled only in Editing) */}
        <div className="flex items-center justify-between px-8 py-2">
          {/* Left: badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">
              {lastSync
                ? <><span className="text-emerald-500 font-medium">Saved</span> {formatSync(lastSync)}</>
                : 'Not saved yet'}
            </span>
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
            <button
              onClick={() => setShowExportPDF(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>picture_as_pdf</span>
              Export PDF
            </button>

            {/* Apply Template */}
            <button
              disabled={!isEditing}
              onClick={() => isEditing && setShowApplyTemplate(true)}
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
                onClick={() => isEditing && handleSaveChanges()}
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
                    onClick={handleSaveChanges}
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
          </>
        )}

        {/* Collapse toggle — small pill at bottom-right, overlapping the border */}
        <button
          onClick={() => setControlsCollapsed((v) => !v)}
          title={controlsCollapsed ? 'Show controls' : 'Hide controls'}
          className="absolute bottom-0 right-8 translate-y-full flex items-center justify-center w-7 h-5 bg-white border border-t-0 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-b-md shadow-sm transition-colors z-20"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {controlsCollapsed ? 'expand_more' : 'expand_less'}
          </span>
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div>
          <div id="section-experiment-info" className="mb-8">
            <ExperimentCollaboratorBar
              key={`ecb-${sectionKey}`}
              isEditing={isEditing}
              initialData={collaboratorData}
              onDataChange={setCollaboratorData}
            />
          </div>
          <div className={`space-y-8 ${isEditing ? '' : 'opacity-70 pointer-events-none select-none'}`}>
            <div id="section-study-background">
              <StudyBackground
                key={`sb-${sectionKey}`}
                isEditing={isEditing}
                initialHtml={studyBgHtml ?? undefined}
                onHtmlChange={setStudyBgHtml}
              />
            </div>
            <div id="section-product-specification">
              <ProductSpecification
                key={`ps-${sectionKey}`}
                isEditing={isEditing}
                initialRows={specRows.length > 0 ? specRows : undefined}
                onRowsChange={setSpecRows}
              />
            </div>
            <div id="section-materials"><MaterialsFormulation stages={stages} setStages={setStages} formulas={formulas} setFormulas={setFormulas} /></div>
            <div id="section-procedure"><ProcedureProtocol stages={stages} formulas={formulas} onStepContentChange={setStepContent} /></div>
          </div>
        </div>
      </div>

      <FloatingActions />

      {showSaveAsTemplate && (
        <SaveAsFormulaModal
          stages={stages}
          formulas={formulas}
          stepContent={stepContent}
          studyBgHtml={studyBgHtml}
          specRows={specRows}
          collaboratorData={collaboratorData}
          onClose={() => setShowSaveAsTemplate(false)}
        />
      )}

      {showApplyTemplate && (
        <ApplyExperimentTemplateModal
          onApply={(tpl) => {
            if (tpl.data.stages?.length)    setStages(tpl.data.stages)
            if (tpl.data.formulas?.length)  setFormulas(tpl.data.formulas.map(f => ({ ...f, includedStageIds: new Set(f.includedStageIds) })))
            if (tpl.data.stepContent)       setStepContent(tpl.data.stepContent)
            if (tpl.data.studyBgHtml)       setStudyBgHtml(tpl.data.studyBgHtml)
            if (tpl.data.specRows?.length)  setSpecRows(tpl.data.specRows)
            if (tpl.data.collaboratorData)  setCollaboratorData(tpl.data.collaboratorData)
            setSectionKey(k => k + 1)
            setShowApplyTemplate(false)
          }}
          onClose={() => setShowApplyTemplate(false)}
        />
      )}

      {showExportPDF && (
        <ExportPDFModal
          onClose={() => setShowExportPDF(false)}
          stages={stages}
          formulas={formulas}
          stepContent={stepContent}
        />
      )}
    </>
  )
}
