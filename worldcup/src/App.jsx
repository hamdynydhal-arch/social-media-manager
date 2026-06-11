import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useLiveMatchEvents } from './hooks/useLiveEvents'
import { useLiveSimulator } from './hooks/useLiveSimulator'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Groups from './pages/Groups'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import NotificationSystem from './components/NotificationSystem'
import TeamSelector from './components/TeamSelector'

export default function App() {
  const [favoriteTeam, setFavoriteTeam] = useLocalStorage('favorite_team', null)
  const [showSelector, setShowSelector] = useState(!favoriteTeam)

  // Live match events engine (real schedule-based alerts)
  useLiveMatchEvents(favoriteTeam)

  // Live simulator (for testing, returns controls)
  const { running: simRunning, startSim, stopSim } = useLiveSimulator(favoriteTeam)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const handleTeamSelect = (teamId) => {
    setFavoriteTeam(teamId)
    setShowSelector(false)
  }

  if (showSelector) {
    return <TeamSelector onSelect={handleTeamSelect} />
  }

  return (
    <HashRouter>
      <div className="min-h-dvh bg-slate-950 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/80 safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <h1 className="text-base font-black text-white leading-tight">كأس العالم 2026</h1>
                <p className="text-xs text-slate-500 leading-none">FIFA World Cup</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="مباشر" />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home favoriteTeam={favoriteTeam} />} />
            <Route path="/matches" element={<Matches favoriteTeam={favoriteTeam} />} />
            <Route path="/groups" element={<Groups favoriteTeam={favoriteTeam} />} />
            <Route
              path="/settings"
              element={
                <Settings
                  favoriteTeam={favoriteTeam}
                  onChangeFavorite={() => setShowSelector(true)}
                  simRunning={simRunning}
                  onStartSim={startSim}
                  onStopSim={stopSim}
                />
              }
            />
          </Routes>
        </main>

        <BottomNav />
        <InstallPrompt />
        <NotificationSystem />
      </div>
    </HashRouter>
  )
}
