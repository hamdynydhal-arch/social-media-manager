import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'
import { loadSettings, saveSettings, getTimings } from '../utils/settings.js'

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState(settings)

  const handleSave = () => {
    saveSettings(local)
    onSave(local)
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } }}
        exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } }}
        className="w-full max-w-xs mx-5 rounded-2xl p-6 flex flex-col gap-6"
        style={{ background: '#0a1a1a', border: '1px solid rgba(45,212,191,0.2)' }}
      >
        <p className="text-teal-300 text-sm text-center tracking-wider opacity-70">
          {content.settings_title}
        </p>

        {/* Breath mode */}
        <div className="flex flex-col gap-3">
          {[
            { key: 'normal', title: content.settings_mode_normal, desc: content.settings_mode_normal_desc },
            { key: '478',    title: content.settings_mode_478,    desc: content.settings_mode_478_desc },
          ].map(({ key, title, desc }) => (
            <button
              key={key}
              onClick={() => setLocal((s) => ({ ...s, breathMode: key }))}
              className="w-full text-right px-4 py-3 rounded-xl transition-colors"
              style={{
                background: local.breathMode === key ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${local.breathMode === key ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <p className="text-sm text-gray-200">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Vibration toggle */}
        <button
          onClick={() => setLocal((s) => ({ ...s, vibration: !s.vibration }))}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-sm text-gray-300">{content.settings_vibration}</span>
          <div
            className="w-10 h-5 rounded-full relative transition-colors duration-300"
            style={{ background: local.vibration ? 'rgba(45,212,191,0.6)' : 'rgba(255,255,255,0.15)' }}
          >
            <motion.div
              animate={{ x: local.vibration ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
            />
          </div>
        </button>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-full text-sm text-teal-100"
          style={{ background: 'rgba(15,50,47,0.7)', border: '1px solid rgba(45,212,191,0.3)' }}
        >
          {content.settings_save}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SomaticAnchor({ onComplete, onOpenDashboard }) {
  const [settings, setSettings] = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | inhale | hold | exhale
  const [cycles, setCycles] = useState(0)
  const [showAnchor, setShowAnchor] = useState(false)
  const [canProceed, setCanProceed] = useState(false)

  const holdRef     = useRef(false)
  const phaseRef    = useRef('idle')
  const timerRef    = useRef(null)
  const cyclesRef   = useRef(0)
  const settingsRef = useRef(settings)
  // Long-press on title to open dashboard
  const titleTimerRef = useRef(null)
  const [titlePress, setTitlePress] = useState(false)

  useEffect(() => { settingsRef.current = settings }, [settings])

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }

  const goIdle = useCallback(() => {
    phaseRef.current = 'idle'
    setPhase('idle')
    setShowAnchor(false)
  }, [])

  const doVibrate = useCallback(() => {
    if (settingsRef.current.vibration && navigator.vibrate) {
      navigator.vibrate([90, 60, 70, 60, 50, 60, 35, 60, 20, 60, 10])
    }
  }, [])

  const startExhale = useCallback(() => {
    if (!holdRef.current) { goIdle(); return }
    const { exhaleMs, targetCycles } = getTimings(settingsRef.current.breathMode)
    phaseRef.current = 'exhale'
    setPhase('exhale')
    setShowAnchor(true)
    doVibrate()

    timerRef.current = setTimeout(() => {
      setShowAnchor(false)
      cyclesRef.current += 1
      setCycles(cyclesRef.current)
      if (cyclesRef.current >= targetCycles) setCanProceed(true)
      if (holdRef.current) startInhale()
      else goIdle()
    }, exhaleMs)
  }, [goIdle, doVibrate])

  const startHold = useCallback(() => {
    if (!holdRef.current) { goIdle(); return }
    const { holdMs } = getTimings(settingsRef.current.breathMode)
    phaseRef.current = 'hold'
    setPhase('hold')

    timerRef.current = setTimeout(() => {
      if (holdRef.current) startExhale()
      else goIdle()
    }, holdMs)
  }, [goIdle, startExhale])

  const startInhale = useCallback(() => {
    if (!holdRef.current) { goIdle(); return }
    const { inhaleMs } = getTimings(settingsRef.current.breathMode)
    phaseRef.current = 'inhale'
    setPhase('inhale')

    timerRef.current = setTimeout(() => {
      if (!holdRef.current) { goIdle(); return }
      if (settingsRef.current.breathMode === '478') startHold()
      else startExhale()
    }, inhaleMs)
  }, [goIdle, startHold, startExhale])

  const handlePressStart = (e) => {
    e.preventDefault()
    holdRef.current = true
    if (phaseRef.current === 'idle') startInhale()
  }

  const handlePressEnd = (e) => {
    e.preventDefault()
    holdRef.current = false
    clearTimer()
    goIdle()
  }

  const handleOpenSettings = () => {
    holdRef.current = false
    clearTimer()
    goIdle()
    setShowSettings(true)
  }

  // Long press on title → dashboard
  const handleTitleDown = () => {
    setTitlePress(true)
    titleTimerRef.current = setTimeout(() => {
      setTitlePress(false)
      onOpenDashboard?.()
    }, 3000)
  }
  const handleTitleUp = () => {
    setTitlePress(false)
    if (titleTimerRef.current) { clearTimeout(titleTimerRef.current); titleTimerRef.current = null }
  }

  useEffect(() => () => {
    holdRef.current = false
    clearTimer()
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current)
  }, [])

  // Dynamic animation variants based on current settings
  const { inhaleMs, exhaleMs } = getTimings(settings.breathMode)
  const ease = [0.4, 0, 0.2, 1]

  const circleVariants = {
    idle:   { scale: 1,    opacity: 0.6 },
    inhale: { scale: 1.62, opacity: 0.95, transition: { duration: inhaleMs / 1000, ease } },
    hold:   { scale: 1.62, opacity: 0.88, transition: { duration: 0.4 } },
    exhale: { scale: 1,    opacity: 0.65, transition: { duration: exhaleMs / 1000, ease } },
  }
  const glowVariants = {
    idle:   { scale: 1,   opacity: 0 },
    inhale: { scale: 1.9, opacity: 0.12, transition: { duration: inhaleMs / 1000, ease } },
    hold:   { scale: 1.9, opacity: 0.08, transition: { duration: 0.4 } },
    exhale: { scale: 1,   opacity: 0,    transition: { duration: exhaleMs / 1000, ease } },
  }

  const { targetCycles } = getTimings(settings.breathMode)
  const phaseLabels = { inhale: 'شهيق', hold: 'احبس', exhale: 'زفير' }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center touch-none select-none relative">

      {/* App title — long press triggers dashboard */}
      <motion.div
        className="absolute top-8 flex flex-col items-center gap-1 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        onPointerDown={handleTitleDown}
        onPointerUp={handleTitleUp}
        onPointerLeave={handleTitleUp}
        onPointerCancel={handleTitleUp}
      >
        <span className="text-teal-300 text-sm tracking-widest">{content.app_title}</span>
        {/* Progress bar for long press feedback */}
        {titlePress && (
          <motion.div
            className="h-px bg-teal-500/50 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        )}
      </motion.div>

      {/* Gear icon */}
      <motion.button
        className="absolute top-7 left-6 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.7 }}
        whileTap={{ scale: 0.9 }}
        transition={{ delay: 2 }}
        onClick={handleOpenSettings}
        aria-label="إعدادات التنفس"
      >
        ⚙️
      </motion.button>

      {/* Breathing circle */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 280, height: 280 }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(45,212,191,0.18) 0%, transparent 70%)',
          }}
          animate={phase}
          variants={glowVariants}
          initial="idle"
        />
        <motion.div
          className={`rounded-full flex items-center justify-center ${phase === 'idle' ? 'pulse-idle' : ''}`}
          style={{
            width: 180, height: 180,
            border: '1.5px solid rgba(45,212,191,0.5)',
            background: 'rgba(10,40,38,0.45)',
            boxShadow: phase !== 'idle' ? '0 0 40px rgba(45,212,191,0.1)' : 'none',
          }}
          animate={phase}
          variants={circleVariants}
          initial="idle"
        >
          <AnimatePresence mode="wait">
            {phase !== 'idle' ? (
              <motion.span
                key={phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7, transition: { delay: 0.25 } }}
                exit={{ opacity: 0 }}
                className="text-teal-300 text-sm tracking-widest"
              >
                {phaseLabels[phase]}
              </motion.span>
            ) : (
              <motion.div
                key="dot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="w-2 h-2 rounded-full bg-teal-400"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Instruction */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.p
            key="inst"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.4, y: 0, transition: { duration: 0.8 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="mt-10 text-gray-400 text-sm text-center leading-8 max-w-[200px]"
          >
            {content.instruction}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Anchor text during exhale */}
      <AnimatePresence>
        {showAnchor && (
          <motion.p
            key="anchor-phrase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.4, ease: 'easeIn' } }}
            exit={{ opacity: 0, transition: { duration: 2.2, ease: 'easeOut' } }}
            className="absolute text-teal-100 text-xl text-center font-light leading-loose"
            style={{ bottom: '22%', letterSpacing: '0.04em' }}
          >
            {content.anchor_phrase}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Cycle counter */}
      {cycles > 0 && (
        <div className="fixed top-8 text-gray-700 text-xs" style={{ direction: 'ltr' }}>
          {cycles} / {targetCycles}
        </div>
      )}

      {/* Proceed button */}
      <AnimatePresence>
        {canProceed && (
          <motion.button
            key="proceed"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.7 } }}
            onClick={onComplete}
            className="fixed bottom-20 px-10 py-4 rounded-full text-base text-teal-100"
            style={{ background: 'rgba(15,50,47,0.55)', border: '1px solid rgba(45,212,191,0.35)' }}
          >
            {content.proceed_button}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        whileHover={{ opacity: 0.5 }}
        transition={{ delay: 1.5 }}
        onClick={onComplete}
        className="fixed bottom-7 text-gray-500 text-xs"
      >
        {content.skip_button}
      </motion.button>

      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            settings={settings}
            onSave={(s) => {
              setSettings(s)
              setCycles(0)
              cyclesRef.current = 0
              setCanProceed(false)
            }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
