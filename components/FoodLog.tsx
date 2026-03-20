'use client'

import { CalorieLog } from './CalorieTracker'

interface FoodLogProps {
  logs: CalorieLog[]
  selectedDate: string
}

export function FoodLog({ logs, selectedDate }: FoodLogProps) {
  return (
    <div className="rounded-2xl mt-2 border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
          {selectedDate === new Date().toISOString().split('T')[0]
            ? "Today's Log"
            : `${new Date(selectedDate).toLocaleDateString()} Log`}
        </h3>
      </div>

      {/* Content */}
      {logs.length > 0 ? (
        <div className="space-y-1.5">
          {logs.slice(0, 5).map((log) => (
            <div
              key={log._id}
              className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 font-medium truncate">
                  <span className="text-zinc-500 font-normal mr-1">
                    {log.quantity}×
                  </span>
                  {log.foodName}
                </p>

                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Macros Display */}
                {(log.protein || log.carbs || log.fat) && (
                  <div className="flex gap-3 mt-1">
                    {log.protein && (
                      <span className="text-xs text-[#06d6a0] font-medium">
                        P: {log.protein}g
                      </span>
                    )}
                    {log.carbs && (
                      <span className="text-xs text-[#118ab2] font-medium">
                        C: {log.carbs}g
                      </span>
                    )}
                    {log.fat && (
                      <span className="text-xs text-[#ef476f] font-medium">
                        F: {log.fat}g
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="ml-3 shrink-0">
                <span className="text-sm font-semibold text-amber-600">
                  {log.calories}
                  <span className="text-xs font-medium text-zinc-400 ml-1">
                    kcal
                  </span>
                </span>
              </div>
            </div>
          ))}

          {/* More indicator */}
          {logs.length > 5 && (
            <div className="text-center text-xs text-zinc-400 pt-2">
              +{logs.length - 5} more entries
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-zinc-400">
            No food entries for this date
          </p>
        </div>
      )}
    </div>
  )
}
