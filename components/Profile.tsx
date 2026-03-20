// app/profile/page.tsx

'use client'

import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const calories = {
    consumed: 1450,
    goal: 2200,
  }

  const percentage = Math.round((calories.consumed / calories.goal) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-4 md:p-8">

      {/* Container */}
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 🔥 Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">Milan Singh</h1>
              <p className="text-sm text-zinc-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* 🔥 Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* 🧠 Calories Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Today's Calories</h2>
                <span className="text-sm text-zinc-400">
                  {percentage}% of goal
                </span>
              </div>

              <Progress value={percentage} className="h-3 mb-4" />

              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Consumed</span>
                <span className="font-medium">{calories.consumed} kcal</span>
              </div>

              <div className="flex justify-between text-sm mt-2">
                <span className="text-zinc-400">Goal</span>
                <span className="font-medium">{calories.goal} kcal</span>
              </div>
            </div>

            {/* 🥗 Macros */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Macros</h2>

              <div className="grid grid-cols-3 gap-4 text-center">

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-zinc-400">Protein</p>
                  <p className="text-lg font-bold">95g</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-zinc-400">Carbs</p>
                  <p className="text-lg font-bold">180g</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-zinc-400">Fats</p>
                  <p className="text-lg font-bold">45g</p>
                </div>

              </div>
            </div>

            {/* 📊 Weekly Chart Placeholder */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Weekly Intake</h2>

              <div className="h-40 flex items-end gap-2">
                {[1200, 1500, 1800, 1700, 2000, 1600, 1450].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-500 to-emerald-300 rounded-md"
                    style={{ height: `${val / 25}px` }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* 🍽️ Meals */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Recent Meals</h2>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span>Eggs + Banana</span>
                  <span>320 kcal</span>
                </div>

                <div className="flex justify-between">
                  <span>Protein Shake</span>
                  <span>240 kcal</span>
                </div>

                <div className="flex justify-between">
                  <span>Chapati + Sabzi</span>
                  <span>420 kcal</span>
                </div>

              </div>
            </div>

            {/* 🤖 AI Insight */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-400/10 border border-green-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-2">AI Insight</h2>

              <p className="text-sm text-zinc-300">
                You're doing great with protein intake 💪. 
                Slightly reduce carbs in dinner to stay within your calorie goal.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}