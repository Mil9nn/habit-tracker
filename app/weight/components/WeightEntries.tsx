'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Edit2, Trash2 } from 'lucide-react'

interface WeightEntry {
  date: string
  weight: number
}

interface WeightEntriesProps {
  entries: WeightEntry[]
  unit: string
  editingEntry: string | null
  editWeight: string
  onEdit: (date: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (date: string) => void
  setEditWeight: (weight: string) => void
}

export default function WeightEntries({
  entries,
  unit,
  editingEntry,
  editWeight,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  setEditWeight
}: WeightEntriesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="p-4"
    >
      <p className="text-sm font-semibold text-gray-900 mb-4">Recent</p>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {[...entries].reverse().slice(0, 8).map((e, i) => {
            const prev = [...entries].reverse()[i + 1]
            const diff = prev ? +(e.weight - prev.weight).toFixed(1) : null
            return (
              <motion.div
                key={e.date}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.03 }}
                className={`flex justify-between items-center px-4 rounded-md ${i === 0 ? 'bg-zinc-800' : 'bg-zinc-800'}`}
              >
                <span className="text-sm text-gray-600 font-medium">{e.date}</span>
                <div className="flex items-center gap-6 p-3">
                  {diff !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${diff < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                  )}
                  <span className="font-Fraunces text-base font-semibold text-gray-900">
                    {editingEntry === e.date ? (
                      <input
                        type="number"
                        step={0.1}
                        value={editWeight}
                        onChange={e => setEditWeight(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSaveEdit()}
                        onBlur={onSaveEdit}
                        className="w-20 px-2 py-1 rounded-md border border-[#1E40AF] bg-white text-sm text-gray-900 font-Fraunces outline-none"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="text-white">{e.weight}</span> <span className="text-xs font-normal text-gray-400">{unit}</span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editingEntry === e.date ? onCancelEdit() : onEdit(e.date)}
                      className="bg-transparent border-none cursor-pointer text-[#1E40AF] text-sm px-0 py-0 leading-none mr-1"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => onDelete(e.date)}
                      className="bg-transparent border-none cursor-pointer text-red-400 text-sm px-0 py-0 leading-none"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
