import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useLiveMatchEvents, useGoalDetection } from './hooks/useLiveEvents'
import { useLiveSimulator } from './hooks/useLiveSimulator'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { WorldCupProvider, useWorldCupData } from './context/WorldCupContext'
import { playWhistleSound } from './utils/audioUtils'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Groups from './pages/Groups'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import ForceInstallModal from './components/ForceInstallModal'
import NotificationSystem from './components/NotificationSystem'
import BreakingNewsBanner from './components/BreakingNewsBanner'
import TeamSelector from './components/TeamSelector'

function AppInner() {
  // favoriteTeams: null = never configured, [] = watching all, [...] = specific teams
  const [favoriteTeams, setFavoriteTeams] = useLocalStorage('favorite_teams', null)
  const [showSelector, setShowSelector] = useState(favoriteTeams === null)
  const { data, apiMode, lastUpdated } = useWorldCupData()

  // Live clock — updates every second so date+time are always current
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const installState = useInstallPrompt()

  useLiveMatchEvents(favoriteTeams ?? [])
  useGoalDetection(data.matches, favoriteTeams ?? [])

  // Keep SW informed of favorite teams for background score checks
  useEffect(() => {
    const send = () => {
      if (!navigator.serviceWorker?.controller) return
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_FAVORITES',
        favorites: favoriteTeams ?? [],
      })
    }
    send()
    // Retry once SW controller becomes available
    const onControllerChange = () => send()
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)
    return () => navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
  }, [favoriteTeams])

  // Register Periodic Background Sync (Android Chrome + installed PWA)
  useEffect(() => {
    const register = async () => {
      if (!('serviceWorker' in navigator)) return
      try {
        const reg = await navigator.serviceWorker.ready
        if (!('periodicSync' in reg)) return
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
        if (status.state === 'granted') {
          await reg.periodicSync.register('wc-live-check', { minInterval: 5 * 60 * 1000 })
        }
      } catch { /* not supported — silently skip */ }
    }
    register()
  }, [])
  const { running: simRunning, startSim, stopSim } = useLiveSimulator(favoriteTeams?.[0] ?? null)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Listen for SW→page audio trigger (fired when SW shows a background notification)
  useEffect(() => {
    const onSwMsg = (e) => {
      if (e.data?.type === 'PLAY_WHISTLE') playWhistleSound()
    }
    navigator.serviceWorker?.addEventListener('message', onSwMsg)
    return () => navigator.serviceWorker?.removeEventListener('message', onSwMsg)
  }, [])

  const handleTeamSelect = (teams) => {
    setFavoriteTeams(teams)
    setShowSelector(false)
  }

  if (showSelector) {
    return (
      <TeamSelector
        onSelect={handleTeamSelect}
        initialSelected={favoriteTeams ?? []}
      />
    )
  }

  return (
    <HashRouter>
      <div className="min-h-dvh bg-slate-950 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/80 safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-2xl">🏆</span>
              <div>
                <h1 className="text-base font-black text-white leading-tight">كأس العالم 2026</h1>
                <p className="text-xs text-slate-500 leading-none">FIFA World Cup</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-slate-400 leading-none">
                  {now.toLocaleDateString('ar-SA-u-nu-latn', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs text-emerald-400 font-medium tabular-nums leading-none">
                  {now.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div
                className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                title={apiMode === 'live' ? 'بيانات حية' : 'وضع محلي — جاهز للاتصال'}
              />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home favoriteTeams={favoriteTeams ?? []} installState={installState} />} />
            <Route path="/matches" element={<Matches favoriteTeams={favoriteTeams ?? []} />} />
            <Route path="/groups" element={<Groups favoriteTeams={favoriteTeams ?? []} />} />
            <Route
              path="/settings"
              element={
                <Settings
                  favoriteTeams={favoriteTeams ?? []}
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
        <BreakingNewsBanner news={data.news} />
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
