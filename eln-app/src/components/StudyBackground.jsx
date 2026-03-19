const TOOLBAR_BUTTONS = [
  'format_bold', 'format_italic', 'format_underlined', 'format_strikethrough',
  null,
  'format_color_text', 'format_paint',
  null,
  'link', 'link_off',
  null,
  'format_list_bulleted', 'format_list_numbered',
  null,
  'format_align_left', 'format_align_center', 'format_align_right', 'format_align_justify',
  null,
  'table_chart', 'undo', 'redo', 'image',
]

export default function StudyBackground() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">description</span>
          Study Background
        </h2>
        <span className="material-symbols-outlined text-slate-400">expand_more</span>
      </div>
      <div>
        <div className="rich-text-toolbar flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          {TOOLBAR_BUTTONS.map((icon, i) =>
            icon === null ? (
              <div key={i} className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
            ) : icon === 'font-size' ? (
              <select key={i} className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-1 px-2 rounded">
                <option>16 px</option>
              </select>
            ) : (
              <button key={icon}>
                <span className="material-symbols-outlined text-lg">{icon}</span>
              </button>
            )
          )}
          <select className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-1 px-2 rounded">
            <option>16 px</option>
          </select>
        </div>
        <div className="p-8 min-h-[300px] prose dark:prose-invert max-w-none">
          <h3 className="text-xl font-bold mb-4">Background</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Click here to start writing the experiment background...</p>
          <h3 className="text-xl font-bold mb-4">Study Design</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Define the parameters and constraints of your study...</p>
          <h3 className="text-xl font-bold mb-4">Objective</h3>
          <p className="text-slate-500 dark:text-slate-400">State the primary and secondary goals of this formulation...</p>
        </div>
      </div>
    </div>
  )
}
