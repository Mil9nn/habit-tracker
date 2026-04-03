"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BadgePlus } from "lucide-react"

export default function WeightLogInput({
  weight,
  setWeight,
  unit,
  setUnit,
  onLog,
  logged
}: any) {
  const [value, setValue] = useState(weight || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const num = parseFloat(value)
    if (!num || isNaN(num)) return

    setIsSubmitting(true)
    try {
      onLog(value, unit)
      setWeight(value)
      setValue("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-10">

      {/* Inline Input */}
      <div className="flex items-center gap-4">
        
        {/* Input */}
        <div className="flex items-center gap-2 w-32">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="65.5"
            className="w-full px-2 text-black/80 border-b-2 border-zinc-500 focus:border-blue-500 transition-colors outline-none text-sm"
          />

          <span className="text-sm text-zinc-600">{unit}</span>
        </div>
        
        {/* Button */}
        <motion.button
          onClick={handleSubmit}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          disabled={isSubmitting || !value}
          className="flex items-center gap-1 text-blue-500 text-sm font-medium disabled:opacity-50"
        >
          {logged ? "✓" : "Log weight"}
          <BadgePlus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}