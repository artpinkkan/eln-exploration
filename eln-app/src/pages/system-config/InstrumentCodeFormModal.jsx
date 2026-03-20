import { useState, useEffect } from 'react'

const EMPTY_FORM = {
  instrumentCode:      '',
  instrumentName:      '',
  brand:               '',
  calibrationDueDate:  '',
  requalificationDate: '',
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

export default function InstrumentCodeFormModal({ initialData, onSave, onClose }) {
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
    if (!form.instrumentCode.trim()) errs.instrumentCode = 'Required'
    if (!form.instrumentName.trim()) errs.instrumentName = 'Required'
    if (!form.brand.trim())          errs.brand          = 'Required'
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

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">

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
                {isEdit ? 'Edit Instrument Code' : 'Add New Instrument Code'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ? `Editing: ${initialData.instrumentCode}` : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">

            {/* Instrument Code + Brand */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instrument Code" required>
                <input
                  type="text"
                  placeholder="e.g. VOR001"
                  value={form.instrumentCode}
                  onChange={(e) => set('instrumentCode', e.target.value.toUpperCase())}
                  className={INPUT_CLS}
                />
                {errors.instrumentCode && <p className="text-[10px] text-red-500">{errors.instrumentCode}</p>}
              </Field>
              <Field label="Brand" required>
                <input
                  type="text"
                  placeholder="e.g. Shimadzu"
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  className={INPUT_CLS}
                />
                {errors.brand && <p className="text-[10px] text-red-500">{errors.brand}</p>}
              </Field>
            </div>

            {/* Instrument Name */}
            <Field label="Instrument Name" required>
              <input
                type="text"
                placeholder="e.g. High Performance Liquid Chromatograph"
                value={form.instrumentName}
                onChange={(e) => set('instrumentName', e.target.value)}
                className={INPUT_CLS}
              />
              {errors.instrumentName && <p className="text-[10px] text-red-500">{errors.instrumentName}</p>}
            </Field>

            {/* Calibration Due Date + Requalification Date */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Calibration Due Date">
                <input
                  type="date"
                  value={form.calibrationDueDate}
                  onChange={(e) => set('calibrationDueDate', e.target.value)}
                  className={INPUT_CLS}
                />
                <p className="text-[10px] text-slate-400">Determines compliant / warning / expired status</p>
              </Field>
              <Field label="Requalification Date">
                <input
                  type="date"
                  value={form.requalificationDate}
                  onChange={(e) => set('requalificationDate', e.target.value)}
                  className={INPUT_CLS}
                />
                <p className="text-[10px] text-slate-400">Optional</p>
              </Field>
            </div>

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
              {isEdit ? 'Save Changes' : 'Add Instrument Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
