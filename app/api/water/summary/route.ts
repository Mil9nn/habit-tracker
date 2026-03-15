// What this API does:
// - GET: Fetches water consumption summary for the authenticated user
// Returns daily, weekly, and monthly statistics

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getWaterLogModel, getWaterGoalModel } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'daily'
  
  await connectDB()
  
  const now = new Date()
  let startDate: Date
  let endDate: Date = new Date(now)
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
  
  const WaterLog = getWaterLogModel()
  const WaterGoal = getWaterGoalModel()
  
  const logs = await WaterLog.find({
    userId: session.user.email,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 })
  
  const totalAmount = logs.reduce((sum: number, log: any) => sum + log.amountMl, 0)
  
  const goal = await WaterGoal.findOne({ userId: session.user.email })
  const targetMl = goal?.targetMl || 2000
  
  const progress = Math.min((totalAmount / targetMl) * 100, 100)
  
  const dailyStats: { [key: string]: number } = {}
  logs.forEach((log: any) => {
    const dateKey = log.date.toISOString().split('T')[0]
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = 0
    }
    dailyStats[dateKey] += log.amountMl
  })
  
  return NextResponse.json({
    period,
    startDate,
    endDate,
    totalAmount,
    targetMl,
    progress,
    entryCount: logs.length,
    dailyStats,
    averageDaily: period === 'daily' ? totalAmount : totalAmount / (period === 'weekly' ? 7 : 30)
  })
}