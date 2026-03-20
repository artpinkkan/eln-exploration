import { useState } from 'react'

export default function ProductFormModal({ initialData, onSave, onClose }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    productName: initialData?.productName ?? '',
    status:      initialData?.status      ?? 'Active',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.productName.trim()) e.productName = 'Product name is required'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({ ...form, productName: form.productName.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>inventory_2</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-[11px] text-slate-400">{isEdit ? 'Update product details' : 'Fill in the product information'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-3">

            {/* Product Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Neuro-Regen Formula"
                value={form.productName}
                onChange={(e) => { setForm((f) => ({ ...f, productName: e.target.value })); setErrors((err) => ({ ...err, productName: '' })) }}
                className={`w-full text-xs px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400 ${errors.productName ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.productName && <p className="text-[10px] text-red-500">{errors.productName}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <div className="flex gap-2">
                {['Active', 'Inactive'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, status: s }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      form.status === s
                        ? s === 'Active'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-500 text-white border-slate-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
