"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Trash2, Check, X } from "lucide-react"

export default function WaterLog({ entries, onEntryUpdate, onEntryDelete }: any) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")

  const handleEdit = (entry: any) => {
    setEditingEntry(entry._id)
    setEditAmount(entry.amount.toString())
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
    <div className="w-full max-w-xl mx-auto mt-6">
      
      {/* Header */}
      <h3 className="text-sm text-zinc-500 mb-3">Water Log</h3>

      {Object.keys(groupedEntries).length === 0 ? (
        <p className="text-sm text-zinc-400">No entries yet</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedEntries).map(([date, dayEntries]: any) => (
            <div key={date}>
              
              {/* Date (subtle) */}
              <p className="text-xs text-zinc-400 mb-2">{date}</p>

              <div className="space-y-1">
                {dayEntries.map((entry: any) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between py-1 group"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-800 font-medium">
                        {editingEntry === entry._id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-16 bg-transparent border-b border-zinc-300 outline-none text-sm"
                          />
                        ) : (
                          `${entry.amount} ml`
                        )}
                      </span>

                      <span className="text-xs text-zinc-400">
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
                          <button onClick={() => handleCancel()}>
                            <X className="w-4 h-4 text-zinc-500" />
                          </button>
                          <button>
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(entry)}>
                            <Edit2 className="w-4 h-4 text-zinc-400 hover:text-blue-500" />
                          </button>
                          <button onClick={() => onEntryDelete(entry._id)}>
                            <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}