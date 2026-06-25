import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import DailyRoutine from './pages/DailyRoutine'
import Performance from './pages/Performance'
import StateMonitor from './pages/StateMonitor'
import Guidance from './pages/Guidance'
import { useEffect } from 'react'

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('sirat-dark', false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/routine"     element={<DailyRoutine />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/state"       element={<StateMonitor />} />
            <Route path="/guidance"    element={<Guidance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
