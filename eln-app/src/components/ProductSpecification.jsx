const COLUMNS = ['Parameter', 'Minimum', 'Maximum', 'Unit']

export default function ProductSpecification() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
        <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
          Product Specification
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Showing</span>
            <select className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-[10px] py-1 px-2 focus:ring-primary">
              <option>10</option>
            </select>
            <span>of 0 entries</span>
          </div>
          <button className="px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add</span> Product Specification
          </button>
          <span className="material-symbols-outlined text-slate-400">expand_more</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 uppercase text-[9px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Actions</th>
              {COLUMNS.map((col) => (
                <th key={col} className="px-6 py-4 cursor-pointer hover:text-primary">
                  <span className="flex items-center gap-1">
                    {col} <span className="material-symbols-outlined text-xs">unfold_more</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <div className="flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">inventory_2</span>
                  <span className="text-slate-400 font-medium">No data found</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-1">
        {['first_page', 'chevron_left', 'chevron_right', 'last_page'].map((icon) => (
          <button key={icon} className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50">
            <span className="material-symbols-outlined text-sm">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
