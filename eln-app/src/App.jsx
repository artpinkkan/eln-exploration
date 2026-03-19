import Sidebar from './components/Sidebar'
import RecipeProtocolPage from './pages/RecipeProtocolPage'

function App() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex text-sm">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <RecipeProtocolPage />
      </main>
    </div>
  )
}

export default App
