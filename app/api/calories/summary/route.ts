// What this API does:
// - GET: Fetches calorie summary for the authenticated user (daily, weekly, monthly)
// - Returns calories consumed, goal, progress, and recommendations

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getMealLogModel, getUserProfileModel } from '@/lib/models'
import { calculateDailyCalorieNeeds, getCalorieGoalInfo } from '@/lib/calorieCalculator'

// Helper function to round numbers to avoid floating point precision issues
const roundNumber = (num: number, decimals: number = 1): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'daily'
  const targetDate = searchParams.get('date')

  await connectDB()
  
  let startDate: Date
  let endDate: Date
  
  if (targetDate && period === 'daily') {
    // Use the specific date provided
    startDate = new Date(targetDate)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(targetDate)
    endDate.setHours(23, 59, 59, 999)
  } else {
    // Use the original logic for weekly/monthly
    const now = new Date()
    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    
    switch (period) {
      case 'daily':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        break
      default:
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
    }
  }

  const MealLog = getMealLogModel()
  const UserProfile = getUserProfileModel()
  
  const [logs, profile] = await Promise.all([
    MealLog.find({
      userId: session.user.email,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }),
    UserProfile.findOne({ userId: session.user.email })
  ])

  const totalCalories = logs.reduce((sum: number, log: any) => sum + log.totals.calories, 0)
  const totalProtein = logs.reduce((sum: number, log: any) => sum + (log.totals.macros.protein || 0), 0)    // ✅ Calculate macros
  const totalCarbs = logs.reduce((sum: number, log: any) => sum + (log.totals.macros.carbs || 0), 0)        // ✅ Calculate macros
  const totalFat = logs.reduce((sum: number, log: any) => sum + (log.totals.macros.fat || 0), 0)            // ✅ Calculate macros
  const totalFiber = logs.reduce((sum: number, log: any) => sum + (log.totals.macros.fiber || 0), 0)          // ✅ Calculate fiber
  
  
  
    
  // Calculate other nutrients
  const totalCholesterol = logs.reduce((sum: number, log: any) => sum + (log.totals.micros.other.cholesterol || 0), 0)
  const totalSugar = logs.reduce((sum: number, log: any) => sum + (log.totals.micros.other.sugar || 0), 0)
  
  // Calculate micro-nutrients
  const totalVitamins = logs.reduce((totals: any, log: any) => {
    if (log.totals.micros.vitamins) {
      return {
        vitaminA: roundNumber((totals.vitaminA || 0) + (log.totals.micros.vitamins.vitaminA || 0)),
        vitaminC: roundNumber((totals.vitaminC || 0) + (log.totals.micros.vitamins.vitaminC || 0)),
        vitaminD: roundNumber((totals.vitaminD || 0) + (log.totals.micros.vitamins.vitaminD || 0)),
        vitaminB6: roundNumber((totals.vitaminB6 || 0) + (log.totals.micros.vitamins.vitaminB6 || 0)),
        vitaminB7: roundNumber((totals.vitaminB7 || 0) + (log.totals.micros.vitamins.vitaminB7 || 0)),
        vitaminB12: roundNumber((totals.vitaminB12 || 0) + (log.totals.micros.vitamins.vitaminB12 || 0))
      }
    }
    return totals
  }, {})

  const totalMinerals = logs.reduce((totals: any, log: any) => {
    if (log.totals.micros.minerals) {
      return {
        iron: roundNumber((totals.iron || 0) + (log.totals.micros.minerals.iron || 0)),
        magnesium: roundNumber((totals.magnesium || 0) + (log.totals.micros.minerals.magnesium || 0)),
        zinc: roundNumber((totals.zinc || 0) + (log.totals.micros.minerals.zinc || 0)),
        calcium: roundNumber((totals.calcium || 0) + (log.totals.micros.minerals.calcium || 0)),
        potassium: roundNumber((totals.potassium || 0) + (log.totals.micros.minerals.potassium || 0)),
        sodium: roundNumber((totals.sodium || 0) + (log.totals.micros.minerals.sodium || 0))
      }
    }
    return totals
  }, {})
  const goal = profile?.dailyCalorieGoal || 2000
  const progress = Math.min((totalCalories / goal) * 100, 100)
  
  // Calculate daily average
  let averageDaily = totalCalories
  if (period === 'weekly') averageDaily = totalCalories / 7
  if (period === 'monthly') averageDaily = totalCalories / 30

  // Get goal info and recommendations
  let goalInfo = null
  if (profile) {
    const calculatedNeeds = calculateDailyCalorieNeeds({
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel
    })
    
    goalInfo = getCalorieGoalInfo(goal, calculatedNeeds)
  }

  return NextResponse.json({
    period,
    startDate,
    endDate,
    totalCalories,
    totalProtein,    // ✅ Return macros
    totalCarbs,      // ✅ Return macros
    totalFat,        // ✅ Return macros
    totalFiber,      // ✅ Return fiber
    totalCholesterol, // ✅ Return cholesterol
    totalSugar,       // ✅ Return sugar
    totalVitamins: Object.keys(totalVitamins).length > 0 ? totalVitamins : undefined,
    totalMinerals: Object.keys(totalMinerals).length > 0 ? totalMinerals : undefined,
    goal,
    progress,
    entryCount: logs.length,
    averageDaily,
    goalInfo
  })
}
