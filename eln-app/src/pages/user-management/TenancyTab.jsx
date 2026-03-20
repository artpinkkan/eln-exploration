import { useState } from 'react'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal'
import TenantFormModal from './TenantFormModal'
import PendingRequestsModal from './PendingRequestsModal'

const STATUS_BADGE = {
  Active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100   text-slate-500   border-slate-200',
}

export default function TenancyTab({ tenants, setTenants, users, setUsers }) {
  const [search, setSearch]         = useState('')
  const [formOpen, setFormOpen]     = useState(false)
  const [editRow, setEditRow]       = useState(null)
  const [deleteRow, setDeleteRow]   = useState(null)
  const [requestsTenant, setRequestsTenant] = useState(null)
  const [nextId, setNextId]         = useState(tenants.length + 10)

  const filtered = tenants.filter((t) =>
    t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
    t.tenantCode.toLowerCase().includes(search.toLowerCase())
  )

  function getMembersCount(tenantId) {
    return users.filter((u) => u.tenantId === tenantId && u.status !== 'Pending').length
  }
  function getPendingCount(tenantId) {
    return users.filter((u) => u.tenantId === tenantId && u.status === 'Pending').length
  }
  function getAdmin(adminId) {
    return users.find((u) => u.id === adminId)
  }

  function handleSave(formData) {
    if (editRow) {
      setTenants((p) => p.map((t) => t.id === editRow.id ? { ...t, ...formData } : t))
    } else {
      const id = `t${nextId}`
      setTenants((p) => [...p, { ...formData, id, adminId: null, createdAt: new Date().toISOString().slice(0, 10) }])
      setNextId((n) => n + 1)
    }
    setFormOpen(false); setEditRow(null)
  }

  function handleApprove(userId) {
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, status: 'Active', lastActive: new Date().toISOString().slice(0, 10) } : u))
  }
  function handleReject(userId) {
    setUsers((p) => p.filter((u) => u.id !== userId))
  }

  const pendingForTenant = requestsTenant
    ? users.filter((u) => u.tenantId === requestsTenant.id && u.status === 'Pending')
    : []

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* toolbar */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '15px' }}>search</span>
          <input
            type="text" placeholder="Search tenants…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 placeholder-slate-400"
          />
        </div>
        <button
          onClick={() => { setEditRow(null); setFormOpen(true) }}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
          Add Tenant
        </button>
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto custom-scrollbar px-6 py-4">

        {/* info banner */}
        <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl">
          <span className="material-symbols-outlined text-sky-500 shrink-0 mt-0.5" style={{ fontSize: '16px' }}>shield_lock</span>
          <p className="text-[11px] text-sky-700 leading-relaxed">
            <span className="font-bold">Tenant isolation is enforced.</span> Users can only view and access projects within their assigned tenant. Each tenant has a dedicated admin who approves or rejects join requests.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-20 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-44">Tenant Admin</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 text-center">Members</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-28">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-32">Created</th>
                <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-center">Join Requests</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No tenants found.</td></tr>
              ) : filtered.map((t, idx) => {
                const admin        = getAdmin(t.adminId)
                const memberCount  = getMembersCount(t.id)
                const pendingCount = getPendingCount(t.id)
                const [y, m, d]    = (t.createdAt || '').split('-')
                const dateDisplay  = t.createdAt ? `${d}-${m}-${y}` : '—'

                return (
                  <tr key={t.id} className={`border-b border-slate-100 last:border-0 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-primary/5`}>
                    {/* Actions */}
                    <td className="w-20 px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditRow(t); setFormOpen(true) }} title="Edit" className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                        </button>
                        <button onClick={() => setDeleteRow(t)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        </button>
                      </div>
                    </td>
                    {/* Tenant */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-primary">{t.tenantCode.slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{t.tenantCode}</p>
                          <p className="text-[10px] text-slate-400">{t.tenantName}</p>
                        </div>
                      </div>
                    </td>
                    {/* Admin */}
                    <td className="px-4 py-2.5">
                      {admin ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{admin.email}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                          No admin assigned
                        </span>
                      )}
                    </td>
                    {/* Members */}
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-xs font-bold text-slate-700">{memberCount}</span>
                      <span className="text-[10px] text-slate-400 ml-1">users</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_BADGE[t.status] ?? ''}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>{t.status === 'Active' ? 'check_circle' : 'cancel'}</span>
                        {t.status}
                      </span>
                    </td>
                    {/* Created */}
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-slate-500">{dateDisplay}</span>
                    </td>
                    {/* Join Requests */}
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => setRequestsTenant(t)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                          pendingCount > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>pending_actions</span>
                        {pendingCount > 0 ? `${pendingCount} Pending` : 'View'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && <TenantFormModal initialData={editRow} onSave={handleSave} onClose={() => { setFormOpen(false); setEditRow(null) }} />}
      {deleteRow && (
        <ConfirmDeleteModal
          title="Delete Tenant"
          message={`Are you sure you want to delete tenant "${deleteRow.tenantCode} — ${deleteRow.tenantName}"? All associated user assignments will be affected.`}
          onConfirm={() => { setTenants((p) => p.filter((t) => t.id !== deleteRow.id)); setDeleteRow(null) }}
          onCancel={() => setDeleteRow(null)}
        />
      )}
      {requestsTenant && (
        <PendingRequestsModal
          tenant={requestsTenant}
          pendingUsers={pendingForTenant}
          onApprove={(id) => handleApprove(id)}
          onReject={(id) => handleReject(id)}
          onClose={() => setRequestsTenant(null)}
        />
      )}
    </div>
  )
}
