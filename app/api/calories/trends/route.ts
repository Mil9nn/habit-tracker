import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getMealLogModel, getUserProfileModel } from '@/lib/models'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'week' // 'week', 'month', 'quarter'

    await connectDB()
    
    const MealLog = getMealLogModel()
    const UserProfile = getUserProfileModel()
    
    // Get user's current goal
    const userProfile = await UserProfile.findOne({ userId: session.user.email })
    const currentGoal = userProfile?.dailyCalorieGoal || userProfile?.calorieGoal || 2000

    // Calculate date range
    const today = new Date()
    let startDate: Date
    let days: number

    switch (period) {
      case 'week':
        days = 7
        break
      case 'month':
        days = 30
        break
      case 'quarter':
        days = 90
        break
      default:
        days = 7
    }

    startDate = subDays(today, days - 1)

    // Fetch logs for the period
    const logs = await MealLog.find({
      userId: session.user.email,
      date: {
        $gte: startOfDay(startDate),
        $lte: endOfDay(today)
      }
    }).sort({ date: 1 })

    // Aggregate daily totals
    const dailyMap = new Map<string, number>()
    
    logs.forEach((log: any) => {
      const dateKey = format(new Date(log.date), 'yyyy-MM-dd')
      const currentTotal = dailyMap.get(dateKey) || 0
      dailyMap.set(dateKey, currentTotal + log.totals.calories)
    })

    // Generate trend data
    const trendData = []
    for (let i = 0; i < days; i++) {
      const date = subDays(today, days - 1 - i)
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayName = format(date, 'EEE')
      const displayDate = format(date, 'MMM d')
      
      const calories = dailyMap.get(dateKey) || 0
      
      trendData.push({
        date: displayDate,
        calories,
        goal: currentGoal,
        dayName
      })
    }

    return NextResponse.json({ 
      data: trendData,
      period,
      stats: {
        avgCalories: Math.round(trendData.reduce((sum, d) => sum + d.calories, 0) / trendData.length),
        avgGoal: currentGoal,
        daysOverGoal: trendData.filter(d => d.calories > currentGoal).length,
        daysUnderGoal: trendData.filter(d => d.calories < currentGoal).length,
        trend: trendData.length > 1 ? 
          (trendData[trendData.length - 1].calories - trendData[0].calories) / trendData[0].calories : 0
      }
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
