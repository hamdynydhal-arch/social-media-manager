import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import staticData from '../data/data.json'
import { fetchEspnMatches, fetchEspnStandings, fetchRssNews } from '../services/openDataService'

const WorldCupCtx = createContext(null)

// ── Manual overrides for live matches where API data is delayed ───────────────
// kickoff_offset_min: actual kickoff was N minutes after scheduled time.
// This corrects the running minute counter to reflect real elapsed play time.
const LIVE_OVERRIDES = {
  M001: {
    score_home: 1,
    score_away: 0,
    kickoff_offset_min: 6, // actual whistle was at 19:06 UTC, not 19:00
    goals: [
      { team: 'MEX', player: 'هنري مارتين', minute: 17, type: 'عادي' },
    ],
  },
}

// Breaking news that is always shown (historical facts, not API-dependent)
const HARDCODED_NEWS = [
  '🔴 عاجل: انطلاق مباراة الافتتاح لبطولة كأس العالم 2026 — المكسيك أمام جنوب أفريقيا في أزتيكا!',
  '⚽ جوووول! المكسيك تفتتح التسجيل بالهدف الأول في الدقيقة 17 بقدم هنري مارتين!',
]

// ── Time-based live status ────────────────────────────────────────────────────
function applyTimeBasedStatus(matches) {
  const now = new Date()
  return matches.map(match => {
    // ESPN-sourced live/finished takes priority
    if (match.status === 'live' || match.status === 'finished') return match

    const override = LIVE_OVERRIDES[match.id]
    const scheduledStart = new Date(`${match.date}T${match.time}:00Z`)
    // If there's a known kickoff delay, shift the start time forward
    const actualStart = override?.kickoff_offset_min
      ? new Date(scheduledStart.getTime() + override.kickoff_offset_min * 60_000)
      : scheduledStart

    const elapsed = (now - actualStart) / 60_000 // minutes of actual play

    if (elapsed < 0) return match // not started yet

    if (elapsed >= 110) {
      return {
        ...match,
        status: 'finished',
        score_home: override?.score_home ?? match.score_home ?? 0,
        score_away: override?.score_away ?? match.score_away ?? 0,
        goals: override?.goals ?? match.goals,
      }
    }

    // Running minute (first half: 0-45; HT pause: 45-60; second half: 60+)
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
      score_home: override?.score_home ?? 0,
      score_away: override?.score_away ?? 0,
      goals: override?.goals ?? match.goals,
    }
  })
}

// ── Auto-generated breaking news from live matches ────────────────────────────
function buildAutoNews(matches, teams) {
  return matches
    .filter(m => m.status === 'live')
    .map(m => {
      const home = teams.find(t => t.id === m.team_home)
      const away = teams.find(t => t.id === m.team_away)
      return `🔴 مباشر: ${home?.name ?? m.team_home} ${m.score_home}-${m.score_away} ${away?.name ?? m.team_away} — الدقيقة ${m.minute}`
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

function buildNews(liveMatches, teams, rssItems) {
  const autoLive = buildAutoNews(liveMatches, teams)
  const base = rssItems ?? staticData.news
  // Prepend hardcoded breaking news + live match scores, then RSS
  return [
    ...HARDCODED_NEWS,
    ...autoLive.filter(n => !HARDCODED_NEWS.includes(n)),
    ...base,
  ]
}

export function WorldCupProvider({ children }) {
  const [espnOverrides, setEspnOverrides] = useState(null)
  const [liveTeams, setLiveTeams] = useState(staticData.teams)
  const [rssNews, setRssNews]     = useState(null)
  const [sources, setSources] = useState({ scores: false, standings: false, news: false })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [apiMode, setApiMode] = useState('loading')

  const computeData = useCallback((espnMatches, teams, rssItems) => {
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

    const matches = applyTimeBasedStatus(baseMatches)
    const news    = buildNews(matches, teams, rssItems)
    return { matches, teams, news, stadiums: staticData.stadiums }
  }, [])

  const [data, setData] = useState(() =>
    computeData(null, staticData.teams, null)
  )

  // ── Live API refresh ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const [espnMatches, espnStandings, fetchedNews] = await Promise.all([
      fetchEspnMatches(),
      fetchEspnStandings(),
      fetchRssNews(),
    ])

    const active = { scores: !!espnMatches, standings: !!espnStandings, news: !!fetchedNews }
    setSources(active)
    setApiMode(active.scores || active.standings || active.news ? 'live' : 'static')

    const newTeams = mergeStandings(staticData.teams, espnStandings)
    setEspnOverrides(espnMatches)
    setLiveTeams(newTeams)
    setRssNews(fetchedNews)
    setData(computeData(espnMatches, newTeams, fetchedNews))

    if (active.scores || active.standings || active.news) setLastUpdated(new Date())
  }, [computeData])

  // ── 30-second tick: keep minute counter live ──────────────────────────────
  useEffect(() => {
    const tick = () => setData(computeData(espnOverrides, liveTeams, rssNews))
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [computeData, espnOverrides, liveTeams, rssNews])

  // ── Initial fetch + 60-second cycle ──────────────────────────────────────
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
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
