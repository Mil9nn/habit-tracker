"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Check, X } from 'lucide-react'

interface WaterEntry {
  _id: string
  userId: string
  amount: number
  unit: string
  date: string
  createdAt: string
  updatedAt: string
}

interface WaterLogProps {
  entries: WaterEntry[]
  onEntryUpdate: (updatedEntry: WaterEntry) => void
  onEntryDelete: (entryId: string) => void
}

export default function WaterLog({ entries, onEntryUpdate, onEntryDelete }: WaterLogProps) {
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')

  const handleEdit = (entry: WaterEntry) => {
    setEditingEntry(entry._id)
    setEditAmount(entry.amount.toString())
  }

  const handleSave = async (entryId: string) => {
    const newAmount = parseFloat(editAmount)
    if (!newAmount || isNaN(newAmount)) return

    try {
      const response = await fetch(`/api/water/entries/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: newAmount,
          unit: 'ml'
        })
      })

      if (response.ok) {
        const data = await response.json()
        onEntryUpdate(data.entry)
        setEditingEntry(null)
        setEditAmount('')
      }
    } catch (error) {
      console.error('Error updating water entry:', error)
    }
  }

  const handleDelete = async (entryId: string) => {
    try {
      const response = await fetch(`/api/water/entries/${entryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onEntryDelete(entryId)
      }
    } catch (error) {
      console.error('Error deleting water entry:', error)
    }
  }

  const handleCancel = () => {
    setEditingEntry(null)
    setEditAmount('')
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Group entries by date
  const groupedEntries = sortedEntries.reduce((groups, entry) => {
    const date = new Date(entry.date).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, WaterEntry[]>)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="mt-4"
    >
      <h3 className="text-gray-600 text-12h mb-2 font-bold tracking-[0.12em]">Water Log</h3>
      
      {Object.keys(groupedEntries).length === 0 ? (
        <p className="text-gray-500 text-center py-8">No water entries yet. Start logging your intake!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedEntries).map(([date, dayEntries]) => (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]" key={date}>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{date}</h4>
              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600 font-semibold">
                        {editingEntry === entry._id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="100"
                            min="0"
                          />
                        ) : (
                          `${entry.amount} ml`
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingEntry === entry._id ? (
                        <>
                          <button
                            onClick={() => handleSave(entry._id)}
                            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </motion.div>
  )
}
