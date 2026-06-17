#!/usr/bin/env node
/**
 * update-data.mjs — تحديث تلقائي لبيانات كأس العالم 2026
 * Sources: openfootball (scores) · Wikipedia (coaches) · Reddit (news)
 * Translation: Google Translate free endpoint (no API key)
 * Node 20+ required (native fetch)
 */

import fs   from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.resolve(__dirname, '../src/data/data.json')

const OFB_URL    = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
const REDDIT_URL = 'https://www.reddit.com/r/worldcup/new.json?limit=30&t=day'

// ── Google Translate free endpoint ────────────────────────────────────────────
async function translateToArabic(text) {
  if (!text?.trim()) return text
  if (/[؀-ۿ]/.test(text)) return text  // already Arabic
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`
    const res  = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WCDataBot/1.0)' },
      signal:  AbortSignal.timeout(8000),
    })
    if (!res.ok) return text
    const d = await res.json()
    // Response: [[["Arabic","English",...], ...], ...]
    return d?.[0]?.map(seg => seg?.[0] ?? '').join('').trim() || text
  } catch { return text }
}

// ── openfootball team name → internal ID (all 48 WC 2026 teams) ───────────────
const OFB_MAP = {
  Mexico: 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  Canada: 'CAN', 'Bosnia & Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH',
  Qatar: 'QAT', Switzerland: 'SUI', Brazil: 'BRA', Morocco: 'MAR',
  Haiti: 'HAI', Scotland: 'SCO', USA: 'USA', 'United States': 'USA',
  Paraguay: 'PAR', Australia: 'AUS', Turkey: 'TUR', 'Türkiye': 'TUR',
  Germany: 'GER', 'Curaçao': 'CUW', Curacao: 'CUW',
  "Côte d'Ivoire": 'CIV', "Cote d'Ivoire": 'CIV', 'Ivory Coast': 'CIV',
  Ecuador: 'ECU', Netherlands: 'NED', Japan: 'JPN', Sweden: 'SWE',
  Tunisia: 'TUN', Belgium: 'BEL', Egypt: 'EGY', Iran: 'IRN',
  'New Zealand': 'NZL', Spain: 'ESP', 'Cape Verde': 'CPV',
  'Saudi Arabia': 'KSA', Uruguay: 'URU', France: 'FRA', Senegal: 'SEN',
  Iraq: 'IRQ', Norway: 'NOR', Argentina: 'ARG', Algeria: 'ALG',
  Austria: 'AUT', Jordan: 'JOR', Portugal: 'POR', 'DR Congo': 'COD',
  'Congo DR': 'COD', 'Democratic Republic of Congo': 'COD',
  Uzbekistan: 'UZB', Colombia: 'COL', England: 'ENG',
  Croatia: 'CRO', Ghana: 'GHA', Panama: 'PAN',
}

// ── Wikipedia pages for all 48 coaches ───────────────────────────────────────
const WIKI_PAGES = {
  MEX: 'Mexico_national_football_team',
  RSA: 'South_Africa_national_football_team',
  KOR: 'South_Korea_national_football_team',
  CZE: 'Czech_Republic_national_football_team',
  CAN: "Canada_men%27s_national_soccer_team",
  BIH: 'Bosnia_and_Herzegovina_national_football_team',
  QAT: 'Qatar_national_football_team',
  SUI: 'Switzerland_national_football_team',
  BRA: 'Brazil_national_football_team',
  MAR: 'Morocco_national_football_team',
  HAI: 'Haiti_national_football_team',
  SCO: 'Scotland_national_football_team',
  USA: "United_States_men%27s_national_soccer_team",
  PAR: 'Paraguay_national_football_team',
  AUS: 'Australia_national_football_team',
  TUR: 'Turkey_national_football_team',
  GER: 'Germany_national_football_team',
  CUW: 'Cura%C3%A7ao_national_football_team',
  CIV: 'Ivory_Coast_national_football_team',
  ECU: 'Ecuador_national_football_team',
  NED: 'Netherlands_national_football_team',
  JPN: 'Japan_national_football_team',
  SWE: 'Sweden_national_football_team',
  TUN: 'Tunisia_national_football_team',
  BEL: 'Belgium_national_football_team',
  EGY: 'Egypt_national_football_team',
  IRN: 'Iran_national_football_team',
  NZL: 'New_Zealand_national_football_team',
  ESP: 'Spain_national_football_team',
  CPV: 'Cape_Verde_national_football_team',
  KSA: 'Saudi_Arabia_national_football_team',
  URU: 'Uruguay_national_football_team',
  FRA: 'France_national_football_team',
  SEN: 'Senegal_national_football_team',
  IRQ: 'Iraq_national_football_team',
  NOR: 'Norway_national_football_team',
  ARG: 'Argentina_national_football_team',
  ALG: 'Algeria_national_football_team',
  AUT: 'Austria_national_football_team',
  JOR: 'Jordan_national_football_team',
  POR: 'Portugal_national_football_team',
  COD: 'Democratic_Republic_of_the_Congo_national_football_team',
  UZB: 'Uzbekistan_national_football_team',
  COL: 'Colombia_national_football_team',
  ENG: 'England_national_football_team',
  CRO: 'Croatia_national_football_team',
  GHA: 'Ghana_national_football_team',
  PAN: 'Panama_national_football_team',
}

// ── Fetch openfootball matches ────────────────────────────────────────────────
async function fetchOFBMatches() {
  try {
    const res  = await fetch(OFB_URL, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const data = await res.json()
    return data.matches?.length
      ? data.matches
      : (data.rounds ?? []).flatMap(r => r.matches ?? [])
  } catch (e) {
    console.error('  ⚠️  openfootball:', e.message)
    return null
  }
}

// ── Fetch Reddit r/worldcup posts ─────────────────────────────────────────────
async function fetchRedditPosts() {
  try {
    const res  = await fetch(REDDIT_URL, {
      headers: { 'User-Agent': 'worldcup-data-bot/1.0 (automated update)' },
      signal:  AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.data?.children ?? [])
      .filter(p => p.data.score >= 5 && !p.data.is_self)
      .slice(0, 10)
      .map(p => ({ title: p.data.title, ts: p.data.created_utc * 1000 }))
  } catch { return [] }
}

// ── Fetch coach name from Wikipedia wikitext ──────────────────────────────────
async function fetchCoachFromWiki(pageTitle) {
  try {
    const url  = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${pageTitle}&rvslots=main`
    const res  = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return null
    const json = await res.json()
    const page = Object.values(json?.query?.pages ?? {})[0]
    const wt   = page?.revisions?.[0]?.slots?.main?.['*']
              ?? page?.revisions?.[0]?.['*']
              ?? ''
    if (!wt) return null

    // Try multiple infobox field names (head_coach, coach, manager)
    const patterns = [
      /\|\s*head_coach\s*=\s*(.+?)(?=\n\s*\||\n\s*\}|\n\n)/i,
      /\|\s*coach\s*=\s*(.+?)(?=\n\s*\||\n\s*\}|\n\n)/i,
      /\|\s*manager\s*=\s*(.+?)(?=\n\s*\||\n\s*\}|\n\n)/i,
    ]
    for (const pat of patterns) {
      const m = wt.match(pat)
      if (!m) continue
      const raw = m[1]
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')  // [[link|name]] → name
        .replace(/\{\{[^}]*\}\}/g, '')                       // remove {{templates}}
        .replace(/<[^>]+>/g, '')                             // remove HTML
        .replace(/\s*\(.*?\)/g, '')                          // remove (birth date...) etc.
        .trim()
      if (raw && raw.length > 2 && raw.length < 60) return raw
    }
    return null
  } catch { return null }
}

