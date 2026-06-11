import { useState } from 'react'
import confetti from 'canvas-confetti'
import { playGoalSound, haptic } from '../utils/audioUtils'

function TeamDisplay({ team, score, side }) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'away' ? 'order-3' : ''}`}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
        style={{ background: `${team.color}22`, border: `2px solid ${team.color}44` }}
      >
        {team.flag}
      </div>
      <span className="font-bold text-sm text-center leading-tight text-white">{team.name}</span>
      {score !== null && (
        <span className="text-3xl font-black score-glow text-amber-400">{score}</span>
      )}
    </div>
  )
}

export default function MatchCard({ match, homeTeam, awayTeam, stadium, onClick }) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const isScheduled = match.status === 'scheduled'

  const matchDate = new Date(`${match.date}T${match.time}:00Z`)
  const localTime = matchDate.toLocaleTimeString('ar-SA-u-nu-latn', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const localDate = matchDate.toLocaleDateString('ar-SA-u-nu-latn', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const handleGoalCelebration = (e) => {
    e.stopPropagation()
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'],
    })
    playGoalSound()
    haptic([100, 50, 100, 50, 200])
  }

  const shareViaWhatsApp = (e) => {
    e.stopPropagation()
    const text = isLive || isFinished
      ? `⚽ ${homeTeam.name} ${match.score_home} - ${match.score_away} ${awayTeam.name} | ${match.round} | كأس العالم 2026`
      : `📅 ${homeTeam.name} 🆚 ${awayTeam.name} | ${localDate} ${localTime} | ${match.round} | كأس العالم 2026`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer team-card-hover active:scale-98 select-none"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">{match.round}</span>
        {isLive && (
          <span className="live-badge">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            دقيقة {match.minute}
          </span>
        )}
        {isFinished && (
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">انتهت</span>
        )}
        {isScheduled && (
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            {localDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TeamDisplay team={homeTeam} score={match.score_home} side="home" />

        <div className="flex flex-col items-center flex-shrink-0 gap-1">
          {isScheduled ? (
            <div className="text-center">
              <div className="text-xl font-black text-white">vs</div>
              <div className="text-xs text-slate-400 mt-1">{localTime}</div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-3xl font-black text-white">
              <span>{match.score_home}</span>
              <span className="text-slate-500">-</span>
              <span>{match.score_away}</span>
            </div>
          )}
          {isLive && (
            <button
              onClick={handleGoalCelebration}
              className="text-lg bg-amber-400/20 border border-amber-400/40 rounded-lg px-2 py-0.5 hover:bg-amber-400/30 transition-colors mt-1"
              title="احتفل بهدف!"
            >
              🎉
            </button>
          )}
        </div>

        <TeamDisplay team={awayTeam} score={match.score_away} side="away" />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>🏟️</span>
          <span>{stadium?.city || ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{match.weather?.icon} {match.weather?.temp}°</span>
          <button
            onClick={shareViaWhatsApp}
            className="text-green-400 hover:text-green-300 transition-colors p-1"
            title="مشاركة عبر واتساب"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
