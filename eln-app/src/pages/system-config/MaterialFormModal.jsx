import { useState, useEffect } from 'react'

const TYPE_OPTIONS = ['MATERIAL', 'SAMPLE', 'REAGENT']

const UOM_OPTIONS = [
  'Milliliter (mL)',
  'Liter (L)',
  'Gram (g)',
  'Kilogram (kg)',
  'Milligram (mg)',
  'Microliter (µL)',
  'Microgram (µg)',
  'Mole (mol)',
  'Millimole (mmol)',
]

const EMPTY_FORM = {
  type:         'MATERIAL',
  materialCode: '',
  materialName: '',
  materialSub:  '',
  uomName:      'Gram (g)',
  density:      '',
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

/**
 * MaterialFormModal — Add / Edit modal for Material master data.
 *
 * Props:
 *   initialData {object|null}  — null = Add mode, object = Edit mode
 *   onSave      {fn(data)}     — called with the saved row object
 *   onClose     {fn}           — called to close without saving
 */
export default function MaterialFormModal({ initialData, onSave, onClose }) {
  const isEdit = initialData != null
  const [form, setForm]     = useState(isEdit ? { ...initialData } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  /* Reset form if initialData changes (e.g. opening different row) */
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
    if (!form.type)         errs.type         = 'Required'
    if (!form.materialCode.trim()) errs.materialCode = 'Required'
    if (!form.materialName.trim()) errs.materialName = 'Required'
    if (!form.uomName)      errs.uomName      = 'Required'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave({
      ...form,
      density: form.density.trim()
        ? form.density.trim().replace(/g\/cm[³3]?$/, '').trim() + ' g/cm³'
        : '—',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
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
                {isEdit ? 'Edit Material' : 'Add New Material'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ? `Editing: ${initialData.materialCode}` : 'Fill in the details below'}
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

            {/* Type */}
            <Field label="Type" required>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => set('type', t)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                      form.type === t
                        ? t === 'MATERIAL' ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : t === 'SAMPLE'   ? 'bg-sky-100 text-sky-700 border-sky-300'
                        :                    'bg-orange-100 text-orange-700 border-orange-300'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-[10px] text-red-500">{errors.type}</p>}
            </Field>

            {/* Code + Name */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Material Code" required>
                <input
                  type="text"
                  placeholder="e.g. MAT-ETH-282"
                  value={form.materialCode}
                  onChange={(e) => set('materialCode', e.target.value)}
                  className={INPUT_CLS}
                />
                {errors.materialCode && <p className="text-[10px] text-red-500">{errors.materialCode}</p>}
              </Field>
              <Field label="Material Name" required>
                <input
                  type="text"
                  placeholder="e.g. Ethanol Absolute"
                  value={form.materialName}
                  onChange={(e) => set('materialName', e.target.value)}
                  className={INPUT_CLS}
                />
                {errors.materialName && <p className="text-[10px] text-red-500">{errors.materialName}</p>}
              </Field>
            </div>

            {/* Grade / Description */}
            <Field label="Grade / Description">
              <input
                type="text"
                placeholder="e.g. Analytical Reagent Grade"
                value={form.materialSub}
                onChange={(e) => set('materialSub', e.target.value)}
                className={INPUT_CLS}
              />
            </Field>

            {/* UOM + Density */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="UOM Name" required>
                <select
                  value={form.uomName}
                  onChange={(e) => set('uomName', e.target.value)}
                  className={INPUT_CLS}
                >
                  {UOM_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.uomName && <p className="text-[10px] text-red-500">{errors.uomName}</p>}
              </Field>
              <Field label="Density (g/cm³)">
                <input
                  type="text"
                  placeholder="e.g. 0.789"
                  value={form.density}
                  onChange={(e) => set('density', e.target.value)}
                  className={INPUT_CLS}
                />
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
              {isEdit ? 'Save Changes' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
