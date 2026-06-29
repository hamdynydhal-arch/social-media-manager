import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'
import { recordSession } from '../utils/silentTracker'

// phase: 'ready' → 'input' → 'dissolving' → 'farewell'
export default function OffRamp({ fearId, onComplete }) {
  const [step, setStep] = useState('ready')
  const [fearText, setFearText] = useState('')
  const [dissolveText, setDissolveText] = useState('')
  const inputRef = useRef(null)

  const handleReady = () => {
    setStep('input')
    setTimeout(() => inputRef.current?.focus(), 400)
  }

  const handleDelegate = () => {
    const text = fearText.trim() || 'ما في قلبي'
    setDissolveText(text)
    setStep('dissolving')
  }

  const handleSkipInput = () => {
    recordSession(fearId)
    setStep('farewell')
    setTimeout(onComplete, 3500)
  }

  const handleDissolveComplete = () => {
    recordSession(fearId)
    setStep('farewell')
    setTimeout(onComplete, 3500)
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-8">
      <AnimatePresence mode="wait">

        {/* Step 1: "أنا مستعد" button */}
        {step === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="flex flex-col items-center"
          >
            <motion.button
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.9 } }}
              whileTap={{ scale: 0.96 }}
              onClick={handleReady}
              className="px-14 py-5 rounded-full text-xl text-teal-100"
              style={{
                background: 'rgba(15,50,47,0.55)',
                border: '1.5px solid rgba(45,212,191,0.38)',
                letterSpacing: '0.03em',
              }}
            >
              {content.ready_button}
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Delegation input */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="flex flex-col items-center gap-6 w-full max-w-sm"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5, transition: { delay: 0.3 } }}
              className="text-center text-sm text-gray-400 leading-loose"
            >
              {content.delegation_label}
            </motion.p>

            <motion.textarea
              ref={inputRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.45 } }}
              value={fearText}
              onChange={(e) => setFearText(e.target.value)}
              placeholder={content.delegation_placeholder}
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-gray-200 text-center resize-none leading-loose focus:outline-none"
              style={{
                background: 'rgba(10,30,28,0.6)',
                border: '1px solid rgba(45,212,191,0.2)',
                caretColor: 'rgba(45,212,191,0.8)',
              }}
            />

            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDelegate}
              className="w-full py-4 rounded-full text-base text-teal-100"
              style={{ background: 'rgba(15,50,47,0.6)', border: '1px solid rgba(45,212,191,0.32)' }}
            >
              {content.delegation_button}
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25, transition: { delay: 0.8 } }}
              whileHover={{ opacity: 0.5 }}
              onClick={handleSkipInput}
              className="text-gray-600 text-xs"
            >
              {content.delegation_skip}
            </motion.button>
          </motion.div>
        )}

        {/* Step 3: Text dissolution */}
        {step === 'dissolving' && (
          <motion.div
            key="dissolving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            {/* The text that dissolves — visual metaphor for releasing the burden */}
            <motion.p
              className="text-lg text-gray-300 text-center max-w-xs leading-loose"
              initial={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              animate={{
                opacity: 0,
                filter: 'blur(18px)',
                y: -20,
                transition: { duration: 2.2, ease: 'easeIn' },
              }}
              onAnimationComplete={handleDissolveComplete}
            >
              {dissolveText}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35, transition: { delay: 0.6, duration: 1 } }}
              className="text-xs text-teal-500 text-center"
            >
              تُودَع إلى حفظ الله..
            </motion.p>
          </motion.div>
        )}

        {/* Step 4: Farewell */}
        {step === 'farewell' && (
          <motion.div
            key="farewell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2 } }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 max-w-xs"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.35, transition: { duration: 1 } }}
              className="w-16 h-16 rounded-full"
              style={{ border: '1px solid rgba(45,212,191,0.5)' }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.9 } }}
              className="text-center text-base text-gray-300 leading-loose whitespace-pre-line"
              style={{ lineHeight: '2.1rem' }}
            >
              {content.farewell}
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
