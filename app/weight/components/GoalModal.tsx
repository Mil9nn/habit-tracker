'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Goal {
  targetWeight: number
  startDate: string
  unit: 'kg' | 'lbs'
}

interface GoalModalProps {
  showGoalModal: boolean
  setShowGoalModal: (show: boolean) => void
  goal?: Goal
  unit: string
  setGoal: (goal: Goal | null) => void
}

export default function GoalModal({
  showGoalModal,
  setShowGoalModal,
  goal,
  unit,
  setGoal
}: GoalModalProps) {
  return (
    <AnimatePresence>
      {showGoalModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowGoalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800/95 backdrop-blur-md rounded-2xl p-8 w-[90%] max-w-[400px] border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-Fraunces text-xl font-bold text-white mb-4">
              Set Your Goal 🎯
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-7">
              What's your target weight? This helps track progress and celebrate milestones.
            </p>
            <div className="flex gap-3 mb-6">
              <input
                type="number"
                placeholder={goal ? goal.targetWeight.toString() : `e.g. ${unit === 'kg' ? '75' : '165'}`}
                id="goal-weight"
                className="flex-1 p-3.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 text-base font-Plus_Jakarta_Sans outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <span className="p-3.5 rounded-xl border border-white/20 bg-white/10 text-sm text-gray-300 font-Plus_Jakarta_Sans flex items-center">
                {unit}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 p-3.5 rounded-xl border border-white/20 bg-white/5 text-gray-300 font-Plus_Jakarta_Sans font-semibold text-sm border-[1.5px] cursor-pointer hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('goal-weight') as HTMLInputElement
                  const val = parseFloat(input.value)
                  if (val && !isNaN(val)) {
                    const newGoal = { targetWeight: val, startDate: new Date().toISOString().split('T')[0], unit: unit as 'kg' | 'lbs' }
                    setGoal(newGoal)
                    setShowGoalModal(false)
                  }
                }}
                className="flex-1 p-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-Plus_Jakarta_Sans font-semibold text-sm border-none cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Set Goal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
