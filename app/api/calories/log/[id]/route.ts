// What this API does:
// - PUT: Updates an existing calorie log entry
// - DELETE: Deletes a calorie log entry

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getCalorieLogModel } from '@/lib/models'

export async function PUT(req: Request, context: { params: Promise<{ id: string }>}) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const { foodName, calories, mealType, quantity, protein, carbs, fat, isMeal, mealItems } = await req.json()

  if (!foodName || !calories || !mealType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (calories < 0 || calories > 5000) {
    return NextResponse.json({ error: 'Invalid calorie amount' }, { status: 400 })
  }

  await connectDB()
  
  const CalorieLog = getCalorieLogModel()
  const logData: any = {
    foodName,
    calories,
    protein: protein || 0,
    carbs: carbs || 0,
    fat: fat || 0,
    mealType,
    quantity,
    isMeal: isMeal || false
  }

  // Add meal items if it's a meal
  if (isMeal && mealItems) {
    logData.mealItems = mealItems
  }

  const log = await CalorieLog.findOneAndUpdate(
    { _id: id, userId: session.user.email },
    logData,
    { new: true }
  )

  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  return NextResponse.json(log)
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }>}) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params

  await connectDB()
  
  const CalorieLog = getCalorieLogModel()
  const log = await CalorieLog.findOneAndDelete({
    _id: id,
    userId: session.user.email
  })

  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Log deleted successfully' })
}
