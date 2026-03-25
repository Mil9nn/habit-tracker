'use client'

import { motion } from 'framer-motion'

interface WeightStatsProps {
  current?: number
  avg7?: string
  totalChange?: number | null
  unit: string
  changeYesterday?: number | null
  changeLastWeek?: number | null
  bmiValue?: number | null
}

export default function WeightStats({
  current,
  avg7,
  totalChange,
  unit,
  changeYesterday,
  changeLastWeek,
  bmiValue
}: WeightStatsProps) {
  const stats = [
    {
      label: 'Current',
      value: current ? `${current}` : '—',
      suffix: current ? unit : '',
      color: '#1C1917',
      subtext: changeYesterday !== null && changeYesterday !== undefined ?
        `${changeYesterday > 0 ? '+' : ''}${changeYesterday} ${unit} vs yesterday` :
        'No comparison'
    },
    {
      label: '7-Day Avg',
      value: avg7 ?? '—',
      suffix: avg7 ? unit : '',
      color: '#1C1917',
      subtext: changeLastWeek !== null && changeLastWeek !== undefined ?
        `${changeLastWeek > 0 ? '+' : ''}${changeLastWeek} ${unit} vs last week` :
        'No comparison'
    },
    {
      label: 'Total Change',
      value: totalChange !== null && totalChange !== undefined ? `${totalChange > 0 ? '+' : ''}${totalChange}` : '—',
      suffix: totalChange !== null ? unit : '',
      color: totalChange !== null && totalChange !== undefined ? (totalChange < 0 ? 'rgb(34, 197, 94)' : totalChange > 0 ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)') : 'rgb(107, 114, 128)',
      subtext: bmiValue && bmiValue > 0 ? `BMI: ${bmiValue}` : 'No height data'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="grid grid-cols-3 gap-2 mb-5 mobile-stats"
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl p-5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.05)] ${i === 2 && !bmiValue ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <p className="text-gray-600 text-xs font-bold tracking-[0.09em] uppercase mb-2">
            {s.label}
          </p>
          <p className="font-Fraunces text-2xl font-bold" style={{ color: s.color, lineHeight: 1 }}>
            {s.value}
            {s.suffix && <span className="text-sm font-normal text-gray-400 ml-1">{s.suffix}</span>}
          </p>
          <p className="text-gray-400 text-xs font-medium mt-1">
            {s.subtext}
          </p>
        </div>
      ))}
    </motion.div>
  )
}
