/* ── Shared mock data for User Management ── */

export const TENANTS = [
  { id: 't1', tenantCode: 'DANKOS',  tenantName: 'Dankos Farma',          adminId: 1,  status: 'Active',   createdAt: '2023-01-10' },
  { id: 't2', tenantCode: 'KALBE',   tenantName: 'Kalbe Nutritional',      adminId: 5,  status: 'Active',   createdAt: '2023-03-22' },
  { id: 't3', tenantCode: 'SANBE',   tenantName: 'Sanbe Farma',            adminId: 9,  status: 'Active',   createdAt: '2023-06-01' },
  { id: 't4', tenantCode: 'HEXPHARM',tenantName: 'Hexpharm Jaya',          adminId: 12, status: 'Inactive', createdAt: '2024-01-15' },
]

export const ROLES = ['Scientist', 'Operator', 'Lab Coordinator', 'Manager']

export const USERS = [
  { id: 1,  name: 'Ahmad Rasyid',     email: 'a.rasyid@dankos.co.id',       role: 'Manager',         tenantId: 't1', status: 'Active',  lastActive: '2026-03-20' },
  { id: 2,  name: 'Siti Rahayu',      email: 's.rahayu@dankos.co.id',       role: 'Scientist',       tenantId: 't1', status: 'Active',  lastActive: '2026-03-19' },
  { id: 3,  name: 'Budi Santoso',     email: 'b.santoso@dankos.co.id',      role: 'Lab Coordinator', tenantId: 't1', status: 'Active',  lastActive: '2026-03-18' },
  { id: 4,  name: 'Dewi Kusuma',      email: 'd.kusuma@dankos.co.id',       role: 'Operator',        tenantId: 't1', status: 'Pending', lastActive: null          },
  { id: 5,  name: 'Elena Smith',      email: 'e.smith@kalbe.co.id',         role: 'Manager',         tenantId: 't2', status: 'Active',  lastActive: '2026-03-20' },
  { id: 6,  name: 'Marcus Lee',       email: 'm.lee@kalbe.co.id',           role: 'Scientist',       tenantId: 't2', status: 'Active',  lastActive: '2026-03-17' },
  { id: 7,  name: 'Priya Nair',       email: 'p.nair@kalbe.co.id',          role: 'Scientist',       tenantId: 't2', status: 'Active',  lastActive: '2026-03-15' },
  { id: 8,  name: 'Rizky Firmansyah', email: 'r.firmansyah@kalbe.co.id',    role: 'Operator',        tenantId: 't2', status: 'Pending', lastActive: null          },
  { id: 9,  name: 'Hendra Wijaya',    email: 'h.wijaya@sanbe.co.id',        role: 'Manager',         tenantId: 't3', status: 'Active',  lastActive: '2026-03-20' },
  { id: 10, name: 'Nurul Hidayah',    email: 'n.hidayah@sanbe.co.id',       role: 'Lab Coordinator', tenantId: 't3', status: 'Active',  lastActive: '2026-03-14' },
  { id: 11, name: 'Agus Prasetyo',    email: 'a.prasetyo@sanbe.co.id',      role: 'Operator',        tenantId: 't3', status: 'Inactive',lastActive: '2026-01-05' },
  { id: 12, name: 'Lisa Tanaka',      email: 'l.tanaka@hexpharm.co.id',     role: 'Manager',         tenantId: 't4', status: 'Active',  lastActive: '2026-02-28' },
  { id: 13, name: 'Fajar Nugroho',    email: 'f.nugroho@dankos.co.id',      role: 'Scientist',       tenantId: 't1', status: 'Pending', lastActive: null          },
  { id: 14, name: 'Yuni Astuti',      email: 'y.astuti@kalbe.co.id',        role: 'Lab Coordinator', tenantId: 't2', status: 'Pending', lastActive: null          },
]
