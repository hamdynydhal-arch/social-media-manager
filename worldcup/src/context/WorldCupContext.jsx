import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import staticData from '../data/data.json'
import { fetchEspnMatches, fetchEspnStandings, fetchRssNews } from '../services/openDataService'
import { syncClock, serverNow } from '../utils/clockSync'

const WorldCupCtx = createContext(null)

// ── Manual overrides for live matches where API data is delayed ───────────────
const LIVE_OVERRIDES = {
  M001: {
    score_home: 2,
    score_away: 0,
    kickoff_offset_min: 6,
    goals: [
      { team: 'MEX', player: 'خوليان كيمايونيس', minute: 9,  type: 'عادي' },
      { team: 'MEX', player: 'راؤول خيمينيز',    minute: 67, type: 'عادي' },
    ],
  },
}

// ── Breaking news (always shown, historical facts) ────────────────────────────
const HARDCODED_NEWS = [
  '🏆 نهائية: المكسيك 2-0 جنوب أفريقيا — انتصار تاريخي في مباراة افتتاح مونديال 2026!',
  '⚽ خوليان كيمايونيس يسجل أول هدف في تاريخ مونديال 2026 في الدقيقة 9',
  '⚽ راؤول خيمينيز يضاعف التقدم برأسية في الدقيقة 67 من تمريرة ألفارادو',
  '🟥 ثلاث بطاقات حمراء: سيتولي (RSA) 49 ـ ، وزواني (RSA) 84 ـ ، ومونتيس (MEX) 90+2',
]

// ── Cross-validation cache ─────────────────────────────────────────────────────
// Persists API-confirmed match states in localStorage so that when the API is
// temporarily unavailable, we keep showing the last known live/finished result
// instead of falling back to stale "scheduled" from data.json.
const CV_KEY = 'wc-cv-states'

function loadCvCache() {
  try { return JSON.parse(localStorage.getItem(CV_KEY) ?? '{}') } catch { return {} }
}

function saveCvCache(matches) {
  const states = {}
  for (const m of matches) {
    if (m.status === 'live' || m.status === 'finished') {
      states[`${m.team_home}_${m.team_away}`] = {
        status:     m.status,
        score_home: m.score_home,
        score_away: m.score_away,
        minute:     m.minute ?? null,
        goals:      m.goals  ?? [],
      }
    }
  }
  try { localStorage.setItem(CV_KEY, JSON.stringify(states)) } catch {}
}

// ── Dynamic standings from match results (primary source) ─────────────────────
function calculateGroupStandings(matches, teams) {
  const standings = {}
  for (const team of teams) {
    standings[team.id] = {
      played: 0, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, points: 0,
    }
  }
  for (const match of matches) {
    if (match.status !== 'finished') continue
    if (match.score_home == null || match.score_away == null) continue
    const h = standings[match.team_home]
    const a = standings[match.team_away]
    if (!h || !a) continue
    const sh = Number(match.score_home)
    const sa = Number(match.score_away)
    h.played++; a.played++
    h.goals_for  += sh; h.goals_against += sa
    a.goals_for  += sa; a.goals_against += sh
    if      (sh > sa) { h.wins++;  h.points += 3; a.losses++ }
    else if (sa > sh) { a.wins++;  a.points += 3; h.losses++ }
    else              { h.draws++; h.points++;     a.draws++; a.points++ }
  }
  return teams.map(team => ({
    ...team,
    stats: { ...team.stats, ...standings[team.id] },
  }))
}

