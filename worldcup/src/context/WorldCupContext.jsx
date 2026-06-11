import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import staticData from '../data/data.json'
import { fetchEspnMatches, fetchEspnStandings, fetchRssNews } from '../services/openDataService'

const WorldCupCtx = createContext(null)

export function WorldCupProvider({ children }) {
  const [data, setData] = useState(staticData)
  const [apiMode, setApiMode] = useState('loading') // 'loading' | 'live' | 'static'
  const [lastUpdated, setLastUpdated] = useState(null)
  const [sources, setSources] = useState({ scores: false, standings: false, news: false })

  const refresh = useCallback(async () => {
    const [espnMatches, espnStandings, rssNews] = await Promise.all([
      fetchEspnMatches(),
      fetchEspnStandings(),
      fetchRssNews(),
    ])

    const activeSources = {
      scores: !!espnMatches,
      standings: !!espnStandings,
      news: !!rssNews,
    }
    setSources(activeSources)

    const anyLive = activeSources.scores || activeSources.standings || activeSources.news
    setApiMode(anyLive ? 'live' : 'static')

    // ── Merge ESPN live scores onto our rich static match records ──────────
    const mergedMatches = espnMatches
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

    // ── Merge ESPN standings onto our rich team records ────────────────────
    const mergedTeams = espnStandings
      ? staticData.teams.map(t => {
          const s = espnStandings.find(r => r.teamId === t.id)
          if (!s) return t
          return {
            ...t,
            stats: {
              ...t.stats,
              played: s.played,
              wins: s.wins,
              draws: s.draws,
              losses: s.losses,
              goals_for: s.goals_for,
              goals_against: s.goals_against,
              points: s.points,
            },
          }
        })
      : staticData.teams

    // ── Replace static news with live RSS items when available ─────────────
    const mergedNews = rssNews ?? staticData.news

    setData({
      ...staticData,
      matches: mergedMatches,
      teams: mergedTeams,
      news: mergedNews,
    })

    if (anyLive) setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

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
