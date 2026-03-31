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
    <div className="w-full max-w-xl mx-auto mt-4">
      
      {/* Label */}
      <span className="text-sm text-zinc-500">
        Log weight
      </span>

      {/* Inline Input */}
      <div className="flex items-center gap-3 mt-1">
        
        {/* Input */}
        <div className="relative w-32">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="65.5"
            className="w-full outline-none text-zinc-400 text-sm"
          />

          {/* Base line */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-200" />

          {/* Focus line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-blue-500"
            initial={{ width: 0 }}
            whileFocus={{ width: "100%" }}
            transition={{ duration: 0.25 }}
          />
        </div>

        {/* Unit (static, minimal) */}
        <span className="text-sm text-zinc-500">{unit}</span>

        {/* Button */}
        <motion.button
          onClick={handleSubmit}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          disabled={isSubmitting || !value}
          className="flex items-center gap-1 text-blue-600 text-sm font-medium disabled:opacity-40"
        >
          {logged ? "✓" : "Log"}
          <BadgePlus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}