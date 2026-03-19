import Header from '../components/Header'
import ExperimentInfo from '../components/ExperimentInfo'
import CollaboratorInfo from '../components/CollaboratorInfo'
import StudyBackground from '../components/StudyBackground'
import MaterialsFormulation from '../components/MaterialsFormulation'
import ProductSpecification from '../components/ProductSpecification'
import ProcedureProtocol from '../components/ProcedureProtocol'
import FloatingActions from '../components/FloatingActions'

export default function RecipeProtocolPage() {
  return (
    <>
      <Header />
      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recipe &amp; Protocol</h1>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                In Progress
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last synchronization 2 minutes ago</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 flex items-center gap-2 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span> Take Control
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-colors text-slate-700 dark:text-slate-200">
              <span className="material-symbols-outlined text-sm">download</span> Export
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 text-primary rounded-lg text-sm font-medium hover:bg-primary/5 flex items-center gap-2 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-sm">clinical_notes</span> Template
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-sm">save</span> Save Changes
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center gap-2 shadow-md transition-all">
              <span className="material-symbols-outlined text-sm">send</span> Submit
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExperimentInfo />
          <CollaboratorInfo />
        </div>

        <StudyBackground />
        <MaterialsFormulation />
        <ProductSpecification />
        <ProcedureProtocol />
      </div>
      <FloatingActions />
    </>
  )
}
