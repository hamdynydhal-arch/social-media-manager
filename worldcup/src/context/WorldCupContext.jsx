import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import staticData from '../data/data.json'
import { fetchEspnMatches, fetchEspnStandings, fetchRssNews } from '../services/openDataService'

const WorldCupCtx = createContext(null)

// ── Time-based live status (pure function, no side effects) ───────────────────
// Match times in data.json are UTC. Compare against device clock (also UTC internally).
function applyTimeBasedStatus(matches) {
  const now = new Date()
  return matches.map(match => {
    // Trust ESPN-sourced live/finished status if already set
    if (match.status === 'live' || match.status === 'finished') return match

    const start = new Date(`${match.date}T${match.time}:00Z`)
    const elapsed = (now - start) / 60000 // minutes since kickoff

    if (elapsed < 0) return match // not yet started

    if (elapsed >= 110) {
      return {
        ...match,
        status: 'finished',
        score_home: match.score_home ?? 0,
        score_away: match.score_away ?? 0,
      }
    }

    // Running minute: first half 0-45, halftime buffer 45-60, second half 60+
    let minute
    if (elapsed <= 45) {
      minute = `${Math.floor(elapsed)}'`
    } else if (elapsed <= 60) {
      minute = 'HT'
    } else {
      minute = `${Math.floor(45 + (elapsed - 60))}'`
    }

    return {
      ...match,
      status: 'live',
      minute,
      score_home: match.score_home ?? 0,
      score_away: match.score_away ?? 0,
    }
  })
}

// ── Inject breaking-news headlines for live matches ───────────────────────────
function buildBreakingNews(matches, teams) {
  return matches
    .filter(m => m.status === 'live')
    .map(m => {
      const home = teams.find(t => t.id === m.team_home)
      const away = teams.find(t => t.id === m.team_away)
      return `🔴 عاجل: ${home?.name ?? m.team_home} ${m.score_home}-${m.score_away} ${away?.name ?? m.team_away} — الدقيقة ${m.minute}`
    })
}

function mergeStandings(teams, espnStandings) {
  if (!espnStandings) return teams
  return teams.map(t => {
    const s = espnStandings.find(r => r.teamId === t.id)
    if (!s) return t
    return {
      ...t,
      stats: {
        ...t.stats,
        played: s.played, wins: s.wins, draws: s.draws, losses: s.losses,
        goals_for: s.goals_for, goals_against: s.goals_against, points: s.points,
      },
    }
  })
}

export function WorldCupProvider({ children }) {
  // Base layers mutated by ESPN API
  const [espnMatchOverrides, setEspnMatchOverrides] = useState(null)
  const [liveTeams, setLiveTeams] = useState(staticData.teams)
  const [liveNews, setLiveNews]   = useState(staticData.news)
  const [sources, setSources] = useState({ scores: false, standings: false, news: false })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [apiMode, setApiMode] = useState('loading')

  // Compute the full data snapshot from all layers
  const computeSnapshot = useCallback((espnMatches, teams, newsBase) => {
    const baseMatches = espnMatches
      ? staticData.matches.map(sm => {
          const live = espnMatches.find(
            am => am.team_home === sm.team_home && am.team_away === sm.team_away
          )
          if (!live) return sm
          return {
            ...sm,
            status: live.status,
            minute: live.minute ?? sm.minute,
            score_home: live.score_home ?? sm.score_home,
            score_away: live.score_away ?? sm.score_away,
          }
        })
      : staticData.matches

    // Apply time-based status on top of ESPN data
    const matches = applyTimeBasedStatus(baseMatches)

    // Prepend live match headlines to news
    const breaking = buildBreakingNews(matches, teams)
    const news = breaking.length > 0
      ? [...breaking, ...newsBase.filter(n => !n.startsWith('🔴 عاجل:'))]
      : newsBase

    return { matches, teams, news }
  }, [])

  const [snapshot, setSnapshot] = useState(() =>
    computeSnapshot(null, staticData.teams, staticData.news)
  )

  // ── Live API refresh ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const [espnMatches, espnStandings, rssNews] = await Promise.all([
      fetchEspnMatches(),
      fetchEspnStandings(),
      fetchRssNews(),
    ])

    const activeSources = { scores: !!espnMatches, standings: !!espnStandings, news: !!rssNews }
    setSources(activeSources)
    setApiMode(activeSources.scores || activeSources.standings || activeSources.news ? 'live' : 'static')

    const newTeams = mergeStandings(staticData.teams, espnStandings)
    const newNews  = rssNews ?? staticData.news

    setEspnMatchOverrides(espnMatches)
    setLiveTeams(newTeams)
    setLiveNews(newNews)
    setSnapshot(computeSnapshot(espnMatches, newTeams, newNews))

    if (activeSources.scores || activeSources.standings || activeSources.news) {
      setLastUpdated(new Date())
    }
  }, [computeSnapshot])

  // ── 30-second clock: recompute time-based minute without re-fetching API ──
  useEffect(() => {
    const tick = () => {
      setSnapshot(computeSnapshot(espnMatchOverrides, liveTeams, liveNews))
    }
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [computeSnapshot, espnMatchOverrides, liveTeams, liveNews])

  // ── Initial fetch + 60-second API refresh cycle ───────────────────────────
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const data = {
    matches:  snapshot.matches,
    teams:    snapshot.teams,
    news:     snapshot.news,
    stadiums: staticData.stadiums,
  }

  return (
    <WorldCupCtx.Provider value={{ data, apiMode, lastUpdated, sources, refresh }}>
      {children}
    </WorldCupCtx.Provider>
  )
}

export function useWorldCupData() {
  const ctx = useContext(WorldCupCtx)
  if (!ctx) throw new Error('useWorldCupData must be inside WorldCupProvider')
  return ctx
}
