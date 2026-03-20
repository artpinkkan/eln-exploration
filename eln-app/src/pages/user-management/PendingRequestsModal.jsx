import { ROLE_BADGE } from './UsersTab'

export default function PendingRequestsModal({ tenant, pendingUsers, onApprove, onReject, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '16px' }}>pending_actions</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pending Join Requests</h2>
              <p className="text-[11px] text-slate-400">
                {tenant.tenantName} <span className="font-semibold text-slate-500">({tenant.tenantCode})</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-3">
          {pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>check_circle</span>
              <p className="text-xs">No pending requests for this tenant.</p>
            </div>
          ) : (
            pendingUsers.map((user) => {
              const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              const badge = ROLE_BADGE[user.role]
              return (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge}`}>
                      {user.role}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onApprove(user.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(user.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-500 rounded-lg text-[10px] font-semibold hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                      Reject
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <p className="text-[11px] text-slate-400">
            {pendingUsers.length} pending request{pendingUsers.length !== 1 ? 's' : ''}
          </p>
          <button onClick={onClose} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
