import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useLiveMatchEvents } from './hooks/useLiveEvents'
import { useLiveSimulator } from './hooks/useLiveSimulator'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { WorldCupProvider, useWorldCupData } from './context/WorldCupContext'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Groups from './pages/Groups'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import ForceInstallModal from './components/ForceInstallModal'
import NotificationSystem from './components/NotificationSystem'
import TeamSelector from './components/TeamSelector'

function AppInner() {
  const [favoriteTeam, setFavoriteTeam] = useLocalStorage('favorite_team', null)
  const [showSelector, setShowSelector] = useState(!favoriteTeam)
  const { apiMode, lastUpdated } = useWorldCupData()

  // ── Capture beforeinstallprompt ONCE at the top level ────────────────────
  // The event fires exactly once on page load. Calling the hook here ensures
  // it's captured before any child renders, then passed as props everywhere.
  const installState = useInstallPrompt()

  useLiveMatchEvents(favoriteTeam)
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
              {apiMode === 'live' && lastUpdated && (
                <span className="text-xs text-emerald-400 font-medium">
                  {lastUpdated.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString('ar-SA-u-nu-latn', { day: 'numeric', month: 'short' })}
              </span>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${apiMode === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                title={apiMode === 'live' ? 'بيانات حية' : 'وضع ثابت'}
              />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home favoriteTeam={favoriteTeam} installState={installState} />} />
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
                  apiMode={apiMode}
                  lastUpdated={lastUpdated}
                  installState={installState}
                />
              }
            />
          </Routes>
        </main>

        <BottomNav />
        <InstallPrompt installState={installState} />
        <ForceInstallModal installState={installState} />
        <NotificationSystem />
      </div>
    </HashRouter>
  )
}

export default function App() {
  return (
    <WorldCupProvider>
      <AppInner />
    </WorldCupProvider>
  )
}
