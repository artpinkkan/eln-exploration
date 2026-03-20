import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import RecipeProtocolPage from './pages/RecipeProtocolPage'
import ProjectListPage from './pages/ProjectListPage'
import ExperimentDashboard from './pages/ExperimentDashboard'
import MaterialMasterPage from './pages/system-config/MaterialMasterPage'
import InstrumentMasterPage from './pages/system-config/InstrumentMasterPage'
import MaterialBatchMasterPage from './pages/system-config/MaterialBatchMasterPage'
import InstrumentCodeMasterPage from './pages/system-config/InstrumentCodeMasterPage'
import ProductMasterPage from './pages/system-config/ProductMasterPage'
import UserManagementPage from './pages/UserManagementPage'
import AuditTrailPage from './pages/AuditTrailPage'

function AppLayout({ children }) {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex text-sm">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/projects" element={<AppLayout><ProjectListPage /></AppLayout>} />
        <Route path="/experiment" element={<AppLayout><ExperimentDashboard /></AppLayout>} />
        <Route path="/app" element={<AppLayout><RecipeProtocolPage /></AppLayout>} />
        <Route path="/config/material"    element={<AppLayout><MaterialMasterPage /></AppLayout>} />
        <Route path="/config/instrument"      element={<AppLayout><InstrumentMasterPage /></AppLayout>} />
        <Route path="/config/material-batch"   element={<AppLayout><MaterialBatchMasterPage /></AppLayout>} />
        <Route path="/config/instrument-code" element={<AppLayout><InstrumentCodeMasterPage /></AppLayout>} />
        <Route path="/config/product"         element={<AppLayout><ProductMasterPage /></AppLayout>} />
        <Route path="/user-management"        element={<AppLayout><UserManagementPage /></AppLayout>} />
        <Route path="/audit-trail"            element={<AppLayout><AuditTrailPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
