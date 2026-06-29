import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import content from '../content.json'
import { recordSession } from '../utils/silentTracker'

export default function OffRamp({ onComplete }) {
  const [farewell, setFarewell] = useState(false)

  const handleReady = () => {
    recordSession()
    setFarewell(true)
    setTimeout(onComplete, 3500)
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-10">
      <AnimatePresence mode="wait">
        {!farewell ? (
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
        ) : (
          <motion.div
            key="farewell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2 } }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 max-w-xs"
          >
            {/* Closing circle */}
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
