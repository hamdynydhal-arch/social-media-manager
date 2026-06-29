import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'

export default function CognitiveCards({ onReady }) {
  const [selected, setSelected] = useState(null)

  const card = selected !== null ? content.cognitive_cards[selected] : null

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {/* Card selection */}
        {!card && (
          <motion.div
            key="chooser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="flex flex-col gap-4 w-full max-w-sm"
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
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.15 + i * 0.13, duration: 0.5 },
                }}
                whileTap={{ scale: 0.975 }}
                onClick={() => setSelected(i)}
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
            className="flex flex-col items-center gap-7 max-w-sm w-full"
          >
            {/* Verse */}
            <motion.p
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.8 } }}
              className="text-3xl text-center text-teal-200 font-light"
              style={{ lineHeight: '2.2rem' }}
            >
              {card.verse}
            </motion.p>

            {/* Divider */}
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
              className="text-center text-sm text-gray-300 leading-loose max-w-xs whitespace-pre-line"
            >
              {card.note}
            </motion.p>

            {/* Ready button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 1.1, duration: 0.6 } }}
              whileTap={{ scale: 0.97 }}
              onClick={onReady}
              className="w-full py-4 rounded-full text-base text-teal-100 mt-2"
              style={{
                background: 'rgba(15,50,47,0.55)',
                border: '1px solid rgba(45,212,191,0.32)',
              }}
            >
              {content.ready_button}
            </motion.button>

            {/* Back */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3, transition: { delay: 1.3 } }}
              whileHover={{ opacity: 0.6 }}
              onClick={() => setSelected(null)}
              className="text-gray-500 text-xs"
            >
              {content.back_button}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
