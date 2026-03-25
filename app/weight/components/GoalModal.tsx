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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowGoalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 w-[90%] max-w-[400px]"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-Fraunces text-xl font-bold text-gray-900 mb-4">
              Set Your Goal 🎯
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-7">
              What's your target weight? This helps track progress and celebrate milestones.
            </p>
            <div className="flex gap-3 mb-6">
              <input
                type="number"
                placeholder={goal ? goal.targetWeight.toString() : `e.g. ${unit === 'kg' ? '75' : '165'}`}
                id="goal-weight"
                className="flex-1 p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-base text-gray-900 font-Plus_Jakarta_Sans outline-none"
              />
              <span className="p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-sm text-gray-600 font-Plus_Jakarta_Sans flex items-center">
                {unit}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 p-3.5 rounded-xl border border-zinc-200/60 bg-[#F9F7F5] text-gray-600 font-Plus_Jakarta_Sans font-semibold text-sm border-[1.5px] cursor-pointer"
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
                className="flex-1 p-3.5 rounded-xl bg-[#1E40AF] text-white font-Plus_Jakarta_Sans font-semibold text-sm border-none cursor-pointer"
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
