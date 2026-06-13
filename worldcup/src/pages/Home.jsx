import { useState, useMemo, useEffect } from 'react'
import MatchCard from '../components/MatchCard'
import MatchModal from '../components/MatchModal'
import NewsTicker from '../components/NewsTicker'
import { useWorldCupData } from '../context/WorldCupContext'

function useCountdown(targetISO) {
  const [diff, setDiff] = useState(() => new Date(targetISO) - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(targetISO) - Date.now()), 1000)
    return () => clearInterval(id)
  }, [targetISO])
  return diff
}

function NextMatchCountdown({ match, homeTeam, awayTeam }) {
  const diff = useCountdown(`${match.date}T${match.time}:00Z`)
  if (diff <= 0) return null
  const totalSec = Math.floor(diff / 1000)
  const days    = Math.floor(totalSec / 86400)
  const hours   = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="card p-4 border-amber-500/20 bg-gradient-to-r from-amber-900/15 to-transparent">
      <p className="text-xs text-amber-400 font-bold text-center mb-2">⏱️ العد التنازلي للمباراة القادمة</p>
      <div className="flex items-center justify-center gap-2 mb-3 text-sm font-bold text-white">
        <span className="text-xl">{homeTeam?.flag}</span>
        <span>{homeTeam?.name}</span>
        <span className="text-slate-500 text-xs px-1">vs</span>
        <span>{awayTeam?.name}</span>
        <span className="text-xl">{awayTeam?.flag}</span>
      </div>
      <div className="flex items-end justify-center gap-2">
        {days > 0 && (
          <>
            <div className="text-center">
              <div className="text-3xl font-black text-white tabular-nums">{days}</div>
              <div className="text-xs text-slate-400">يوم</div>
            </div>
            <div className="text-slate-500 text-2xl font-black mb-4">:</div>
          </>
        )}
        <div className="text-center">
          <div className="text-3xl font-black text-white tabular-nums">{pad(hours)}</div>
          <div className="text-xs text-slate-400">ساعة</div>
        </div>
        <div className="text-slate-500 text-2xl font-black mb-4">:</div>
        <div className="text-center">
          <div className="text-3xl font-black text-amber-400 tabular-nums">{pad(minutes)}</div>
          <div className="text-xs text-slate-400">دقيقة</div>
        </div>
        <div className="text-slate-500 text-2xl font-black mb-4">:</div>
        <div className="text-center">
          <div className="text-3xl font-black text-amber-400 tabular-nums">{pad(seconds)}</div>
          <div className="text-xs text-slate-400">ثانية</div>
        </div>
      </div>
    </div>
  )
}

function getTeam(teams, id) { return teams.find(t => t.id === id) }
function getStadium(stadiums, id) { return stadiums.find(s => s.id === id) }

