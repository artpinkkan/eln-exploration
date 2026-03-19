const MATERIALS = [
  { code: 'MAT-001', name: 'Purified Water, USP Grade', qty: '75.50 g', qc: 'Passed', formulaValue: 75.5 },
  { code: 'MAT-042', name: 'Glycerin USP, Vegetable Source', qty: '5.00 g', qc: 'Passed', formulaValue: 5.0 },
]

export default function MaterialsFormulation() {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
        <h2 className="text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">biotech</span>
          Materials &amp; Formulation
        </h2>
        <button className="px-3 py-1.5 bg-primary text-white rounded text-xs font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span> Formula
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* UOM Config Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Numerator UOM</label>
            <select className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9">
              <option>mg/mL</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Denominator UOM</label>
            <select className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9">
              <option>mg</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scale</label>
            <input
              type="number"
              defaultValue={100}
              className="w-full text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scale UOM</label>
            <input
              type="text"
              defaultValue="Batch"
              disabled
              className="w-full text-sm bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded h-9 cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        {/* Formula Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 w-12 text-center text-slate-400">
                  <span className="material-symbols-outlined text-lg">drag_handle</span>
                </th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500 w-48">Stage</th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500">Material</th>
                <th className="p-3 border-b border-r border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest text-slate-500 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span>Formula 1</span>
                    <button className="text-slate-400 hover:text-primary p-1 rounded hover:bg-slate-100">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="group">
                <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-center bg-slate-50/30">
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 text-lg cursor-grab">drag_indicator</span>
                </td>
                <td className="p-3 border-r border-slate-200 dark:border-slate-800 align-top bg-slate-50/20">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      defaultValue="Phase A: Aqueous"
                      className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5 focus:ring-primary font-medium"
                    />
                    <button className="w-fit flex items-center gap-1 text-primary font-bold text-[10px] uppercase hover:bg-primary/5 px-2 py-1 rounded transition-colors">
                      <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Stage
                    </button>
                  </div>
                </td>
                <td className="p-0 border-r border-slate-200 dark:border-slate-800">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MATERIALS.map((mat) => (
                      <div key={mat.code} className="p-3 flex items-center gap-2">
                        <select className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded text-xs py-1.5">
                          <option>{mat.code} - {mat.name.split(',')[0]}</option>
                        </select>
                        <button className="text-slate-400 hover:text-red-500">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                    <div className="px-3 py-2">
                      <button className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 text-[11px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Material
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MATERIALS.map((mat) => (
                      <div key={mat.code} className="p-3">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded overflow-hidden cell-input-focus bg-white dark:bg-slate-800">
                          <input
                            type="number"
                            defaultValue={mat.formulaValue}
                            className="w-2/3 border-none bg-transparent text-xs py-1.5 focus:ring-0"
                          />
                          <select className="w-1/3 border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[10px] py-1.5 focus:ring-0 text-slate-500">
                            <option>g</option>
                            <option>%</option>
                          </select>
                          <button className="px-1 text-slate-300 hover:text-primary">
                            <span className="material-symbols-outlined text-sm">more_vert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 min-h-[31px]" />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-900 font-bold">
                <td colSpan={3} className="p-3 text-right border-r border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-widest text-slate-500">
                  Theoretical Total
                </td>
                <td className="p-3 text-primary text-xs">80.50 g</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formula Materials Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="material-symbols-outlined text-primary text-[18px]">inventory</span>
              Formula Materials Summary
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated per 100g</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Material Code</th>
                  <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Material Name</th>
                  <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-700">Batch QC</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MATERIALS.map((mat) => (
                  <tr key={mat.code}>
                    <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{mat.code}</td>
                    <td className="px-4 py-2 dark:text-slate-300">{mat.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium border border-green-200">
                        {mat.qc}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium dark:text-slate-200">{mat.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
