import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import staticData from '../data/data.json'
import { fetchEspnMatches, fetchEspnStandings, fetchRssNews, fetchMatchDetails } from '../services/openDataService'
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

// ── Breaking news — confirmed real results from openfootball API ──────────────
// Each entry carries the timestamp of the match's final whistle (UTC).
// Items older than 24 h are suppressed by buildNews().
const HARDCODED_NEWS = [
  // M001 MEX 2-0 RSA (Jun 11, KO 19:00 UTC → end ~21:30)
  { text: '🏆 النتيجة النهائية: المكسيك 2-0 جنوب أفريقيا — مباراة الافتتاح | مونديال 2026', timestamp: '2026-06-11T21:30:00Z' },
  { text: '⚽ خوليان كيمايونيس يسجل أول أهداف مونديال 2026 — الدقيقة 9 (MEX)',   timestamp: '2026-06-11T21:30:00Z' },
  { text: '⚽ راؤول خيمينيز يضاعف بهدف الدقيقة 67 (MEX)',                         timestamp: '2026-06-11T21:30:00Z' },
  // M002 KOR 2-1 CZE (Jun 12, KO 02:00 UTC → end ~04:30)
  { text: '🏆 النتيجة النهائية: كوريا الجنوبية 2-1 التشيك — كريجتشي 59، هوانغ 67، أوه 80',  timestamp: '2026-06-12T04:30:00Z' },
  // M007 CAN 1-1 BIH (Jun 12, KO 19:00 UTC → end ~21:30)
  { text: '🏆 النتيجة النهائية: كندا 1-1 البوسنة — لوكيتش 21، لارين 78',                    timestamp: '2026-06-12T21:30:00Z' },
  // M019 USA 4-1 PAR (Jun 13, KO 01:00 UTC → end ~03:30)
  { text: '🏆 النتيجة النهائية: الولايات المتحدة 4-1 باراغواي — بالوغان 31 و45+، رينا 90+', timestamp: '2026-06-13T03:30:00Z' },
]

// ── Match details cache (stats + lineups from ESPN summary) ───────────────────
// Keyed by "${team_home}_${team_away}". Persisted in localStorage so successful
// fetches survive page reloads even when ESPN is temporarily unreachable.
const MD_KEY = 'wc-match-details-v1'

function loadMdCache() {
  try { return JSON.parse(localStorage.getItem(MD_KEY) ?? '{}') } catch { return {} }
}

function saveMdCache(cache) {
  try { localStorage.setItem(MD_KEY, JSON.stringify(cache)) } catch {}
}

// ── Cross-validation cache ─────────────────────────────────────────────────────
// Persists API-confirmed match states in localStorage so that when the API is
// temporarily unavailable, we keep showing the last known live/finished result
// instead of falling back to stale "scheduled" from data.json.
const CV_KEY = 'wc-cv-states'

function loadCvCache() {
  try { return JSON.parse(localStorage.getItem(CV_KEY) ?? '{}') } catch { return {} }
}

