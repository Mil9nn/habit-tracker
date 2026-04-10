// What this API does:
// - PUT: Updates an existing calorie log entry
// - DELETE: Deletes a calorie log entry

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getMealLogModel } from '@/lib/models'

export async function PUT(req: Request, context: { params: Promise<{ id: string }>}) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const { inputText, mealType, foods, totals } = await req.json()

  if (!inputText || !mealType || !foods || !totals) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (totals.calories < 0 || totals.calories > 5000) {
    return NextResponse.json({ error: 'Invalid calorie amount' }, { status: 400 })
  }

  await connectDB()
  
  const MealLog = getMealLogModel()
  const logData: any = {
    inputText,
    mealType,
    foods,
    totals,
    method: 'manual'
  }

  const log = await MealLog.findOneAndUpdate(
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
  
  const MealLog = getMealLogModel()
  const log = await MealLog.findOneAndDelete({
    _id: id,
    userId: session.user.email
  })

  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Log deleted successfully' })
}
