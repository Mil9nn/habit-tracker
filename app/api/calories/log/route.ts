// What this API does:
// - GET: Fetches calorie logs for the authenticated user for a specific date range
// - POST: Creates a new calorie log entry for the authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getMealLogModel } from '@/lib/models'
import { calculateDailyCalorieNeeds } from '@/lib/calorieCalculator'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  await connectDB()
  
  const MealLog = getMealLogModel()
  const query: any = { userId: session.user.email }
  
  if (startDate || endDate) {
    query.date = {}
    if (startDate) query.date.$gte = new Date(startDate)
    if (endDate) query.date.$lte = new Date(endDate)
  }

  const logs = await MealLog.find(query).sort({ date: -1 })
  
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inputText, mealType, foods, totals, date } = await req.json()

  if (!inputText || !mealType || !foods || !totals) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (totals.calories < 0 || totals.calories > 5000) {
    return NextResponse.json({ error: 'Invalid calorie amount' }, { status: 400 })
  }

  await connectDB()
  
  const MealLog = getMealLogModel()
  const logData: any = {
    userId: session.user.email,
    date: date ? new Date(date) : new Date(),
    mealType,
    inputText,
    foods,
    totals,
    method: 'manual'
  }
  

  const log = await MealLog.create(logData)
  

  return NextResponse.json(log, { status: 201 })
}