// Purge CV cache entries for matches whose corrected UTC start time is still
// in the future.  Called once on startup so stale entries from a previously
// wrong match time never survive a data.json schedule correction.
function purgeStaleCvEntries() {
  const cache = loadCvCache()
  if (!Object.keys(cache).length) return
  const now = serverNow()
  const purged = {}
  for (const [key, val] of Object.entries(cache)) {
    // Find the real scheduled UTC time for this match pair
    const [home, away] = key.split('_')
    const match = staticData.matches.find(
      m => m.team_home === home && m.team_away === away
    )
    if (!match) continue
    const scheduledUtc = new Date(`${match.date}T${match.time}:00Z`).getTime()
    if (scheduledUtc <= now) purged[key] = val   // keep only past matches
  }
  try { localStorage.setItem(CV_KEY, JSON.stringify(purged)) } catch {}
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

// ── Parse ESPN displayClock ("82:15", "45+3:21") → integer play-minute ────────
function parseDisplayClock(clock) {
  if (!clock) return null
  const withPlus = clock.match(/^(\d+)\+(\d+)/)
  if (withPlus) return parseInt(withPlus[1]) + parseInt(withPlus[2])
  const plain = clock.match(/^(\d+)/)
  if (plain) return parseInt(plain[1])
  return null
}

// ── Time-based live status ────────────────────────────────────────────────────
// Priority 1: ESPN real broadcast minute (extrapolated from last fetch timestamp)
// Priority 2: Wall-clock elapsed from kickoff (fallback when ESPN is unavailable)
// Never overwrites a confirmed "finished" match.
function applyTimeBasedStatus(matches, espnMinCache) {
  const nowMs = serverNow()
  return matches.map(match => {
    if (match.status === 'finished') return match

    const override       = LIVE_OVERRIDES[match.id]
    const scheduledStart = new Date(`${match.date}T${match.time}:00Z`)
    const actualStart    = override?.kickoff_offset_min
      ? new Date(scheduledStart.getTime() + override.kickoff_offset_min * 60_000)
      : scheduledStart

    const elapsed = (nowMs - actualStart.getTime()) / 60_000
    if (elapsed < 0) return { ...match, status: 'scheduled' }

    if (elapsed >= 145) {
      // Very conservative backstop — only fires if NO data source has confirmed
      // the match is finished after 145 min elapsed (group stage max ~125 min).
      // In practice Sofascore / openfootball will set status='finished' long before this.
      return {
        ...match, status: 'finished',
        score_home: override?.score_home ?? match.score_home ?? null,
        score_away: override?.score_away ?? match.score_away ?? null,
        goals:      override?.goals      ?? match.goals      ?? [],
      }
    }

    // ── Minute: prefer real ESPN broadcast clock, extrapolate forward ──────
    const key    = `${match.team_home}_${match.team_away}`
    const cached = espnMinCache?.[key]
    let minute

    if (cached && (nowMs - cached.fetchedAt) < 4 * 60_000) {
      // Real data from ESPN — add seconds elapsed since the fetch
      const playMin = Math.min(130, cached.playMin + Math.floor((nowMs - cached.fetchedAt) / 60_000))
      minute = `${playMin}'`
    } else {
      // Fallback: wall-clock calculation (play_time = elapsed − 15 min HT)
      if      (elapsed <= 45) minute = `${Math.max(1, Math.floor(elapsed))}'`
      else if (elapsed <= 60) minute = 'HT'
      else                    minute = `${Math.floor(45 + (elapsed - 60))}'`
    }

    return {
      ...match, status: 'live', minute,
      score_home: override?.score_home ?? match.score_home ?? null,
      score_away: override?.score_away ?? match.score_away ?? null,
      goals:      override?.goals      ?? match.goals      ?? [],
    }
  })
}

// ── Cross-validation merge ────────────────────────────────────────────────────
// Applies cached live/finished states ONLY for matches whose UTC kickoff time
// has already passed.  This prevents a stale cache entry (from a previously
// wrong match time) from making a future match appear live or finished.
function applyCrossValidation(matches, cvCache) {
  if (!Object.keys(cvCache).length) return matches
  const now = serverNow()
  return matches.map(m => {
    // A match already confirmed finished in current data never regresses
    if (m.status === 'finished') return m
    // Never override a future match — cache might be stale
    const scheduledUtc = new Date(`${m.date}T${m.time}:00Z`).getTime()
    if (scheduledUtc > now) return m
    const key    = `${m.team_home}_${m.team_away}`
    const cached = cvCache[key]
    if (!cached) return m
    // FT TRANSITION FIX: if CV cache confirmed the match is finished,
    // override even if the live API still shows it as "live" (API is lagging).
    if (cached.status === 'finished') {
      return {
        ...m,
        status:     'finished',
        score_home: cached.score_home,
        score_away: cached.score_away,
        minute:     cached.minute,
        goals:      cached.goals?.length > 0 ? cached.goals : (m.goals ?? []),
      }
    }
    // Live API is authoritative for currently-live matches
    if (m.status === 'live') return m
    // scheduled → live/finished: apply CV cache
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
      const sh = m.score_home ?? '?'
      const sa = m.score_away ?? '?'
      let text = `🔴 مباشر: ${home?.name ?? m.team_home} ${sh}-${sa} ${away?.name ?? m.team_away} — الدقيقة ${m.minute}`
      if (m.goals?.length > 0 && (Number(sh) > 0 || Number(sa) > 0)) {
        const lastGoal = [...m.goals].sort((a, b) => b.minute - a.minute)[0]
        text += ` — ⚽ ${lastGoal.player} ${lastGoal.minute}'`
      }
      return text
    })
}

function buildResultsNews(matches, teams) {
  const cutoff = Date.now() - 24 * 3600_000
  return matches
    .filter(m => {
      if (m.status !== 'finished' || m.score_home == null) return false
      const endMs = new Date(`${m.date}T${m.time}:00Z`).getTime() + 105 * 60_000
      return endMs > cutoff
    })
    .sort((a, b) => new Date(`${b.date}T${b.time}:00Z`) - new Date(`${a.date}T${a.time}:00Z`))
    .map(m => {
      const home = teams.find(t => t.id === m.team_home)?.name ?? m.team_home
      const away = teams.find(t => t.id === m.team_away)?.name ?? m.team_away
      let text = `📋 النتيجة النهائية: ${home} ${m.score_home}-${m.score_away} ${away}`
      if (m.goals?.length > 0) {
        const scorers = [...m.goals]
          .sort((a, b) => a.minute - b.minute)
          .map(g => `${g.player} ${g.minute}'`)
          .join('، ')
        text += ` — ⚽ ${scorers}`
      }
      return text
    })
}

function buildNews(matches, teams, rssItems) {
  const cutoff = Date.now() - 24 * 3600_000
  const isFresh = ts => !ts || new Date(ts).getTime() > cutoff

  // Newest hardcoded items first
  const freshHardcoded = HARDCODED_NEWS
    .filter(item => isFresh(item.timestamp))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(item => item.text)

  const liveNews   = buildAutoNews(matches, teams)
  const resultNews = buildResultsNews(matches, teams)  // already sorted newest first

  // When RSS is unavailable fall back to static news, filtered by age
  const base = rssItems ?? staticData.news
    .filter(item => isFresh(typeof item === 'object' ? item.timestamp : null))
    .map(item => typeof item === 'object' ? item.text : item)

  // Priority: live (most urgent) → hardcoded results (newest first) →
  // auto-results not already in hardcoded → WC26 RSS
  const combined = [
    ...liveNews,
    ...freshHardcoded,
    ...resultNews.filter(n => {
      // Extract "HOME X-Y AWAY" before any goalscorer suffix (— ⚽ ...)
      const afterLabel = n.replace('📋 النتيجة النهائية: ', '')
      const scorePart  = afterLabel.split(' — ')[0].trim()
      return !freshHardcoded.some(h => h.includes(scorePart))
    }),
    ...base,
  ]
  return [...new Set(combined)].filter(Boolean)
}

export function WorldCupProvider({ children }) {
  const [espnOverrides,  setEspnOverrides]  = useState(null)
  const [espnStandings,  setEspnStandings]  = useState(null)
  const [rssNews,        setRssNews]        = useState(null)
  const [sources,        setSources]        = useState({ scores: false, standings: true, news: !!(staticData.news?.length > 0) })
  const [lastUpdated,    setLastUpdated]    = useState(null)
  const [apiMode,        setApiMode]        = useState('live')
  const cvCacheRef    = useRef(loadCvCache())
  const mdCacheRef    = useRef(loadMdCache())
  // ESPN real-minute cache: { "HOME_AWAY": { playMin, fetchedAt } }
  // Populated whenever ESPN scoreboard returns a live match with a clock.
  // Survives the 30s tick (in-memory only; not localStorage — intentionally fresh each session).
  const espnMinCache  = useRef({})
  const [matchDetails, setMatchDetails] = useState(() => loadMdCache())

  // Last-known-good refs — survive a failed refresh cycle without wiping state
  const prevMatchesRef   = useRef(null)
  const prevStandingsRef = useRef(null)
  const prevNewsRef      = useRef(null)

  // computeData: derive all display data from current state
  const computeData = useCallback((espnMatches, curEspnStandings, rssItems, curMd, curEspnMin) => {
    const md = curMd ?? {}

    const baseMatches = espnMatches
      ? staticData.matches.map(sm => {
          const live = espnMatches.find(
            am => am.team_home === sm.team_home && am.team_away === sm.team_away
          )
          if (!live) return sm
          return {
            ...sm,
            status:         live.status,
            minute:         live.minute         ?? sm.minute,
            score_home:     live.score_home     ?? sm.score_home,
            score_away:     live.score_away     ?? sm.score_away,
            score_ht_home:  live.score_ht_home  ?? sm.score_ht_home ?? null,
            score_ht_away:  live.score_ht_away  ?? sm.score_ht_away ?? null,
            goals: sm.goals?.length > 0 ? sm.goals : (live.goals ?? sm.goals ?? []),
          }
        })
      : staticData.matches

    // Cross-validation: override stale "scheduled" entries with cached live/finished data
    const cvMatches = applyCrossValidation(baseMatches, cvCacheRef.current)

    // Merge ESPN stats/lineups from match-details cache into each match
    const enrichedMatches = cvMatches.map(m => {
      const key    = `${m.team_home}_${m.team_away}`
      const detail = md[key]
      if (!detail) return m
      return {
        ...m,
        stats:  detail.stats  ?? m.stats,
        lineup: detail.lineup ?? m.lineup,
      }
    })

    const matches = applyTimeBasedStatus(enrichedMatches, curEspnMin ?? {}).map(buildAutoEvents)

    // Persist any newly confirmed live/finished states to the CV cache
    saveCvCache(matches)
    cvCacheRef.current = loadCvCache()

    let teams = calculateGroupStandings(matches, staticData.teams)
    if (curEspnStandings) teams = mergeEspnStandings(teams, curEspnStandings)

    const news = buildNews(matches, teams, rssItems)
    return { matches, teams, news, stadiums: staticData.stadiums }
  }, [])

  const [data, setData] = useState(() => computeData(null, null, null, loadMdCache(), {}))

  // ── Global API refresh (60 s) ─────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const currentMd   = mdCacheRef.current
    const needsDetail = new Set(
      staticData.matches
        .filter(m => {
          const elapsed = (serverNow() - new Date(`${m.date}T${m.time}:00Z`)) / 60_000
          return elapsed > 0
        })
        .map(m => `${m.team_home}_${m.team_away}`)
        .filter(key => !currentMd[key]?.stats)
    )

    const [espnMatches, newEspnStandings, fetchedNews, newDetails] = await Promise.all([
      fetchEspnMatches(),
      fetchEspnStandings(),
      fetchRssNews(),
      needsDetail.size > 0 ? fetchMatchDetails(needsDetail) : Promise.resolve(null),
    ])

    // Store real ESPN broadcast minutes with fetch timestamp for extrapolation
    if (espnMatches) {
      const now = serverNow()
      for (const ev of espnMatches) {
        if (ev.status !== 'live' || !ev.minute) continue
        const playMin = parseDisplayClock(ev.minute)
        if (playMin !== null) {
          espnMinCache.current[`${ev.team_home}_${ev.team_away}`] = { playMin, fetchedAt: now }
        }
      }
    }

    if (newDetails) {
      const merged = { ...currentMd, ...newDetails }
      mdCacheRef.current = merged
      saveMdCache(merged)
      setMatchDetails(merged)
    }

    // STATE PRESERVATION: never wipe valid state with a null from a failed fetch.
    // Only commit new data when the API actually returned something.
    // prevRef holds the last known-good value so computeData always gets real data.
    const effectiveMatches   = espnMatches      ?? prevMatchesRef.current
    const effectiveStandings = newEspnStandings ?? prevStandingsRef.current
    const effectiveNews      = fetchedNews      ?? prevNewsRef.current

    if (espnMatches      !== null) { prevMatchesRef.current   = espnMatches;      setEspnOverrides(espnMatches) }
    if (newEspnStandings !== null) { prevStandingsRef.current = newEspnStandings; setEspnStandings(newEspnStandings) }
    if (fetchedNews      !== null) { prevNewsRef.current      = fetchedNews;      setRssNews(fetchedNews) }

    const active = {
      scores:    true,
      standings: true,
      news:      !!(effectiveNews?.length || staticData.news?.length),
    }
    setSources(active)
    setApiMode(active.scores || active.standings || active.news ? 'live' : 'local')

    setData(computeData(effectiveMatches, effectiveStandings, effectiveNews, mdCacheRef.current, espnMinCache.current))
    setLastUpdated(new Date())
  }, [computeData])

  // ── 30-second tick: recompute live minutes (no API call) ──────────────────
  useEffect(() => {
    const tick = () => setData(computeData(espnOverrides, espnStandings, rssNews, mdCacheRef.current, espnMinCache.current))
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [computeData, espnOverrides, espnStandings, rssNews])

  // ── Initial clock sync + load + 60-second API cycle ──────────────────────
  useEffect(() => {
    // Sync clock first, then purge any stale CV cache entries from previous
    // wrong match times, then do the first full refresh
    syncClock().then(() => {
      purgeStaleCvEntries()
      refresh()
    })
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  // ── Self-correction: refresh immediately when app regains focus ───────────
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return (
    <WorldCupCtx.Provider value={{ data, matchDetails, apiMode, lastUpdated, sources, refresh }}>
      {children}
    </WorldCupCtx.Provider>
  )
}

export function useWorldCupData() {
  const ctx = useContext(WorldCupCtx)
  if (!ctx) throw new Error('useWorldCupData must be inside WorldCupProvider')
  return ctx
}
