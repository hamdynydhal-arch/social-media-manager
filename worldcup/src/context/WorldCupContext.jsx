import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import staticData from '../data/data.json'
import { fetchApiMatches, fetchApiStandings, IS_DEMO } from '../services/footballApi'

const WorldCupCtx = createContext(null)

export function WorldCupProvider({ children }) {
  const [data, setData] = useState(staticData)
  const [apiMode, setApiMode] = useState('loading') // 'loading' | 'live' | 'static'
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(async () => {
    if (IS_DEMO) {
      setApiMode('static')
      return
    }

    const [apiMatches, apiStandings] = await Promise.all([
      fetchApiMatches(),
      fetchApiStandings(),
    ])

    if (!apiMatches) {
      setApiMode('static')
      return
    }

    // Overlay live scores onto our rich static match records
    const mergedMatches = staticData.matches.map(sm => {
      const live = apiMatches.find(
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

    // Overlay live standings onto our rich static team records
    let mergedTeams = staticData.teams
    if (apiStandings?.length) {
      mergedTeams = staticData.teams.map(t => {
        const s = apiStandings.find(r => r.teamId === t.id)
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
            goal_diff: s.goal_diff,
            points: s.points,
          },
        }
      })
    }

    setData({ ...staticData, matches: mergedMatches, teams: mergedTeams })
    setApiMode('live')
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <WorldCupCtx.Provider value={{ data, apiMode, lastUpdated, refresh }}>
      {children}
    </WorldCupCtx.Provider>
  )
}

export function useWorldCupData() {
  const ctx = useContext(WorldCupCtx)
  if (!ctx) throw new Error('useWorldCupData must be inside WorldCupProvider')
  return ctx
}