export default function Home({ favoriteTeams = [], installState = {} }) {
  const { data, apiMode } = useWorldCupData()
  const { teams, matches, stadiums } = data
  const { isInstalled, isIOS, triggerInstall } = installState

  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showIOSModal, setShowIOSModal] = useState(false)

  // Always show install banner when not yet installed
  const canInstall = !isInstalled

  const handleInstall = async () => {
    if (isIOS) { setShowIOSModal(true); return }
    // triggerInstall checks both React state AND window.deferredPrompt
    const ok = await triggerInstall?.()
    if (ok === false && !window.deferredPrompt) {
      // No native prompt available: guide user to manual install via Settings
      window.location.hash = '/settings'
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const liveMatches = useMemo(() => matches.filter(m => m.status === 'live'), [matches])

  const nextScheduledMatch = useMemo(
    () => matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0] ?? null,
    [matches]
  )

  const todayMatches = useMemo(
    () => matches.filter(m => m.date === today && m.status !== 'live'),
    [matches, today]
  )

  const isFav = (m) => favoriteTeams.length > 0 &&
    (favoriteTeams.includes(m.team_home) || favoriteTeams.includes(m.team_away))

  const upcomingMatches = useMemo(() => {
    const sorted = matches
      .filter(m => m.status === 'scheduled' && m.date >= today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

    if (favoriteTeams.length > 0) {
      const fav    = sorted.filter(isFav)
      const others = sorted.filter(m => !isFav(m))
      return [...fav, ...others].slice(0, 6)
    }
    return sorted.slice(0, 6)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, JSON.stringify(favoriteTeams), today])

  const recentMatches = useMemo(
    () => matches.filter(m => m.status === 'finished').slice(0, 4),
    [matches]
  )

  const favTeamsData = favoriteTeams.length > 0
    ? favoriteTeams.map(id => getTeam(teams, id)).filter(Boolean)
    : []

  return (
    <div className="flex flex-col min-h-full">
      <NewsTicker news={data.news} />

      <div className="flex-1 px-4 py-4 space-y-6 pb-24">

        {/* ── Download / Install banner ── */}
        {canInstall && (
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)', border: '2px solid rgba(129,140,248,0.4)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
            <div className="px-5 pt-5 pb-2 text-center">
              <div className="text-5xl mb-2 animate-bounce">📲</div>
              <h2 className="text-xl font-black text-white leading-tight mb-1">
                نزّل التطبيق على أندرويد
              </h2>
              <p className="text-indigo-200 text-sm font-bold mb-1">
                إشعارات الأهداف والمباريات مباشرةً على شاشتك
              </p>
              <p className="text-indigo-300/70 text-xs leading-relaxed">
                أهداف فورية • اهتزاز وصوت صافرة • يعمل بدون إنترنت
              </p>
            </div>
            <div className="px-4 pb-4 pt-3 space-y-2">
              {/* Primary: Download APK */}
              <a
                href="https://github.com/hamdynydhal-arch/social-media-manager/releases/download/apk-latest/app-release.apk"
                download
                className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 4px 20px rgba(99,102,241,0.5)', textDecoration: 'none', display: 'flex' }}
              >
                <span>⬇️ تنزيل APK أندرويد</span>
              </a>
              {/* Secondary: PWA install if prompt available */}
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="w-full py-2.5 rounded-xl font-bold text-indigo-300 text-sm transition-all active:scale-95 border border-indigo-500/30"
                  style={{ background: 'rgba(99,102,241,0.1)' }}
                >
                  أو أضف إلى الشاشة الرئيسية (PWA)
                </button>
              )}
              {isIOS && (
                <p className="text-center text-indigo-400/60 text-xs">
                  iOS: افتح في Safari ← مشاركة ← أضف إلى الشاشة الرئيسية
                </p>
              )}
            </div>
          </div>
        )}

        {/* API status pill */}
        {apiMode === 'live' && (
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">بيانات حية</span>
          </div>
        )}

        {/* ── Next match countdown ── */}
        {nextScheduledMatch && (
          <NextMatchCountdown
            match={nextScheduledMatch}
            homeTeam={getTeam(teams, nextScheduledMatch.team_home)}
            awayTeam={getTeam(teams, nextScheduledMatch.team_away)}
          />
        )}

        {/* ── Favorite teams cards ── */}
        {favTeamsData.length > 0 && (
          <div className="space-y-3">
            {favTeamsData.map(favTeamData => (
              <div key={favTeamData.id} className="card p-4 border-emerald-500/30 bg-gradient-to-r from-emerald-900/30 to-transparent">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{favTeamData.flag}</span>
                  <div>
                    <p className="text-xs text-emerald-400 font-bold">منتخبك المفضل</p>
                    <p className="text-xl font-black text-white">{favTeamData.name}</p>
                    <p className="text-xs text-slate-400">المدرب: {favTeamData.coach}</p>
                  </div>
                  <div className="mr-auto text-center">
                    <div className="text-2xl font-black text-amber-400">{favTeamData.stats.points}</div>
                    <div className="text-xs text-slate-400">نقاط</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-center">
                  {[
                    { label: 'انتصارات', val: favTeamData.stats.wins, color: 'text-emerald-400' },
                    { label: 'تعادل', val: favTeamData.stats.draws, color: 'text-slate-300' },
                    { label: 'خسائر', val: favTeamData.stats.losses, color: 'text-red-400' },
                    { label: 'أهداف', val: favTeamData.stats.goals_for, color: 'text-amber-400' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex-1 bg-slate-700/50 rounded-xl p-2">
                      <div className={`text-lg font-black ${color}`}>{val}</div>
                      <div className="text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="live-badge">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                مباشر الآن
              </span>
              <span className="text-slate-400 text-sm">{liveMatches.length} مباراة</span>
            </div>
            <div className="space-y-3">
              {liveMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(teams, m.team_home)}
                  awayTeam={getTeam(teams, m.team_away)}
                  stadium={getStadium(stadiums, m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                  isFav={isFav(m)}
                />
              ))}
            </div>
          </section>
        )}

        {todayMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              📅 مباريات اليوم
            </h2>
            <div className="space-y-3">
              {todayMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(teams, m.team_home)}
                  awayTeam={getTeam(teams, m.team_away)}
                  stadium={getStadium(stadiums, m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                  isFav={isFav(m)}
                />
              ))}
            </div>
          </section>
        )}

        {todayMatches.length === 0 && liveMatches.length === 0 && (
          <div className="card p-6 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-slate-400">لا توجد مباريات اليوم</p>
            <p className="text-slate-500 text-sm mt-1">تحقق من الجدول الزمني أدناه</p>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              🗓️ المباريات القادمة
              {favTeamsData.length > 0 && <span className="text-xs text-emerald-400 font-normal">(منتخباتك أولاً)</span>}
            </h2>
            <div className="space-y-3">
              {upcomingMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(teams, m.team_home)}
                  awayTeam={getTeam(teams, m.team_away)}
                  stadium={getStadium(stadiums, m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                  isFav={isFav(m)}
                />
              ))}
            </div>
          </section>
        )}

        {recentMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">🏁 نتائج أخيرة</h2>
            <div className="space-y-3">
              {recentMatches.map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  homeTeam={getTeam(teams, m.team_home)}
                  awayTeam={getTeam(teams, m.team_away)}
                  stadium={getStadium(stadiums, m.stadium_id)}
                  onClick={() => setSelectedMatch(m)}
                  isFav={isFav(m)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          homeTeam={getTeam(teams, selectedMatch.team_home)}
          awayTeam={getTeam(teams, selectedMatch.team_away)}
          stadium={getStadium(stadiums, selectedMatch.stadium_id)}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* iOS install instructions modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-md mb-4 mx-4 rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white text-lg">كيفية التثبيت على iPhone</h3>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:text-white"
                >✕</button>
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', icon: '⎋', text: 'اضغط زر المشاركة في شريط أدوات Safari السفلي' },
                  { step: '2', icon: '➕', text: 'اختر "إضافة إلى الشاشة الرئيسية" من القائمة' },
                  { step: '3', icon: '✅', text: 'اضغط "إضافة" في أعلى يمين الشاشة' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-center gap-3 bg-slate-700/50 rounded-2xl p-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400 font-black text-sm">{step}</span>
                    </div>
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <span className="text-slate-300 text-sm leading-snug">{text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full mt-5 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }}
              >
                فهمت، شكراً!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