// ── Merge ESPN standings when available (overrides calculated values) ─────────
function mergeEspnStandings(teams, espnStandings) {
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

// ── Auto-generate events timeline from goals when no manual events exist ─────
function buildAutoEvents(match) {
  if (match.events?.length > 0) return match
  if (!match.goals?.length) return match

  const goals = [...match.goals].sort((a, b) => a.minute - b.minute)
  const htGoals = goals.filter(g => g.minute <= 45)
  const stGoals = goals.filter(g => g.minute > 45)
  const htHome = htGoals.filter(g => g.team === match.team_home).length
  const htAway = htGoals.filter(g => g.team === match.team_away).length

  return {
    ...match,
    events: [
      { type: 'kickoff',  minute: 0,  detail: 'انطلاق المباراة' },
      ...htGoals.map(g => ({
        type: 'goal', team: g.team, player: g.player, minute: g.minute,
        detail: g.assist ? `تمريرة: ${g.assist}` : '',
      })),
      { type: 'halftime', minute: 45, detail: `نهاية الشوط الأول — ${htHome}-${htAway}` },
      { type: 'kickoff2', minute: 46, detail: 'بداية الشوط الثاني' },
      ...stGoals.map(g => ({
        type: 'goal', team: g.team, player: g.player, minute: g.minute,
        detail: g.assist ? `تمريرة: ${g.assist}` : '',
      })),
      ...(match.status === 'finished' ? [{
        type: 'fulltime', minute: 94,
        detail: `نهاية المباراة — ${match.score_home}-${match.score_away}`,
      }] : []),
    ],
  }
}

// ── Time-based live status ────────────────────────────────────────────────────
// Uses server-corrected time (serverNow) to be immune to device clock drift.
// Only simulates lifecycle for matches with a confirmed LIVE_OVERRIDE entry;
// all other "scheduled" matches keep their data.json / API status unchanged.
function applyTimeBasedStatus(matches) {
  const now = new Date(serverNow())
  return matches.map(match => {
    if (match.status === 'live' || match.status === 'finished') return match

    const override = LIVE_OVERRIDES[match.id]
    if (!override) return match

    const scheduledStart = new Date(`${match.date}T${match.time}:00Z`)
    const actualStart = override.kickoff_offset_min
      ? new Date(scheduledStart.getTime() + override.kickoff_offset_min * 60_000)
      : scheduledStart

    const elapsed = (now - actualStart) / 60_000
    if (elapsed < 0) return match

    if (elapsed >= 110) {
      return {
        ...match,
        status: 'finished',
        score_home: override.score_home ?? match.score_home ?? 0,
        score_away: override.score_away ?? match.score_away ?? 0,
        goals: override.goals ?? match.goals,
      }
    }

    let minute
    if      (elapsed <= 45) minute = `${Math.floor(elapsed)}'`
    else if (elapsed <= 60) minute = 'HT'
    else                    minute = `${Math.floor(45 + (elapsed - 60))}'`

    return {
      ...match,
      status: 'live',
      minute,
      score_home: override.score_home ?? match.score_home,
      score_away: override.score_away ?? match.score_away,
      goals: override.goals ?? match.goals,
    }
  })
}

// ── Cross-validation merge ────────────────────────────────────────────────────
// If the live API confirms a match is live/finished but data.json still says
// "scheduled", the cache immediately overrides — critical for wrong-date entries.
function applyCrossValidation(matches, cvCache) {
  if (!Object.keys(cvCache).length) return matches
  return matches.map(m => {
    if (m.status === 'live' || m.status === 'finished') return m
    const key = `${m.team_home}_${m.team_away}`
    const cached = cvCache[key]
    if (!cached) return m
    return {
      ...m,
      status:     cached.status,
      score_home: cached.score_home,
      score_away: cached.score_away,
      minute:     cached.minute,
      goals:      cached.goals?.length > 0 ? cached.goals : (m.goals ?? []),
    }
  })
}

// ── Auto news from live matches ───────────────────────────────────────────────
function buildAutoNews(matches, teams) {
  return matches
    .filter(m => m.status === 'live')
    .map(m => {
      const home = teams.find(t => t.id === m.team_home)
      const away = teams.find(t => t.id === m.team_away)
      return `🔴 مباشر: ${home?.name ?? m.team_home} ${m.score_home}-${m.score_away} ${away?.name ?? m.team_away} — الدقيقة ${m.minute}`
    })
}

function buildResultsNews(matches, teams) {
  return matches
    .filter(m => m.status === 'finished' && m.score_home != null)
    .map(m => {
      const home = teams.find(t => t.id === m.team_home)?.name ?? m.team_home
      const away = teams.find(t => t.id === m.team_away)?.name ?? m.team_away
      return `📋 نهائي: ${home} ${m.score_home}-${m.score_away} ${away}`
    })
}

function buildNews(matches, teams, rssItems) {
  const liveNews   = buildAutoNews(matches, teams)
  const resultNews = buildResultsNews(matches, teams)
  const base       = rssItems ?? staticData.news
  const combined   = [
    ...HARDCODED_NEWS,
    ...liveNews.filter(n => !HARDCODED_NEWS.includes(n)),
    ...resultNews.filter(n => !HARDCODED_NEWS.some(h => h.includes(n.split(': ')[1] ?? ''))),
    ...base,
  ]
  return [...new Set(combined)]
}

export function WorldCupProvider({ children }) {
  const [espnOverrides,  setEspnOverrides]  = useState(null)
  const [espnStandings,  setEspnStandings]  = useState(null)
  const [rssNews,        setRssNews]        = useState(null)
  const [sources,        setSources]        = useState({ scores: false, standings: false, news: false })
  const [lastUpdated,    setLastUpdated]    = useState(null)
  const [apiMode,        setApiMode]        = useState('loading')
  const cvCacheRef = useRef(loadCvCache())

  // computeData: derive all display data from current state
  const computeData = useCallback((espnMatches, curEspnStandings, rssItems) => {
    const baseMatches = espnMatches
      ? staticData.matches.map(sm => {
          const live = espnMatches.find(
            am => am.team_home === sm.team_home && am.team_away === sm.team_away
          )
          if (!live) return sm
          return {
            ...sm,
            status:     live.status,
            minute:     live.minute     ?? sm.minute,
            score_home: live.score_home ?? sm.score_home,
            score_away: live.score_away ?? sm.score_away,
            goals: sm.goals?.length > 0 ? sm.goals : (live.goals ?? sm.goals ?? []),
          }
        })
      : staticData.matches

    // Cross-validation: override stale "scheduled" entries with cached live/finished data
    const cvMatches = applyCrossValidation(baseMatches, cvCacheRef.current)

    const matches = applyTimeBasedStatus(cvMatches).map(buildAutoEvents)

    // Persist any newly confirmed live/finished states to the CV cache
    saveCvCache(matches)
    cvCacheRef.current = loadCvCache()

    let teams = calculateGroupStandings(matches, staticData.teams)
    if (curEspnStandings) teams = mergeEspnStandings(teams, curEspnStandings)

    const news = buildNews(matches, teams, rssItems)
    return { matches, teams, news, stadiums: staticData.stadiums }
  }, [])

  const [data, setData] = useState(() => computeData(null, null, null))

  // ── Global API refresh (120 s) ────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const [espnMatches, newEspnStandings, fetchedNews] = await Promise.all([
      fetchEspnMatches(),
      fetchEspnStandings(),
      fetchRssNews(),
    ])

    const active = { scores: !!espnMatches, standings: !!newEspnStandings, news: !!fetchedNews }
    setSources(active)
    setApiMode(active.scores || active.standings || active.news ? 'live' : 'local')

    setEspnOverrides(espnMatches)
    setEspnStandings(newEspnStandings)
    setRssNews(fetchedNews)
    setData(computeData(espnMatches, newEspnStandings, fetchedNews))
    setLastUpdated(new Date())
  }, [computeData])

  // ── 30-second tick: recompute live minutes (no API call) ──────────────────
  useEffect(() => {
    const tick = () => setData(computeData(espnOverrides, espnStandings, rssNews))
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [computeData, espnOverrides, espnStandings, rssNews])

  // ── Initial clock sync + load + 120-second API cycle ─────────────────────
  useEffect(() => {
    syncClock().then(() => refresh())              // sync server time before first refresh
    const id = setInterval(refresh, 120_000)      // global 2-minute polling
    return () => clearInterval(id)
  }, [refresh])

  // ── Self-correction: refresh immediately when app regains focus ───────────
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
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
