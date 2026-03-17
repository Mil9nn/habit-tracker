// What this API does:
// - GET: Fetches calorie logs for the authenticated user for a specific date range
// - POST: Creates a new calorie log entry for the authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getCalorieLogModel, getUserProfileModel } from '@/lib/models'
import { calculateDailyCalorieNeeds } from '@/lib/calorieCalculator'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  await connectDB()
  
  const CalorieLog = getCalorieLogModel()
  const query: any = { userId: session.user.email }
  
  if (startDate || endDate) {
    query.timestamp = {}
    if (startDate) query.timestamp.$gte = new Date(startDate)
    if (endDate) query.timestamp.$lte = new Date(endDate)
  }

  const logs = await CalorieLog.find(query).sort({ timestamp: -1 })
  
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { foodName, calories, mealType, quantity } = await req.json()

  if (!foodName || !calories || !mealType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (calories < 0 || calories > 5000) {
    return NextResponse.json({ error: 'Invalid calorie amount' }, { status: 400 })
  }

  await connectDB()
  
  const CalorieLog = getCalorieLogModel()
  const log = await CalorieLog.create({
    userId: session.user.email,
    foodName,
    calories,
    mealType,
    quantity,
    timestamp: new Date(),
  })

  return NextResponse.json(log, { status: 201 })
}
