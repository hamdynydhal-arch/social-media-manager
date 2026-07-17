import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'

// ─── Deep Layer (Progressive Disclosure) ──────────────────────────────────────
function DeepLayer({ deep }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      exit={{ height: 0, opacity: 0, transition: { duration: 0.35 } }}
      className="overflow-hidden"
    >
      <div
        className="mt-4 rounded-xl p-4 flex flex-col gap-3"
        style={{ background: 'rgba(10,30,28,0.7)', border: '1px solid rgba(45,212,191,0.12)' }}
      >
        {/* Fallacy tag */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full text-teal-400"
            style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}
          >
            {deep.fallacy}
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-loose">{deep.fallacy_desc}</p>

        <div className="h-px bg-teal-900/40" />

        {/* Anchor story */}
        <p className="text-xs text-teal-500 opacity-70">{deep.anchor}</p>
        <p className="text-xs text-gray-400 leading-loose">{deep.story}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CognitiveCards({ onReady }) {
  const [selected, setSelected] = useState(null)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [showDeep, setShowDeep] = useState(false)

  const card = selected !== null ? content.cognitive_cards[selected] : null

  const handleSelect = (i) => {
    const c = content.cognitive_cards[i]
    const r = c.responses[Math.floor(Math.random() * c.responses.length)]
    setSelected(i)
    setSelectedResponse(r)
    setShowDeep(false)
  }

  const handleReady = () => {
    onReady(card?.id || null)
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6 overflow-y-auto">
      <div className="w-full max-w-sm py-8">
        <AnimatePresence mode="wait">
          {/* Card selection */}
          {!card && (
            <motion.div
              key="chooser"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="flex flex-col gap-4"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.42, transition: { delay: 0.2 } }}
                className="text-center text-sm text-gray-400 mb-1"
              >
                {content.cognitive_prompt}
              </motion.p>

              {content.cognitive_cards.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.13, duration: 0.5 } }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => handleSelect(i)}
                  className="w-full py-5 px-6 rounded-2xl text-right text-base text-gray-200"
                  style={{
                    background: 'rgba(12,28,28,0.65)',
                    border: '1px solid rgba(45,212,191,0.18)',
                    lineHeight: '1.8',
                  }}
                >
                  {c.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Card detail */}
          {card && (
            <motion.div
              key={`card-${card.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="flex flex-col items-center gap-5"
            >
              {/* Verse */}
              <motion.p
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.8 } }}
                className="text-3xl text-center text-teal-200 font-light"
                style={{ lineHeight: '2.2rem' }}
              >
                {selectedResponse?.verse}
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, transition: { delay: 0.5, duration: 0.6 } }}
                className="h-px bg-teal-900/60 w-2/3"
                style={{ transformOrigin: 'center' }}
              />

              {/* Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.62, transition: { delay: 0.75, duration: 0.7 } }}
                className="text-center text-sm text-gray-300 leading-loose whitespace-pre-line"
              >
                {selectedResponse?.note}
              </motion.p>

              {/* Progressive disclosure toggle */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.38, transition: { delay: 1 } }}
                whileHover={{ opacity: 0.7 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDeep((v) => !v)}
                className="text-teal-400 text-xs border-b border-teal-900/50 pb-0.5 leading-none"
              >
                {showDeep ? content.deep_close : content.deep_button}
              </motion.button>

              {/* Deep layer */}
              <div className="w-full">
                <AnimatePresence>
                  {showDeep && <DeepLayer key="deep" deep={card.deep} />}
                </AnimatePresence>
              </div>

              {/* Ready button */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 1.1, duration: 0.6 } }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReady}
                className="w-full py-4 rounded-full text-base text-teal-100 mt-1"
                style={{ background: 'rgba(15,50,47,0.55)', border: '1px solid rgba(45,212,191,0.32)' }}
              >
                {content.ready_button}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3, transition: { delay: 1.3 } }}
                whileHover={{ opacity: 0.6 }}
                onClick={() => { setSelected(null); setSelectedResponse(null); setShowDeep(false) }}
                className="text-gray-500 text-xs"
              >
                {content.back_button}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
