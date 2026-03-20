import { useState, useEffect } from 'react'

const STATUS_OPTIONS = ['Active', 'Not Active']

const EMPTY_FORM = {
  instrumentName: '',
  brandType:      '',
  status:         'Active',
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white placeholder-slate-400'

export default function InstrumentFormModal({ initialData, onSave, onClose }) {
  const isEdit = initialData != null
  const [form, setForm]     = useState(isEdit ? { ...initialData } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(isEdit ? { ...initialData } : { ...EMPTY_FORM })
    setErrors({})
  }, [initialData])

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.instrumentName.trim()) errs.instrumentName = 'Required'
    if (!form.brandType.trim())      errs.brandType      = 'Required'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>
                {isEdit ? 'edit' : 'add_circle'}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isEdit ? 'Edit Instrument' : 'Add New Instrument'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ? `Editing: ${initialData.instrumentName}` : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">

            {/* Instrument Name */}
            <Field label="Instrument Name" required>
              <input
                type="text"
                placeholder="e.g. Analytical Balance AX224"
                value={form.instrumentName}
                onChange={(e) => set('instrumentName', e.target.value)}
                className={INPUT_CLS}
              />
              {errors.instrumentName && <p className="text-[10px] text-red-500">{errors.instrumentName}</p>}
            </Field>

            {/* Brand / Type */}
            <Field label="Brand / Type" required>
              <input
                type="text"
                placeholder="e.g. Shimadzu / UV-Vis Spectrophotometer"
                value={form.brandType}
                onChange={(e) => set('brandType', e.target.value)}
                className={INPUT_CLS}
              />
              {errors.brandType && <p className="text-[10px] text-red-500">{errors.brandType}</p>}
            </Field>

            {/* Status */}
            <Field label="Status" required>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => set('status', s)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      form.status === s
                        ? s === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {isEdit ? 'save' : 'add'}
              </span>
              {isEdit ? 'Save Changes' : 'Add Instrument'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