// ── Recalculate all team standings from finished matches ──────────────────────
function recalcStandings(data) {
  for (const t of data.teams) {
    t.stats = { played: 0, wins: 0, draws: 0, losses: 0,
                goals_for: 0, goals_against: 0, points: 0 }
  }
  for (const m of data.matches) {
    if (m.status !== 'finished' || m.score_home == null || m.score_away == null) continue
    const home = data.teams.find(t => t.id === m.team_home)
    const away = data.teams.find(t => t.id === m.team_away)
    if (!home || !away) continue
    const gh = Number(m.score_home), ga = Number(m.score_away)
    home.stats.played++;  away.stats.played++
    home.stats.goals_for     += gh;  home.stats.goals_against += ga
    away.stats.goals_for     += ga;  away.stats.goals_against += gh
    if (gh > ga) {
      home.stats.wins++;  home.stats.points += 3;  away.stats.losses++
    } else if (gh < ga) {
      away.stats.wins++;  away.stats.points += 3;  home.stats.losses++
    } else {
      home.stats.draws++;  home.stats.points++
      away.stats.draws++;  away.stats.points++
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now()
  console.log(`\n🚀 بدء تحديث بيانات كأس العالم 2026`)
  console.log(`   الوقت: ${new Date().toISOString()}\n`)

  const raw  = await fs.readFile(DATA_FILE, 'utf8')
  const data = JSON.parse(raw)
  let changed = false

  // ─── 1 · نتائج المباريات من openfootball ──────────────────────────────────
  console.log('⚽ [1/3] تحديث نتائج المباريات من openfootball...')
  const ofbMatches = await fetchOFBMatches()
  if (ofbMatches) {
    let updated = 0
    for (const ofbM of ofbMatches) {
      if (!ofbM.score?.ft) continue
      const homeId = OFB_MAP[ofbM.team1]
      const awayId = OFB_MAP[ofbM.team2]
      if (!homeId || !awayId) continue

      const local = data.matches.find(m => m.team_home === homeId && m.team_away === awayId)
      if (!local || local.status === 'finished') continue

      const sh = Number(ofbM.score.ft[0])
      const sa = Number(ofbM.score.ft[1])
      local.status        = 'finished'
      local.score_home    = sh
      local.score_away    = sa
      local.score_ht_home = ofbM.score.ht?.[0] != null ? Number(ofbM.score.ht[0]) : null
      local.score_ht_away = ofbM.score.ht?.[1] != null ? Number(ofbM.score.ht[1]) : null

      // Translate goal-scorer names and build goals array
      const goals = []
      for (const g of (ofbM.goals1 ?? [])) {
        const player = await translateToArabic(g.name ?? '')
        goals.push({ team: homeId, player, minute: parseInt(g.minute) || 0,
                     type: g.owngoal ? 'هدف ذاتي' : 'عادي' })
      }
      for (const g of (ofbM.goals2 ?? [])) {
        const player = await translateToArabic(g.name ?? '')
        goals.push({ team: awayId, player, minute: parseInt(g.minute) || 0,
                     type: g.owngoal ? 'هدف ذاتي' : 'عادي' })
      }
      if (goals.length > 0) local.goals = goals.sort((a, b) => a.minute - b.minute)

      console.log(`  ✅ ${homeId} ${sh}–${sa} ${awayId}`)
      updated++
      changed = true
    }
    if (updated === 0) console.log('  ℹ️  لا نتائج جديدة')
    else recalcStandings(data)
  } else {
    console.log('  ⚠️  تعذّر الوصول إلى openfootball')
  }

  // ─── 2 · أسماء المدربين من Wikipedia ──────────────────────────────────────
  console.log('\n👨‍💼 [2/3] تحديث أسماء المدربين من Wikipedia...')
  let coachCount = 0
  for (const [id, page] of Object.entries(WIKI_PAGES)) {
    const engName = await fetchCoachFromWiki(page)
    if (!engName) continue

    const arName = await translateToArabic(engName)
    if (!arName || arName === engName) continue  // translation failed

    const team = data.teams.find(t => t.id === id)
    if (!team || team.coach === arName) continue  // unchanged

    console.log(`  ✅ ${id}: "${team.coach}" ← "${arName}" (${engName})`)
    team.coach = arName
    coachCount++
    changed = true

    await new Promise(r => setTimeout(r, 400))  // be polite to Wikipedia
  }
  if (coachCount === 0) console.log('  ℹ️  لا تحديثات للمدربين')

  // ─── 3 · أخبار عاجلة من Reddit r/worldcup ────────────────────────────────
  console.log('\n📰 [3/3] جلب الأخبار من Reddit r/worldcup...')
  const posts = await fetchRedditPosts()
  if (posts.length > 0) {
    const existingSet = new Set(data.news.map(n => n.text))
    const newItems    = []
    for (const p of posts) {
      const arText = await translateToArabic(p.title)
      if (!arText || existingSet.has(arText)) continue
      newItems.push({ text: arText, timestamp: new Date(p.ts).toISOString() })
    }
    if (newItems.length > 0) {
      data.news = [...newItems, ...data.news].slice(0, 20)
      console.log(`  ✅ تمت إضافة ${newItems.length} خبر جديد`)
      changed = true
    } else {
      console.log('  ℹ️  لا أخبار جديدة')
    }
  } else {
    console.log('  ⚠️  تعذّر جلب الأخبار من Reddit')
  }

  // ─── حفظ ─────────────────────────────────────────────────────────────────
  console.log()
  if (changed) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ تم حفظ التحديثات في data.json (${elapsed}ث)`)
  } else {
    console.log('ℹ️  البيانات محدّثة بالفعل — لا تغييرات')
  }
}

main().catch(e => {
  console.error('\n❌ خطأ في التحديث:', e.message)
  process.exit(1)
})
