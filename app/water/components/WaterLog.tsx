"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Trash2, Check, X, GlassWater } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WaterLog({ entries, onEntryUpdate, onEntryDelete }: any) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")

  const handleEdit = (entry: any) => {
    setEditingEntry(entry._id)
    setEditAmount(entry.amount.toString())
  }

  const handleSave = () => {
    const val = parseFloat(editAmount)
    if (val && !isNaN(val) && val > 0) {
      const entryToUpdate = entries.find((e: any) => e._id === editingEntry)
      if (entryToUpdate) {
        onEntryUpdate({ ...entryToUpdate, amount: val })
        setEditingEntry(null)
        setEditAmount("")
      }
    }
  }

  const handleCancel = () => {
    setEditingEntry(null)
    setEditAmount("")
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groupedEntries = sortedEntries.reduce((groups: any, entry) => {
    const date = new Date(entry.date).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {})

  return (
    <div className="w-full">

      {/* Header */}
      <h3 className="text-sm text-gray-600 mb-3">Today's Water Log</h3>

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">

          {/* Icon */}
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/10 mb-3">
            <GlassWater className="w-6 h-6 text-blue-500" />
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-gray-400">
            No water logged yet
          </p>

          {/* Subtitle */}
          <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
            Start tracking your hydration by adding your first glass of water today.
          </p>

        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedEntries).map(([date, dayEntries]: any) => (
            <div key={date}>

              {/* Date (subtle) */}
              <p className="text-xs text-gray-400 mb-2">{date}</p>

              <ScrollArea className="w-full h-20">
                <div className="space-y-1">
                  {dayEntries.map((entry: any) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between group hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      {/* Left */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-black font-medium">
                          {editingEntry === entry._id ? (
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-16 bg-white/10 border-b border-white/20 outline-none text-sm text-black rounded px-1"
                            />
                          ) : (
                            `${entry.amount} ml`
                          )}
                        </span>

                        <span className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      {/* Actions (hidden until hover) */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        {editingEntry === entry._id ? (
                          <>
                            <button onClick={handleCancel}>
                              <X className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                            </button>
                            <button onClick={handleSave}>
                              <Check className="w-4 h-4 text-emerald-400 hover:text-emerald-300" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(entry)}>
                              <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                            </button>
                            <button onClick={() => onEntryDelete(entry._id)}>
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}