import { useState } from 'react'
import UsersTab from './user-management/UsersTab'
import TenancyTab from './user-management/TenancyTab'
import { USERS, TENANTS } from './user-management/data'

const TABS = [
  { key: 'users',   label: 'Users',   icon: 'group'          },
  { key: 'tenancy', label: 'Tenancy', icon: 'corporate_fare' },
]

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers]         = useState(USERS)
  const [tenants, setTenants]     = useState(TENANTS)

  const pendingTotal = users.filter((u) => u.status === 'Pending').length

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header ── */}
      <div className="px-8 pt-6 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>manage_accounts</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">User Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage users, roles, and tenant access control</p>
            </div>
          </div>

          {/* summary pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>group</span>
              <span className="text-xs font-semibold text-slate-700">{users.filter((u) => u.status === 'Active').length}</span>
              <span className="text-[11px] text-slate-400">active users</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>corporate_fare</span>
              <span className="text-xs font-semibold text-slate-700">{tenants.filter((t) => t.status === 'Active').length}</span>
              <span className="text-[11px] text-slate-400">tenants</span>
            </div>
            {pendingTotal > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '14px' }}>schedule</span>
                <span className="text-xs font-semibold text-amber-700">{pendingTotal}</span>
                <span className="text-[11px] text-amber-600">pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 border-b-2 flex items-center gap-1.5 text-xs transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{tab.icon}</span>
              {tab.label}
              {tab.key === 'tenancy' && pendingTotal > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">{pendingTotal}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'users' && (
        <UsersTab users={users} setUsers={setUsers} />
      )}
      {activeTab === 'tenancy' && (
        <TenancyTab tenants={tenants} setTenants={setTenants} users={users} setUsers={setUsers} />
      )}
    </div>
  )
}
