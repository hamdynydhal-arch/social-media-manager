import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'

const INHALE_MS = 4000
const EXHALE_MS = 6000
const TARGET_CYCLES = 5

function vibrateSoft() {
  if (navigator.vibrate) {
    // Gentle cascading vibration — strongest at start, fades out over exhale
    navigator.vibrate([90, 60, 70, 60, 50, 60, 35, 60, 20, 60, 10])
  }
}

export default function SomaticAnchor({ onComplete }) {
  const [phase, setPhase] = useState('idle') // idle | inhale | exhale
  const [cycles, setCycles] = useState(0)
  const [showAnchor, setShowAnchor] = useState(false)
  const [canProceed, setCanProceed] = useState(false)

  const holdRef = useRef(false)
  const phaseRef = useRef('idle')
  const timerRef = useRef(null)
  const cyclesRef = useRef(0)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const goIdle = () => {
    phaseRef.current = 'idle'
    setPhase('idle')
    setShowAnchor(false)
  }

  const startExhale = () => {
    if (!holdRef.current) { goIdle(); return }
    phaseRef.current = 'exhale'
    setPhase('exhale')
    setShowAnchor(true)
    vibrateSoft()

    timerRef.current = setTimeout(() => {
      setShowAnchor(false)
      cyclesRef.current += 1
      setCycles(cyclesRef.current)
      if (cyclesRef.current >= TARGET_CYCLES) setCanProceed(true)

      if (holdRef.current) startInhale()
      else goIdle()
    }, EXHALE_MS)
  }

  const startInhale = () => {
    if (!holdRef.current) { goIdle(); return }
    phaseRef.current = 'inhale'
    setPhase('inhale')

    timerRef.current = setTimeout(() => {
      if (holdRef.current) startExhale()
      else goIdle()
    }, INHALE_MS)
  }

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

  useEffect(() => () => { holdRef.current = false; clearTimer() }, [])

  // Circle scale: idle=1, inhale=1.6, exhale=1
  const circleAnim = {
    idle: { scale: 1, opacity: 0.6 },
    inhale: {
      scale: 1.62,
      opacity: 0.95,
      transition: { duration: INHALE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
    },
    exhale: {
      scale: 1,
      opacity: 0.65,
      transition: { duration: EXHALE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
    },
  }

  const glowAnim = {
    idle: { scale: 1, opacity: 0 },
    inhale: {
      scale: 1.9,
      opacity: 0.12,
      transition: { duration: INHALE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
    },
    exhale: {
      scale: 1,
      opacity: 0,
      transition: { duration: EXHALE_MS / 1000, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center touch-none select-none">
      {/* Touch target + circle */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 280, height: 280 }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            background: 'radial-gradient(circle, rgba(45,212,191,0.18) 0%, transparent 70%)',
          }}
          animate={phase}
          variants={glowAnim}
          initial="idle"
        />

        {/* Main breathing circle */}
        <motion.div
          className={`rounded-full flex items-center justify-center ${phase === 'idle' ? 'pulse-idle' : ''}`}
          style={{
            width: 180,
            height: 180,
            border: '1.5px solid rgba(45,212,191,0.5)',
            background: 'rgba(10,40,38,0.45)',
            boxShadow: phase !== 'idle' ? '0 0 40px rgba(45,212,191,0.1)' : 'none',
          }}
          animate={phase}
          variants={circleAnim}
          initial="idle"
        >
          <AnimatePresence mode="wait">
            {phase === 'inhale' && (
              <motion.span
                key="in"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7, transition: { delay: 0.3 } }}
                exit={{ opacity: 0 }}
                className="text-teal-300 text-sm tracking-widest"
              >
                شهيق
              </motion.span>
            )}
            {phase === 'exhale' && (
              <motion.span
                key="ex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7, transition: { delay: 0.3 } }}
                exit={{ opacity: 0 }}
                className="text-teal-300 text-sm tracking-widest"
              >
                زفير
              </motion.span>
            )}
            {phase === 'idle' && (
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

      {/* Anchor text — appears & fades during exhale */}
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
        <div
          className="fixed top-8 text-gray-700 text-xs"
          style={{ direction: 'ltr' }}
        >
          {cycles} / {TARGET_CYCLES}
        </div>
      )}

      {/* Proceed — appears after TARGET_CYCLES */}
      <AnimatePresence>
        {canProceed && (
          <motion.button
            key="proceed"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.7 } }}
            onClick={onComplete}
            className="fixed bottom-20 px-10 py-4 rounded-full text-base text-teal-100"
            style={{
              background: 'rgba(15,50,47,0.55)',
              border: '1px solid rgba(45,212,191,0.35)',
            }}
          >
            {content.proceed_button}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip — always present, very dim */}
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
    </div>
  )
}
