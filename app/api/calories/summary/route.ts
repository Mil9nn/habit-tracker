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
    goal,
    progress,
    entryCount: logs.length,
    averageDaily,
    goalInfo
  })
}
