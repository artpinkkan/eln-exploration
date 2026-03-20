import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import Sidebar from './components/Sidebar'
import RecipeProtocolPage from './pages/RecipeProtocolPage'
import ProjectListPage from './pages/ProjectListPage'
import ExperimentDashboard from './pages/ExperimentDashboard'

function AppLayout() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen flex text-sm">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <RecipeProtocolPage />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/experiment" element={<ExperimentDashboard />} />
        <Route path="/app" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
