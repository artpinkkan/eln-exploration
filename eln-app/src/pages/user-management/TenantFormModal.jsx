import { useState, useEffect } from 'react'

const EMPTY_FORM = { tenantCode: '', tenantName: '', status: 'Active' }
const INPUT_CLS  = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white placeholder-slate-400'

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

export default function TenantFormModal({ initialData, onSave, onClose }) {
  const isEdit = initialData != null
  const [form, setForm]     = useState(isEdit ? { ...initialData } : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(isEdit ? { ...initialData } : { ...EMPTY_FORM })
    setErrors({})
  }, [initialData])

  function set(key, val) {
    setForm((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.tenantCode.trim()) e.tenantCode = 'Required'
    if (!form.tenantName.trim()) e.tenantName = 'Required'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...form, tenantCode: form.tenantCode.toUpperCase() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col">

        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>{isEdit ? 'edit' : 'add_circle'}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Tenant' : 'Add New Tenant'}</h2>
              <p className="text-[11px] text-slate-400">{isEdit ? `Editing: ${initialData.tenantCode}` : 'Register a new tenant organisation'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tenant Code" required>
                <input type="text" placeholder="e.g. DANKOS" value={form.tenantCode}
                  onChange={(e) => set('tenantCode', e.target.value.toUpperCase())} className={INPUT_CLS} />
                {errors.tenantCode && <p className="text-[10px] text-red-500">{errors.tenantCode}</p>}
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={INPUT_CLS}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </Field>
            </div>
            <Field label="Tenant Name" required>
              <input type="text" placeholder="e.g. Dankos Farma" value={form.tenantName}
                onChange={(e) => set('tenantName', e.target.value)} className={INPUT_CLS} />
              {errors.tenantName && <p className="text-[10px] text-red-500">{errors.tenantName}</p>}
            </Field>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-slate-400 shrink-0 mt-0.5" style={{ fontSize: '15px' }}>info</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                After creating the tenant, assign an admin from the <strong>Users</strong> tab. The tenant admin can then approve or reject users who apply to join this tenant.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{isEdit ? 'save' : 'add'}</span>
              {isEdit ? 'Save Changes' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
