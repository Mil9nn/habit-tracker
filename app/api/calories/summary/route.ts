// What this API does:
// - GET: Fetches calorie summary for the authenticated user (daily, weekly, monthly)
// - Returns calories consumed, goal, progress, and recommendations

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getCalorieLogModel, getUserProfileModel } from '@/lib/models'
import { calculateDailyCalorieNeeds, getCalorieGoalInfo } from '@/lib/calorieCalculator'

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

  const CalorieLog = getCalorieLogModel()
  const UserProfile = getUserProfileModel()
  
  const [logs, profile] = await Promise.all([
    CalorieLog.find({
      userId: session.user.email,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 }),
    UserProfile.findOne({ userId: session.user.email })
  ])

  const totalCalories = logs.reduce((sum: number, log: any) => sum + log.calories, 0)
  const totalProtein = logs.reduce((sum: number, log: any) => sum + (log.protein || 0), 0)    // ✅ Calculate macros
  const totalCarbs = logs.reduce((sum: number, log: any) => sum + (log.carbs || 0), 0)        // ✅ Calculate macros
  const totalFat = logs.reduce((sum: number, log: any) => sum + (log.fat || 0), 0)            // ✅ Calculate macros
  
  // Calculate micro-nutrients
  const totalVitamins = logs.reduce((totals: any, log: any) => {
    if (log.vitamins) {
      return {
        vitaminA: (totals.vitaminA || 0) + (log.vitamins.vitaminA || 0),
        vitaminC: (totals.vitaminC || 0) + (log.vitamins.vitaminC || 0),
        vitaminD: (totals.vitaminD || 0) + (log.vitamins.vitaminD || 0),
        vitaminE: (totals.vitaminE || 0) + (log.vitamins.vitaminE || 0),
        vitaminK: (totals.vitaminK || 0) + (log.vitamins.vitaminK || 0),
        thiamin: (totals.thiamin || 0) + (log.vitamins.thiamin || 0),
        riboflavin: (totals.riboflavin || 0) + (log.vitamins.riboflavin || 0),
        niacin: (totals.niacin || 0) + (log.vitamins.niacin || 0),
        vitaminB6: (totals.vitaminB6 || 0) + (log.vitamins.vitaminB6 || 0),
        folate: (totals.folate || 0) + (log.vitamins.folate || 0),
        vitaminB12: (totals.vitaminB12 || 0) + (log.vitamins.vitaminB12 || 0)
      }
    }
    return totals
  }, {})

  const totalMinerals = logs.reduce((totals: any, log: any) => {
    if (log.minerals) {
      return {
        calcium: (totals.calcium || 0) + (log.minerals.calcium || 0),
        iron: (totals.iron || 0) + (log.minerals.iron || 0),
        magnesium: (totals.magnesium || 0) + (log.minerals.magnesium || 0),
        phosphorus: (totals.phosphorus || 0) + (log.minerals.phosphorus || 0),
        potassium: (totals.potassium || 0) + (log.minerals.potassium || 0),
        sodium: (totals.sodium || 0) + (log.minerals.sodium || 0),
        zinc: (totals.zinc || 0) + (log.minerals.zinc || 0),
        copper: (totals.copper || 0) + (log.minerals.copper || 0),
        manganese: (totals.manganese || 0) + (log.minerals.manganese || 0),
        selenium: (totals.selenium || 0) + (log.minerals.selenium || 0)
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
    totalVitamins: Object.keys(totalVitamins).length > 0 ? totalVitamins : undefined,
    totalMinerals: Object.keys(totalMinerals).length > 0 ? totalMinerals : undefined,
    goal,
    progress,
    entryCount: logs.length,
    averageDaily,
    goalInfo
  })
}
