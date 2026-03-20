import { useState, useEffect } from 'react'
import { ROLES, TENANTS } from './data'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Pending']

const EMPTY_FORM = { name: '', email: '', role: 'Scientist', tenantId: 't1', status: 'Active' }

const INPUT_CLS = 'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white placeholder-slate-400'

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

export default function UserFormModal({ initialData, onSave, onClose }) {
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
    if (!form.name.trim())  e.name  = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
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
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>{isEdit ? 'edit' : 'person_add'}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit User' : 'Invite New User'}</h2>
              <p className="text-[11px] text-slate-400">{isEdit ? `Editing: ${initialData.name}` : 'Fill in user details'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <input type="text" placeholder="e.g. Ahmad Rasyid" value={form.name}
                  onChange={(e) => set('name', e.target.value)} className={INPUT_CLS} />
                {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
              </Field>
              <Field label="Email" required>
                <input type="email" placeholder="e.g. user@company.com" value={form.email}
                  onChange={(e) => set('email', e.target.value)} className={INPUT_CLS} />
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </Field>
            </div>

            {/* Role */}
            <Field label="Role" required>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const active = form.role === r
                  const colors = {
                    'Scientist':       active ? 'bg-sky-100 text-sky-700 border-sky-300'      : '',
                    'Operator':        active ? 'bg-amber-100 text-amber-700 border-amber-300' : '',
                    'Lab Coordinator': active ? 'bg-violet-100 text-violet-700 border-violet-300' : '',
                    'Manager':         active ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : '',
                  }
                  return (
                    <button type="button" key={r} onClick={() => set('role', r)}
                      className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold border transition-colors text-left ${
                        active ? colors[r] : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}>
                      {r}
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Tenant + Status */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tenant" required>
                <select value={form.tenantId} onChange={(e) => set('tenantId', e.target.value)} className={INPUT_CLS}>
                  {TENANTS.map((t) => <option key={t.id} value={t.id}>{t.tenantName} ({t.tenantCode})</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={INPUT_CLS}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/50">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{isEdit ? 'save' : 'person_add'}</span>
              {isEdit ? 'Save Changes' : 'Invite User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
