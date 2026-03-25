'use client'

import { motion } from 'framer-motion'

interface WeightEntry {
  date: string
  weight: number
}

interface WeightExportProps {
  entries: WeightEntry[]
  unit: string
}

export default function WeightExport({ entries, unit }: WeightExportProps) {
  const handleExport = () => {
    const csv = [
      ['Date', 'Weight', 'Unit'],
      ...entries.map(e => [e.date, e.weight.toString(), unit])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weight-tracker-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.5 }}
      className="text-center mt-8"
    >
      <button
        onClick={handleExport}
        className="px-4 py-2 rounded-lg border border-zinc-200/60 bg-transparent text-gray-400 text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-transparent hover:border-zinc-200/60 hover:text-gray-400"
      >
        📤 Export Data (CSV)
      </button>
    </motion.div>
  )
}
